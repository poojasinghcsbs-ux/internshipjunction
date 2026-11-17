import { Router } from "express";
import {
  createJob,
  deleteJob,
  findJobById,
  getJobBySlug,
  incrementJobApplicants,
  listJobs,
  listRelatedJobs,
  updateJob,
} from "../repositories/catalog.repo.js";
import {
  createJobApplication,
  findJobApplication,
  saveJob,
  unsaveJob,
} from "../repositories/career.repo.js";
import { createNotification } from "../repositories/learning.repo.js";
import { audit } from "../repositories/audit.repo.js";
import { asyncHandler, paginate } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await listJobs({
      search: req.query.search,
      remote: req.query.remote,
      type: req.query.type,
      experience: req.query.experience,
      location: req.query.location,
      company: req.query.company,
      skill: req.query.skill,
      sort: req.query.sort,
    });
    res.json(paginate(items, { page: req.query.page, pageSize: req.query.pageSize ?? 8 }));
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const job = await getJobBySlug(req.params.slug);
    if (!job) throw ApiError.notFound("Job not found.");
    const related = await listRelatedJobs(job, 3);
    res.json({ ...job, related });
  })
);

router.post(
  "/:slug/apply",
  authenticate,
  asyncHandler(async (req, res) => {
    const job = await getJobBySlug(req.params.slug);
    if (!job) throw ApiError.notFound("Job not found.");
    const already = await findJobApplication(req.user.id, job.id);
    if (already) throw ApiError.conflict("You have already applied to this job.");

    const application = await createJobApplication({
      userId: req.user.id,
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      status: "applied",
      resumeUrl: req.body?.resumeUrl ?? null,
      coverLetter: req.body?.coverLetter ?? "",
    });
    await incrementJobApplicants(job.id);
    await createNotification({
      userId: req.user.id,
      title: "Application submitted",
      message: `You applied to ${job.title} at ${job.company}.`,
      type: "application",
    });
    await audit(req.user.id, "apply", "job", job.id);
    res.status(201).json(application);
  })
);

router.post(
  "/:id/save",
  authenticate,
  asyncHandler(async (req, res) => {
    const job = await findJobById(req.params.id);
    if (!job) throw ApiError.notFound("Job not found.");
    await saveJob(req.user.id, job.id);
    res.status(201).json({ saved: true, message: "Job saved." });
  })
);

router.delete(
  "/:id/save",
  authenticate,
  asyncHandler(async (req, res) => {
    await unsaveJob(req.user.id, Number(req.params.id));
    res.json({ saved: false, message: "Removed from saved jobs." });
  })
);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { title, company } = req.body ?? {};
    if (!title || !company) throw ApiError.badRequest("Title and company are required.");
    const slug = `${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${String(company)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}`;
    if (await getJobBySlug(slug)) throw ApiError.conflict("A job with this title already exists.");

    const job = await createJob({
      slug,
      title,
      company,
      companyLogo: null,
      location: req.body?.location ?? "Remote",
      remote: Boolean(req.body?.remote),
      experience: req.body?.experience ?? "0-2 years",
      salaryMin: Number(req.body?.salaryMin ?? 0),
      salaryMax: Number(req.body?.salaryMax ?? 0),
      type: req.body?.type ?? "Full-time",
      skills: req.body?.skills ?? [],
      description: req.body?.description ?? "",
      responsibilities: req.body?.responsibilities ?? [],
      requirements: req.body?.requirements ?? [],
      postedAt: new Date(),
      status: "open",
      applicantsCount: 0,
    });

    await audit(req.user.id, "create", "job", job.id);
    res.status(201).json(job);
  })
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const job = await findJobById(req.params.id);
    if (!job) throw ApiError.notFound("Job not found.");
    const updated = await updateJob(job.id, req.body ?? {});
    await audit(req.user.id, "update", "job", updated.id);
    res.json(updated);
  })
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const job = await findJobById(req.params.id);
    if (!job) throw ApiError.notFound("Job not found.");
    await deleteJob(job.id);
    await audit(req.user.id, "delete", "job", job.id);
    res.json({ message: "Job deleted.", id: job.id });
  })
);

export default router;
