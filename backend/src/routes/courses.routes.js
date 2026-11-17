import { Router } from "express";
import {
  createCourse,
  deleteCourse,
  findCourseById,
  findCourseBySlug,
  getCourseBySlug,
  listCourses,
  updateCourse,
} from "../repositories/catalog.repo.js";
import { audit } from "../repositories/audit.repo.js";
import { asyncHandler, paginate } from "../utils/helpers.js";
import { ApiError } from "../utils/api-error.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await listCourses({
      category: req.query.category,
      level: req.query.level,
      mode: req.query.mode,
      search: req.query.search,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      minRating: req.query.minRating,
      sort: req.query.sort,
      featured: req.query.featured,
    });
    res.json(paginate(items, { page: req.query.page, pageSize: req.query.pageSize ?? 9 }));
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const course = await getCourseBySlug(req.params.slug);
    if (!course) throw ApiError.notFound("Course not found.");
    res.json(course);
  })
);

router.post(
  "/",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const { title, category, level, mode, price, originalPrice, shortDescription, duration, technologies } =
      req.body ?? {};
    if (!title || !category) throw ApiError.badRequest("Title and category are required.");
    const slug = String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (await findCourseBySlug(slug)) throw ApiError.conflict("A course with this title already exists.");

    const course = await createCourse({
      slug,
      title,
      category,
      level: level ?? "Beginner",
      mode: mode ?? "self-paced",
      thumbnail: `/api/placeholder?seed=${slug}&label=${encodeURIComponent(title)}`,
      price: Number(price ?? 0),
      originalPrice: Number(originalPrice ?? price ?? 0),
      rating: 5,
      reviewsCount: 0,
      studentsCount: 0,
      duration: duration ?? "8 weeks",
      technologies: Array.isArray(technologies)
        ? technologies
        : String(technologies ?? "").split(",").map((item) => item.trim()).filter(Boolean),
      shortDescription: shortDescription ?? "",
      overview: req.body?.overview ?? "",
      outcomes: req.body?.outcomes ?? [],
      prerequisites: req.body?.prerequisites ?? [],
      audience: req.body?.audience ?? [],
      certification: `Verified ${title} Certificate`,
      careerOutcomes: req.body?.careerOutcomes ?? [],
      isFeatured: Boolean(req.body?.isFeatured),
      status: req.body?.status ?? "draft",
      mentorId: req.body?.mentorId ?? 1,
    });

    await audit(req.user.id, "create", "course", course.id);
    res.status(201).json({ ...course, modules: [] });
  })
);

router.put(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const course = await findCourseById(req.params.id);
    if (!course) throw ApiError.notFound("Course not found.");

    const allowed = [
      "title", "category", "level", "mode", "price", "originalPrice", "shortDescription",
      "overview", "duration", "technologies", "status", "isFeatured", "outcomes",
      "prerequisites", "audience", "careerOutcomes", "mentorId",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body?.[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await updateCourse(course.id, updates);
    await audit(req.user.id, "update", "course", updated.id, { fields: Object.keys(updates) });
    res.json(updated);
  })
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const course = (await listCourses({ includeDraft: true })).find((item) => item.id === id);
    if (!course) throw ApiError.notFound("Course not found.");
    await deleteCourse(id);
    await audit(req.user.id, "delete", "course", id);
    res.json({ message: "Course deleted.", id });
  })
);

export default router;
