import { Router } from "express";
import {
  getCourseBySlug,
  getFellowshipBySlug,
  getInternshipBySlug,
} from "../repositories/catalog.repo.js";
import {
  createEnrollment,
  createNotification,
  findEnrollment,
} from "../repositories/learning.repo.js";
import {
  createOrderRecord,
  findCoupon,
  getOrderForUser,
  markOrderPaid,
} from "../repositories/commerce.repo.js";
import { audit } from "../repositories/audit.repo.js";
import { asyncHandler } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate } from "../middleware/auth.js";
import { applyCoupon, createOrder, verifyPaymentSignature } from "../services/payments.js";

const router = Router();
router.use(authenticate);

async function resolveProgram({ programType, slug }) {
  if (programType === "course") {
    const course = await getCourseBySlug(slug);
    if (!course) throw ApiError.notFound("Course not found.");
    return {
      id: course.id,
      title: course.title,
      thumbnail: course.thumbnail,
      price: course.price,
      type: "course",
    };
  }
  if (programType === "internship") {
    const internship = await getInternshipBySlug(slug);
    if (!internship) throw ApiError.notFound("Internship not found.");
    return {
      id: internship.id,
      title: internship.title,
      thumbnail: internship.thumbnail,
      price: 4999,
      type: "internship",
    };
  }
  const fellowship = await getFellowshipBySlug(slug);
  if (!fellowship) throw ApiError.notFound("Fellowship not found.");
  return {
    id: fellowship.id,
    title: fellowship.title,
    thumbnail: fellowship.thumbnail,
    price: fellowship.price,
    type: "fellowship",
  };
}

const PLAN_MULTIPLIER = { "self-paced": 1, pro: 1.35, advanced: 1.7 };

router.post(
  "/checkout",
  asyncHandler(async (req, res) => {
    const { programType = "course", slug, plan = "pro", couponCode } = req.body ?? {};
    const program = await resolveProgram({ programType, slug });
    const multiplier = PLAN_MULTIPLIER[plan] ?? 1;
    const baseAmount = Math.round(program.price * multiplier);

    let coupon = { valid: false, discount: 0, total: baseAmount };
    if (couponCode) {
      const stored = await findCoupon(String(couponCode).toUpperCase());
      coupon = applyCoupon(stored ? [stored] : [], String(couponCode).toUpperCase(), baseAmount);
    }
    const amount = coupon.valid ? coupon.total : baseAmount;

    const providerOrder = await createOrder({
      amount,
      receipt: `rcpt_${program.type}_${program.id}_${req.user.id}_${Date.now()}`,
      notes: {
        programType: program.type,
        programId: String(program.id),
        userId: String(req.user.id),
        plan,
      },
    });

    const record = await createOrderRecord({
      userId: req.user.id,
      program: program.title,
      programType: program.type,
      programId: program.id,
      plan,
      baseAmount,
      discount: coupon.discount ?? 0,
      amount,
      couponCode: coupon.valid ? String(couponCode).toUpperCase() : null,
      status: "pending",
      provider: "razorpay",
      providerOrderId: providerOrder.id,
      simulated: Boolean(providerOrder.simulated),
    });

    res.json({
      order: {
        id: providerOrder.id,
        amount: providerOrder.amount,
        currency: providerOrder.currency,
        simulated: providerOrder.simulated,
        keyId: providerOrder.keyId,
      },
      summary: {
        program: program.title,
        plan,
        baseAmount,
        discount: record.discount,
        amount,
        couponApplied: coupon.valid,
        couponMessage: coupon.message ?? null,
      },
      checkoutId: record.id,
    });
  })
);

router.post(
  "/verify",
  asyncHandler(async (req, res) => {
    const { checkoutId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body ?? {};
    const order = await getOrderForUser(checkoutId, req.user.id);
    if (!order) throw ApiError.notFound("Checkout session not found.");
    if (order.status === "paid") throw ApiError.conflict("This order is already paid.");

    const verification = verifyPaymentSignature({
      orderId: razorpayOrderId ?? order.razorpayOrderId,
      paymentId: razorpayPaymentId ?? `pay_sim_${Date.now()}`,
      signature: razorpaySignature,
    });
    if (!verification.verified) throw ApiError.badRequest("Payment verification failed.");

    const paidOrder = await markOrderPaid(order.id, {
      paymentId: razorpayPaymentId ?? order.razorpayPaymentId,
      simulated: verification.simulated,
    });

    let enrollment = await findEnrollment(req.user.id, paidOrder.programType, paidOrder.programId);
    if (!enrollment) {
      enrollment = await createEnrollment({
        userId: req.user.id,
        programType: paidOrder.programType,
        programId: paidOrder.programId,
        title: paidOrder.program,
        thumbnail: `/api/placeholder?seed=${paidOrder.programId}&label=${encodeURIComponent(
          paidOrder.program
        )}`,
        progress: 0,
        plan: paidOrder.plan ?? "self-paced",
        status: "active",
      });
    }

    await createNotification({
      userId: req.user.id,
      title: "Enrollment confirmed",
      message: `You are now enrolled in ${paidOrder.program}. Happy learning!`,
      type: "enrollment",
    });

    await audit(req.user.id, "enroll", paidOrder.programType, paidOrder.programId, {
      orderId: paidOrder.id,
    });

    res.status(201).json({
      enrollment,
      order: { id: paidOrder.id, status: paidOrder.status, amount: paidOrder.amount },
      message: "Payment verified and enrollment created.",
    });
  })
);

export default router;
