import { Router } from "express";
import { getAnalytics } from "../repositories/admin.repo.js";
import {
  deleteUser,
  findUserById,
  listUsers,
  toPublicUser,
  updateUserRole,
} from "../repositories/users.repo.js";
import {
  listCourses,
  listFellowships,
  listInternships,
  listJobs,
} from "../repositories/catalog.repo.js";
import {
  listAllCertificates,
  listAllUserProjects,
  revokeCertificate,
} from "../repositories/learning.repo.js";
import { listAllJobApplications, listApplications } from "../repositories/career.repo.js";
import {
  createCoupon,
  findCoupon,
  listCoupons,
  listOrders,
  refundOrder,
} from "../repositories/commerce.repo.js";
import { audit, listAuditLogs } from "../repositories/audit.repo.js";
import { asyncHandler, paginate } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireRole("admin"));

router.get(
  "/analytics",
  asyncHandler(async (_req, res) => {
    res.json(await getAnalytics());
  })
);

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await listUsers({ role: req.query.role, search: req.query.search });
    res.json(
      paginate(users.map(toPublicUser), { page: req.query.page, pageSize: req.query.pageSize ?? 10 })
    );
  })
);

router.patch(
  "/users/:id/role",
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user) throw ApiError.notFound("User not found.");
    const role = req.body?.role;
    if (!["student", "mentor", "admin"].includes(role)) throw ApiError.badRequest("Invalid role.");
    if (user.role === "super_admin") throw ApiError.forbidden("Cannot modify a super admin.");
    const updated = await updateUserRole(user.id, role);
    await audit(req.user.id, "update-role", "user", updated.id, { role });
    res.json(toPublicUser(updated));
  })
);

router.delete(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user) throw ApiError.notFound("User not found.");
    if (user.role === "super_admin") throw ApiError.forbidden("Cannot delete a super admin.");
    await deleteUser(user.id);
    await audit(req.user.id, "delete", "user", user.id);
    res.json({ message: "User removed.", id: user.id });
  })
);

router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const courses = await listCourses({
      search: req.query.search,
      category: req.query.category,
      includeDraft: true,
    });
    res.json(paginate(courses, { page: req.query.page, pageSize: req.query.pageSize ?? 10 }));
  })
);

router.get(
  "/internships",
  asyncHandler(async (req, res) => {
    const internships = await listInternships({
      search: req.query.search,
      domain: req.query.domain,
    });
    res.json(
      paginate(internships, { page: req.query.page, pageSize: req.query.pageSize ?? 10 })
    );
  })
);

router.get(
  "/fellowships",
  asyncHandler(async (_req, res) => {
    const fellowships = await listFellowships();
    res.json(fellowships.map((item) => ({ ...item, applicants: item.seats - item.seatsLeft })));
  })
);

router.get(
  "/jobs",
  asyncHandler(async (req, res) => {
    const jobs = await listJobs({});
    res.json(paginate(jobs, { page: req.query.page, pageSize: req.query.pageSize ?? 10 }));
  })
);

router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const projects = await listAllUserProjects();
    res.json(paginate(projects, { page: req.query.page, pageSize: req.query.pageSize ?? 10 }));
  })
);

router.get(
  "/applications",
  asyncHandler(async (_req, res) => {
    const [applications, jobApplications] = await Promise.all([
      listApplications(),
      listAllJobApplications(),
    ]);
    res.json({ applications, jobApplications: jobApplications.slice(0, 50) });
  })
);

router.get(
  "/payments",
  asyncHandler(async (req, res) => {
    const orders = await listOrders({
      status: req.query.status && req.query.status !== "all" ? req.query.status : undefined,
    });
    res.json(paginate(orders, { page: req.query.page, pageSize: req.query.pageSize ?? 10 }));
  })
);

router.post(
  "/payments/:id/refund",
  asyncHandler(async (req, res) => {
    const orders = await listOrders({});
    const order = orders.find((item) => item.id === Number(req.params.id));
    if (!order) throw ApiError.notFound("Order not found.");
    if (order.status !== "paid") throw ApiError.badRequest("Only paid orders can be refunded.");
    const refunded = await refundOrder(order.id);
    await audit(req.user.id, "refund", "order", refunded.id);
    res.json(refunded);
  })
);

router.get(
  "/coupons",
  asyncHandler(async (_req, res) => {
    res.json(await listCoupons());
  })
);

router.post(
  "/coupons",
  asyncHandler(async (req, res) => {
    const { code, type, value, maxDiscount } = req.body ?? {};
    if (!code || !type || value === undefined) {
      throw ApiError.badRequest("Code, type and value are required.");
    }
    const normalized = String(code).toUpperCase();
    if (await findCoupon(normalized)) throw ApiError.conflict("Coupon already exists.");
    const coupon = await createCoupon({
      code: normalized,
      type,
      value: Number(value),
      maxDiscount: Number(maxDiscount ?? value),
      active: true,
      description: req.body?.description ?? "",
    });
    await audit(req.user.id, "create", "coupon", coupon.code);
    res.status(201).json(coupon);
  })
);

router.get(
  "/certificates",
  asyncHandler(async (_req, res) => {
    res.json(await listAllCertificates());
  })
);

router.post(
  "/certificates/:id/revoke",
  asyncHandler(async (req, res) => {
    const certificates = await listAllCertificates();
    const certificate = certificates.find((item) => item.id === Number(req.params.id));
    if (!certificate) throw ApiError.notFound("Certificate not found.");
    const revoked = await revokeCertificate(certificate.id);
    await audit(req.user.id, "revoke", "certificate", revoked.id);
    res.json(revoked);
  })
);

router.get(
  "/audit-logs",
  asyncHandler(async (req, res) => {
    const logs = await listAuditLogs();
    res.json(paginate(logs, { page: req.query.page, pageSize: req.query.pageSize ?? 20 }));
  })
);

export default router;
