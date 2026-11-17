import { Router } from "express";
import { placeholderSvg } from "../utils/placeholder.js";
import {
  getMentor,
  listCategories,
  listMentors,
  listTestimonials,
  mentorCourses,
  platformStats,
} from "../repositories/catalog.repo.js";
import { findCertificateByCertificateId } from "../repositories/learning.repo.js";
import { findCoupon, listCoupons } from "../repositories/commerce.repo.js";
import { asyncHandler, paginate } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { dbAvailable } from "../config/db.js";
import { applyCoupon } from "../services/payments.js";

const router = Router();

router.get("/placeholder", (req, res) => {
  const { seed, label, hue } = req.query;
  const svg = placeholderSvg({
    seed: String(seed ?? "internshipjunction"),
    label: String(label ?? "InternshipJunction"),
    hue: hue !== undefined ? Number(hue) : undefined,
  });
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  res.send(svg);
});

router.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "internshipjunction-api",
    database: dbAvailable() ? "mysql" : "unavailable",
    time: new Date().toISOString(),
  });
});

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    res.json(await platformStats());
  })
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    res.json(await listCategories());
  })
);

router.get(
  "/testimonials",
  asyncHandler(async (req, res) => {
    const items = await listTestimonials();
    res.json(paginate(items, { page: req.query.page, pageSize: req.query.pageSize ?? 30 }).data);
  })
);

router.get(
  "/mentors",
  asyncHandler(async (_req, res) => {
    res.json(await listMentors());
  })
);

router.get(
  "/mentors/:id",
  asyncHandler(async (req, res) => {
    const mentor = await getMentor(req.params.id);
    if (!mentor) throw ApiError.notFound("Mentor not found.");
    const courses = (await mentorCourses(mentor.id)).map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      thumbnail: course.thumbnail,
      rating: course.rating,
    }));
    res.json({ ...mentor, courses });
  })
);

router.get(
  "/verify-certificate/:certificateId",
  asyncHandler(async (req, res) => {
    const certificate = await findCertificateByCertificateId(req.params.certificateId);
    if (!certificate) {
      throw ApiError.notFound("No certificate found with this ID. Please check and try again.");
    }
    res.json({
      valid: certificate.status === "valid",
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      program: certificate.program,
      programType: certificate.programType,
      issuedAt: certificate.issuedAt,
      grade: certificate.grade,
      status: certificate.status,
      issuedBy: "InternshipJunction Technologies Pvt. Ltd.",
      verifyUrl: `/verify-certificate/${certificate.certificateId}`,
    });
  })
);

router.get(
  "/coupons/validate",
  asyncHandler(async (req, res) => {
    const code = String(req.query.code ?? "").trim().toUpperCase();
    const amount = Number(req.query.amount ?? 0);
    const coupon = await findCoupon(code);
    const coupons = coupon ? [coupon] : [];
    res.json(applyCoupon(coupons, code, amount));
  })
);

router.get(
  "/coupons",
  asyncHandler(async (_req, res) => {
    res.json(await listCoupons());
  })
);

export default router;
