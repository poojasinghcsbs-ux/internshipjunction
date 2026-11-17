import { Router } from "express";
import {
  createInternship,
  deleteInternship,
  findInternshipById,
  getInternshipBySlug,
  incrementInternshipApplicants,
  listInternships,
  updateInternship,
} from "../repositories/catalog.repo.js";
import { createApplication, findApplication } from "../repositories/career.repo.js";
import { createNotification } from "../repositories/learning.repo.js";
import { audit } from "../repositories/audit.repo.js";
import { asyncHandler, paginate } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate, optionalAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await listInternships({
      domain: req.query.domain,
      mode: req.query.mode,
      level: req.query.level,
      search: req.query.search,
      sort: req.query.sort,
    });
    res.json(paginate(items, { page: req.query.page, pageSize: req.query.pageSize ?? 9 }));
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const item = await getInternshipBySlug(req.params.slug);
    if (!item) throw ApiError.notFound("Internship not found.");
    res.json(item);
  })
);

router.post(
  "/:slug/apply",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const internship = await getInternshipBySlug(req.params.slug);
    if (!internship) throw ApiError.notFound("Internship not found.");
    if (internship.status !== "open") {
      throw ApiError.badRequest("Applications for this internship are closed.");
    }

    const {
      fullName,
      email,
      phone,
      college,
      degree,
      graduationYear,
      duration,
      coverLetter,
      portfolioUrl,
      linkedinUrl,
    } = req.body ?? {};

    const user = req.user ?? null;
    const applicantName = user?.fullName || fullName;
    const applicantEmail = user?.email || email;
    const applicantPhone = user?.phone || phone;

    if (!applicantName || !applicantEmail) {
      throw ApiError.badRequest("Full name and email are required to submit an internship application.");
    }

    if (user) {
      const already = await findApplication(user.id, "internship", internship.id);
      if (already) throw ApiError.conflict("You have already applied to this internship.");
    }

    const applicationNumber = `IJ-APP-${Date.now().toString().slice(-6)}`;
    const application = await createApplication({
      applicationNumber,
      userId: user?.id ?? null,
      kind: "internship",
      programId: internship.id,
      slug: internship.slug,
      applicantName,
      email: applicantEmail,
      phone: applicantPhone || "",
      college: college || "",
      degree: degree || "",
      graduationYear: graduationYear || "",
      duration: duration || internship.duration,
      coverLetter: coverLetter ?? "",
      portfolioUrl: portfolioUrl ?? "",
      linkedinUrl: linkedinUrl ?? "",
      status: "applied",
    });

    await incrementInternshipApplicants(internship.id);

    if (user) {
      await createNotification({
        userId: user.id,
        title: "Internship application received",
        message: `Your application (${applicationNumber}) for ${internship.title} was submitted successfully. Our mentors will review your profile.`,
        type: "application",
      });
      await audit(user.id, "apply", "internship", internship.id);
    }

    res.status(201).json({
      success: true,
      applicationNumber,
      message:
        "Application submitted successfully! Our admissions and mentor team will review your profile and reach out within 24-48 hours.",
      application,
    });
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
    if (await getInternshipBySlug(slug)) throw ApiError.conflict("Internship already exists.");

    const item = await createInternship({
      slug,
      title,
      domain,
      level: req.body?.level ?? "Beginner",
      mode: req.body?.mode ?? "remote",
      duration: req.body?.duration ?? "8 weeks",
      stipend: req.body?.stipend ?? "Performance based",
      location: req.body?.location ?? "Remote",
      thumbnail: `/api/placeholder?seed=${slug}&label=${encodeURIComponent(domain)}`,
      skills: req.body?.skills ?? [],
      shortDescription: req.body?.shortDescription ?? "",
      overview: req.body?.overview ?? "",
      eligibility: req.body?.eligibility ?? [],
      roadmap: req.body?.roadmap ?? [],
      perks: req.body?.perks ?? [],
      certification: "Verified Internship Completion Certificate",
      applicationDeadline:
        req.body?.applicationDeadline ??
        new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: "open",
      openings: req.body?.openings ?? 25,
      applicantsCount: 0,
      isFeatured: Boolean(req.body?.isFeatured),
      mentorId: req.body?.mentorId ?? 1,
    });

    await audit(req.user.id, "create", "internship", item.id);
    res.status(201).json(item);
  })
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const item = await findInternshipById(req.params.id);
    if (!item) throw ApiError.notFound("Internship not found.");
    const updated = await updateInternship(item.id, req.body ?? {});
    await audit(req.user.id, "update", "internship", updated.id);
    res.json(updated);
  })
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const item = await findInternshipById(req.params.id);
    if (!item) throw ApiError.notFound("Internship not found.");
    await deleteInternship(item.id);
    await audit(req.user.id, "delete", "internship", item.id);
    res.json({ message: "Internship deleted.", id: item.id });
  })
);

export default router;
