import { Router } from "express";
import {
  createFellowship,
  decrementFellowshipSeats,
  deleteFellowship,
  findFellowshipById,
  getFellowshipBySlug,
  listFellowships,
  updateFellowship,
} from "../repositories/catalog.repo.js";
import { createApplication, findApplication } from "../repositories/career.repo.js";
import { createNotification } from "../repositories/learning.repo.js";
import { audit } from "../repositories/audit.repo.js";
import { asyncHandler } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await listFellowships());
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const item = await getFellowshipBySlug(req.params.slug);
    if (!item) throw ApiError.notFound("Fellowship not found.");
    res.json(item);
  })
);

router.post(
  "/:slug/apply",
  authenticate,
  asyncHandler(async (req, res) => {
    const fellowship = await getFellowshipBySlug(req.params.slug);
    if (!fellowship) throw ApiError.notFound("Fellowship not found.");
    if (fellowship.seatsLeft <= 0) {
      throw ApiError.badRequest("This cohort is full. Join the waitlist instead.");
    }

    const already = await findApplication(req.user.id, "fellowship", fellowship.id);
    if (already) throw ApiError.conflict("You have already applied to this fellowship.");

    const application = await createApplication({
      applicationNumber: `IJ-APP-${Date.now().toString().slice(-6)}`,
      userId: req.user.id,
      kind: "fellowship",
      programId: fellowship.id,
      slug: fellowship.slug,
      applicantName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
      motivation: req.body?.motivation ?? "",
      status: "applied",
    });

    await decrementFellowshipSeats(fellowship.id);
    await createNotification({
      userId: req.user.id,
      title: "Fellowship application received",
      message: `Your application for ${fellowship.title} was submitted successfully.`,
      type: "application",
    });
    await audit(req.user.id, "apply", "fellowship", fellowship.id);
    res.status(201).json(application);
  })
);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { title, domain } = req.body ?? {};
    if (!title || !domain) throw ApiError.badRequest("Title and domain are required.");
    const slug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (await getFellowshipBySlug(slug)) throw ApiError.conflict("Fellowship already exists.");

    const item = await createFellowship({
      slug,
      title,
      domain,
      cohort: req.body?.cohort ?? "Cohort 1",
      startDate:
        req.body?.startDate ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      duration: req.body?.duration ?? "16 weeks",
      seats: req.body?.seats ?? 30,
      seatsLeft: req.body?.seats ?? 30,
      price: Number(req.body?.price ?? 0),
      originalPrice: Number(req.body?.originalPrice ?? req.body?.price ?? 0),
      thumbnail: `/api/placeholder?seed=${slug}&label=${encodeURIComponent(domain + " Fellowship")}`,
      shortDescription: req.body?.shortDescription ?? "",
      overview: req.body?.overview ?? "",
      highlights: req.body?.highlights ?? [],
      curriculum: req.body?.curriculum ?? [],
      mentors: req.body?.mentors ?? [],
      careerSupport: req.body?.careerSupport ?? [],
      isFeatured: Boolean(req.body?.isFeatured),
    });

    await audit(req.user.id, "create", "fellowship", item.id);
    res.status(201).json(item);
  })
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const item = await findFellowshipById(req.params.id);
    if (!item) throw ApiError.notFound("Fellowship not found.");
    const updated = await updateFellowship(item.id, req.body ?? {});
    await audit(req.user.id, "update", "fellowship", updated.id);
    res.json(updated);
  })
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const item = await findFellowshipById(req.params.id);
    if (!item) throw ApiError.notFound("Fellowship not found.");
    await deleteFellowship(item.id);
    await audit(req.user.id, "delete", "fellowship", item.id);
    res.json({ message: "Fellowship deleted.", id: item.id });
  })
);

export default router;
