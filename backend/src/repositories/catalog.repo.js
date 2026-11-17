import { query } from "../config/db.js";
import {
  mapCourse,
  mapFellowship,
  mapInternship,
  mapJob,
  mapLesson,
  mapMentor,
  mapModule,
  mapProjectCatalog,
  mapTestimonial,
} from "../db/mappers.js";

const COURSE_COLUMNS = {
  slug: "slug",
  title: "title",
  category: "category",
  level: "level",
  mode: "mode",
  thumbnail: "thumbnail",
  price: "price",
  originalPrice: "original_price",
  rating: "rating",
  reviewsCount: "reviews_count",
  studentsCount: "students_count",
  duration: "duration",
  technologies: "technologies",
  shortDescription: "short_description",
  overview: "overview",
  outcomes: "outcomes",
  prerequisites: "prerequisites",
  audience: "audience",
  certification: "certification",
  careerOutcomes: "career_outcomes",
  mentorId: "mentor_id",
  isFeatured: "is_featured",
  status: "status",
};

const JSON_COURSE_FIELDS = new Set([
  "technologies",
  "outcomes",
  "prerequisites",
  "audience",
  "careerOutcomes",
]);

const INTERNSHIP_COLUMNS = {
  slug: "slug",
  title: "title",
  domain: "domain",
  level: "level",
  mode: "mode",
  duration: "duration",
  stipend: "stipend",
  location: "location",
  thumbnail: "thumbnail",
  skills: "skills",
  shortDescription: "short_description",
  overview: "overview",
  eligibility: "eligibility",
  roadmap: "roadmap",
  perks: "perks",
  certification: "certification",
  applicationDeadline: "application_deadline",
  status: "status",
  openings: "openings",
  applicantsCount: "applicants_count",
  mentorId: "mentor_id",
  isFeatured: "is_featured",
};

const JSON_INTERNSHIP_FIELDS = new Set(["skills", "eligibility", "roadmap", "perks"]);

const FELLOWSHIP_COLUMNS = {
  slug: "slug",
  title: "title",
  domain: "domain",
  cohort: "cohort",
  startDate: "start_date",
  duration: "duration",
  seats: "seats",
  seatsLeft: "seats_left",
  price: "price",
  originalPrice: "original_price",
  thumbnail: "thumbnail",
  shortDescription: "short_description",
  overview: "overview",
  highlights: "highlights",
  curriculum: "curriculum",
  mentors: "mentors",
  careerSupport: "career_support",
  isFeatured: "is_featured",
};

const JSON_FELLOWSHIP_FIELDS = new Set(["highlights", "curriculum", "mentors", "careerSupport"]);

const JOB_COLUMNS = {
  slug: "slug",
  title: "title",
  company: "company",
  companyLogo: "company_logo",
  location: "location",
  remote: "remote",
  experience: "experience",
  salaryMin: "salary_min",
  salaryMax: "salary_max",
  type: "type",
  skills: "skills",
  description: "description",
  responsibilities: "responsibilities",
  requirements: "requirements",
  postedAt: "posted_at",
  status: "status",
  applicantsCount: "applicants_count",
};

const JSON_JOB_FIELDS = new Set(["skills", "responsibilities", "requirements"]);

function asJson(value) {
  return JSON.stringify(value ?? []);
}

function mentorMap(mentors) {
  return new Map(mentors.map((mentor) => [mentor.id, mentor]));
}

function withMentor(row, mentorsById) {
  return mapCourse(row, { mentor: mentorsById.get(row.mentor_id) ?? null });
}

async function allMentors() {
  return listMentors();
}

// ── Mentors ────────────────────────────────────────────────────
export async function listMentors() {
  const rows = await query("SELECT * FROM mentors ORDER BY is_featured DESC, rating DESC, id ASC");
  return rows.map(mapMentor);
}

export async function getMentor(id) {
  const rows = await query("SELECT * FROM mentors WHERE id = ? LIMIT 1", [Number(id)]);
  return mapMentor(rows[0]);
}

export async function mentorCourses(mentorId) {
  const rows = await query("SELECT * FROM courses WHERE mentor_id = ? ORDER BY id ASC", [
    Number(mentorId),
  ]);
  return rows.map((row) => mapCourse(row));
}

// ── Courses ────────────────────────────────────────────────────
export async function listCourses(filters = {}) {
  const {
    category,
    level,
    mode,
    search,
    minPrice,
    maxPrice,
    minRating,
    sort,
    featured,
    includeDraft,
  } = filters;

  const rows = includeDraft
    ? await query("SELECT * FROM courses ORDER BY created_at DESC, id DESC")
    : await query("SELECT * FROM courses WHERE status = 'active' ORDER BY created_at DESC, id DESC");

  const mentorsById = mentorMap(await allMentors());
  let items = rows.map((row) => {
    const course = withMentor(row, mentorsById);
    course.mentorId = row.mentor_id;
    return course;
  });

  if (category && category !== "all") items = items.filter((c) => c.category === category);
  if (level && level !== "all") items = items.filter((c) => c.level === level);
  if (mode && mode !== "all") items = items.filter((c) => c.mode === mode);
  if (featured === "true" || featured === true) items = items.filter((c) => c.isFeatured);
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.technologies.some((t) => String(t).toLowerCase().includes(q))
    );
  }
  if (minPrice !== undefined && minPrice !== "") items = items.filter((c) => c.price >= Number(minPrice));
  if (maxPrice !== undefined && maxPrice !== "") items = items.filter((c) => c.price <= Number(maxPrice));
  if (minRating !== undefined && minRating !== "") items = items.filter((c) => c.rating >= Number(minRating));

  switch (sort) {
    case "newest":
      items = [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "rating":
      items = [...items].sort((a, b) => b.rating - a.rating);
      break;
    case "price-asc":
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    default:
      items = [...items].sort((a, b) => b.studentsCount - a.studentsCount);
  }
  return items;
}

export async function findCourseBySlug(slug) {
  const rows = await query("SELECT * FROM courses WHERE slug = ? LIMIT 1", [String(slug)]);
  return mapCourse(rows[0]);
}

export async function findCourseById(id) {
  const rows = await query("SELECT * FROM courses WHERE id = ? LIMIT 1", [Number(id)]);
  return mapCourse(rows[0]);
}

export async function getCourseModules(courseId) {
  const modules = await query(
    "SELECT * FROM course_modules WHERE course_id = ? ORDER BY position ASC, id ASC",
    [Number(courseId)]
  );
  if (!modules.length) return [];
  const lessons = await query(
    `SELECT * FROM lessons WHERE module_id IN (${modules.map(() => "?").join(", ")})
     ORDER BY position ASC, id ASC`,
    modules.map((module) => module.id)
  );
  const byModule = new Map();
  for (const lesson of lessons) {
    const list = byModule.get(lesson.module_id) ?? [];
    list.push(mapLesson(lesson));
    byModule.set(lesson.module_id, list);
  }
  return modules.map((module) => mapModule(module, byModule.get(module.id) ?? []));
}

export async function getCourseBySlug(slug) {
  const rows = await query("SELECT * FROM courses WHERE slug = ? LIMIT 1", [String(slug)]);
  if (!rows.length) return null;
  const row = rows[0];
  const mentorsById = mentorMap(await allMentors());
  const course = withMentor(row, mentorsById);
  course.mentorId = row.mentor_id;
  course.modules = await getCourseModules(row.id);

  const testimonials = await listTestimonials();
  const offset = row.id % Math.max(1, testimonials.length - 4);
  course.reviews = testimonials.slice(offset, offset + 4).map((testimonial, index) => ({
    id: row.id * 100 + index,
    author: testimonial.author,
    role: testimonial.role,
    rating: testimonial.rating,
    content: testimonial.content,
    createdAt: testimonial.createdAt,
  }));

  const relatedRows = await query(
    "SELECT * FROM courses WHERE category = ? AND id <> ? AND status = 'active' ORDER BY rating DESC LIMIT 3",
    [row.category, row.id]
  );
  course.related = relatedRows.map((related) => withMentor(related, mentorsById));
  return course;
}

export async function createCourse(data) {
  const result = await query(
    `INSERT INTO courses
      (slug, title, category, level, mode, thumbnail, price, original_price, rating, reviews_count,
       students_count, duration, technologies, short_description, overview, outcomes, prerequisites,
       audience, certification, career_outcomes, mentor_id, is_featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.slug,
      data.title,
      data.category,
      data.level ?? "Beginner",
      data.mode ?? "self-paced",
      data.thumbnail ?? null,
      Number(data.price ?? 0),
      Number(data.originalPrice ?? data.price ?? 0),
      Number(data.rating ?? 5),
      Number(data.reviewsCount ?? 0),
      Number(data.studentsCount ?? 0),
      data.duration ?? "8 weeks",
      asJson(data.technologies),
      data.shortDescription ?? "",
      data.overview ?? "",
      asJson(data.outcomes),
      asJson(data.prerequisites),
      asJson(data.audience),
      data.certification ?? null,
      asJson(data.careerOutcomes),
      data.mentorId ? Number(data.mentorId) : null,
      data.isFeatured ? 1 : 0,
      data.status ?? "draft",
    ]
  );
  return findCourseById(result.insertId);
}

export async function updateCourse(id, data) {
  const updates = [];
  const values = [];
  for (const [key, column] of Object.entries(COURSE_COLUMNS)) {
    if (data[key] === undefined || key === "slug") continue;
    let value = data[key];
    if (JSON_COURSE_FIELDS.has(key)) value = asJson(value);
    if (key === "isFeatured") value = value ? 1 : 0;
    updates.push(`\`${column}\` = ?`);
    values.push(value);
  }
  if (updates.length) {
    values.push(Number(id));
    await query(`UPDATE courses SET ${updates.join(", ")} WHERE id = ?`, values);
  }
  return findCourseById(id);
}

export async function deleteCourse(id) {
  const result = await query("DELETE FROM courses WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

// ── Internships ────────────────────────────────────────────────
export async function listInternships(filters = {}) {
  const { domain, mode, level, search, sort } = filters;
  const rows = await query("SELECT * FROM internships ORDER BY is_featured DESC, id ASC");
  const mentorsById = mentorMap(await allMentors());
  let items = rows.map((row) => {
    const internship = mapInternship(row, mentorsById.get(row.mentor_id) ?? null);
    internship.mentorId = row.mentor_id;
    return internship;
  });

  if (domain && domain !== "all") items = items.filter((i) => i.domain === domain);
  if (mode && mode !== "all") items = items.filter((i) => i.mode === mode);
  if (level && level !== "all") items = items.filter((i) => i.level === level);
  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (i) => i.title.toLowerCase().includes(q) || i.skills.some((s) => String(s).toLowerCase().includes(q))
    );
  }
  switch (sort) {
    case "deadline":
      items = items.sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline));
      break;
    case "applicants":
      items = items.sort((a, b) => b.applicantsCount - a.applicantsCount);
      break;
    default:
      items = items.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }
  return items;
}

export async function findInternshipById(id) {
  const rows = await query("SELECT * FROM internships WHERE id = ? LIMIT 1", [Number(id)]);
  return mapInternship(rows[0]);
}

export async function getInternshipBySlug(slug) {
  const rows = await query("SELECT * FROM internships WHERE slug = ? LIMIT 1", [String(slug)]);
  if (!rows.length) return null;
  const mentorsById = mentorMap(await allMentors());
  const internship = mapInternship(rows[0], mentorsById.get(rows[0].mentor_id) ?? null);
  internship.mentorId = rows[0].mentor_id;
  return internship;
}

export async function createInternship(data) {
  const result = await query(
    `INSERT INTO internships
      (slug, title, domain, level, mode, duration, stipend, location, thumbnail, skills,
       short_description, overview, eligibility, roadmap, perks, certification,
       application_deadline, status, openings, applicants_count, mentor_id, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.slug,
      data.title,
      data.domain,
      data.level ?? "Beginner",
      data.mode ?? "remote",
      data.duration ?? "8 weeks",
      data.stipend ?? "Performance based",
      data.location ?? "Remote",
      data.thumbnail ?? null,
      asJson(data.skills),
      data.shortDescription ?? "",
      data.overview ?? "",
      asJson(data.eligibility),
      asJson(data.roadmap),
      asJson(data.perks),
      data.certification ?? "Verified Internship Completion Certificate",
      data.applicationDeadline ?? null,
      data.status ?? "open",
      Number(data.openings ?? 25),
      Number(data.applicantsCount ?? 0),
      data.mentorId ? Number(data.mentorId) : null,
      data.isFeatured ? 1 : 0,
    ]
  );
  return findInternshipById(result.insertId);
}

export async function updateInternship(id, data) {
  const updates = [];
  const values = [];
  for (const [key, column] of Object.entries(INTERNSHIP_COLUMNS)) {
    if (data[key] === undefined || key === "slug") continue;
    let value = data[key];
    if (JSON_INTERNSHIP_FIELDS.has(key)) value = asJson(value);
    if (key === "isFeatured") value = value ? 1 : 0;
    updates.push(`\`${column}\` = ?`);
    values.push(value);
  }
  if (updates.length) {
    values.push(Number(id));
    await query(`UPDATE internships SET ${updates.join(", ")} WHERE id = ?`, values);
  }
  return findInternshipById(id);
}

export async function incrementInternshipApplicants(id) {
  await query("UPDATE internships SET applicants_count = applicants_count + 1 WHERE id = ?", [
    Number(id),
  ]);
}

export async function deleteInternship(id) {
  const result = await query("DELETE FROM internships WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

// ── Fellowships ────────────────────────────────────────────────
export async function listFellowships() {
  const rows = await query("SELECT * FROM fellowships ORDER BY is_featured DESC, id ASC");
  return rows.map(mapFellowship);
}

export async function findFellowshipById(id) {
  const rows = await query("SELECT * FROM fellowships WHERE id = ? LIMIT 1", [Number(id)]);
  return mapFellowship(rows[0]);
}

export async function getFellowshipBySlug(slug) {
  const rows = await query("SELECT * FROM fellowships WHERE slug = ? LIMIT 1", [String(slug)]);
  return mapFellowship(rows[0]);
}

export async function createFellowship(data) {
  const result = await query(
    `INSERT INTO fellowships
      (slug, title, domain, cohort, start_date, duration, seats, seats_left, price, original_price,
       thumbnail, short_description, overview, highlights, curriculum, mentors, career_support, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.slug,
      data.title,
      data.domain,
      data.cohort ?? "Cohort 1",
      data.startDate ?? null,
      data.duration ?? "16 weeks",
      Number(data.seats ?? 30),
      Number(data.seatsLeft ?? data.seats ?? 30),
      Number(data.price ?? 0),
      Number(data.originalPrice ?? data.price ?? 0),
      data.thumbnail ?? null,
      data.shortDescription ?? "",
      data.overview ?? "",
      asJson(data.highlights),
      asJson(data.curriculum),
      asJson(data.mentors),
      asJson(data.careerSupport),
      data.isFeatured ? 1 : 0,
    ]
  );
  return findFellowshipById(result.insertId);
}

export async function updateFellowship(id, data) {
  const updates = [];
  const values = [];
  for (const [key, column] of Object.entries(FELLOWSHIP_COLUMNS)) {
    if (data[key] === undefined || key === "slug") continue;
    let value = data[key];
    if (JSON_FELLOWSHIP_FIELDS.has(key)) value = asJson(value);
    if (key === "isFeatured") value = value ? 1 : 0;
    updates.push(`\`${column}\` = ?`);
    values.push(value);
  }
  if (updates.length) {
    values.push(Number(id));
    await query(`UPDATE fellowships SET ${updates.join(", ")} WHERE id = ?`, values);
  }
  return findFellowshipById(id);
}

export async function decrementFellowshipSeats(id) {
  await query("UPDATE fellowships SET seats_left = GREATEST(0, seats_left - 1) WHERE id = ?", [
    Number(id),
  ]);
}

export async function deleteFellowship(id) {
  const result = await query("DELETE FROM fellowships WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

// ── Jobs ───────────────────────────────────────────────────────
export async function listJobs(filters = {}) {
  const { search, remote, type, experience, location, company, skill, sort } = filters;
  const rows = await query("SELECT * FROM jobs ORDER BY posted_at DESC, id DESC");
  let items = rows.map(mapJob);

  if (search) {
    const q = String(search).toLowerCase();
    items = items.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some((s) => String(s).toLowerCase().includes(q))
    );
  }
  if (remote === "true" || remote === true) items = items.filter((j) => j.remote);
  if (type && type !== "all") items = items.filter((j) => j.type === type);
  if (experience && experience !== "all") items = items.filter((j) => j.experience === experience);
  if (location && location !== "all") {
    items = items.filter((j) =>
      String(j.location ?? "").toLowerCase().includes(String(location).toLowerCase())
    );
  }
  if (company && company !== "all") items = items.filter((j) => j.company === company);
  if (skill) items = items.filter((j) => j.skills.some((s) => String(s).toLowerCase() === String(skill).toLowerCase()));

  switch (sort) {
    case "salary":
      items = items.sort((a, b) => b.salaryMax - a.salaryMax);
      break;
    case "oldest":
      items = items.sort((a, b) => new Date(a.postedAt) - new Date(b.postedAt));
      break;
    default:
      items = items.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
  }
  return items;
}

export async function findJobById(id) {
  const rows = await query("SELECT * FROM jobs WHERE id = ? LIMIT 1", [Number(id)]);
  return mapJob(rows[0]);
}

export async function getJobBySlug(slug) {
  const rows = await query("SELECT * FROM jobs WHERE slug = ? LIMIT 1", [String(slug)]);
  return mapJob(rows[0]);
}

export async function listRelatedJobs(job, limit = 3) {
  const safeLimit = Math.max(1, Math.min(10, Number(limit) || 3));
  const rows = await query(
    `SELECT * FROM jobs WHERE id <> ? AND company = ? ORDER BY posted_at DESC LIMIT ${safeLimit}`,
    [Number(job.id), job.company]
  );
  return rows.map(mapJob);
}

export async function createJob(data) {
  const result = await query(
    `INSERT INTO jobs
      (slug, title, company, company_logo, location, remote, experience, salary_min, salary_max,
       type, skills, description, responsibilities, requirements, posted_at, status, applicants_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.slug,
      data.title,
      data.company,
      data.companyLogo ?? null,
      data.location ?? "Remote",
      data.remote ? 1 : 0,
      data.experience ?? "0-2 years",
      Number(data.salaryMin ?? 0),
      Number(data.salaryMax ?? 0),
      data.type ?? "Full-time",
      asJson(data.skills),
      data.description ?? "",
      asJson(data.responsibilities),
      asJson(data.requirements),
      data.postedAt ? new Date(data.postedAt) : new Date(),
      data.status ?? "open",
      Number(data.applicantsCount ?? 0),
    ]
  );
  return findJobById(result.insertId);
}

export async function updateJob(id, data) {
  const updates = [];
  const values = [];
  for (const [key, column] of Object.entries(JOB_COLUMNS)) {
    if (data[key] === undefined || key === "slug") continue;
    let value = data[key];
    if (JSON_JOB_FIELDS.has(key)) value = asJson(value);
    if (key === "remote") value = value ? 1 : 0;
    updates.push(`\`${column}\` = ?`);
    values.push(value);
  }
  if (updates.length) {
    values.push(Number(id));
    await query(`UPDATE jobs SET ${updates.join(", ")} WHERE id = ?`, values);
  }
  return findJobById(id);
}

export async function incrementJobApplicants(id) {
  await query("UPDATE jobs SET applicants_count = applicants_count + 1 WHERE id = ?", [Number(id)]);
}

export async function deleteJob(id) {
  const result = await query("DELETE FROM jobs WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

// ── Project catalog, testimonials, categories, stats ───────────
export async function listProjectCatalog() {
  const rows = await query("SELECT * FROM project_catalog ORDER BY id ASC");
  return rows.map(mapProjectCatalog);
}

export async function getProjectCatalog(id) {
  const rows = await query("SELECT * FROM project_catalog WHERE id = ? LIMIT 1", [Number(id)]);
  return mapProjectCatalog(rows[0]);
}

export async function listTestimonials() {
  const rows = await query("SELECT * FROM testimonials ORDER BY created_at DESC, id ASC");
  return rows.map(mapTestimonial);
}

export async function listCategories() {
  const rows = await query(
    "SELECT DISTINCT category FROM courses WHERE status = 'active' ORDER BY category ASC"
  );
  return rows.map((row) => row.category);
}

export async function platformStats() {
  const [students, courses, mentors, projects, internships, fellowships, certificates] =
    await Promise.all([
      query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'"),
      query("SELECT COUNT(*) AS total FROM courses"),
      query("SELECT COUNT(*) AS total FROM mentors"),
      query("SELECT COUNT(*) AS total FROM project_catalog"),
      query("SELECT COUNT(*) AS total FROM internships"),
      query("SELECT COUNT(*) AS total FROM fellowships"),
      query("SELECT COUNT(*) AS total FROM certificates"),
    ]);
  return {
    studentsTrained: 42800 + Number(students[0]?.total ?? 0),
    courses: Number(courses[0]?.total ?? 0),
    mentors: Number(mentors[0]?.total ?? 0),
    projects: Number(projects[0]?.total ?? 0),
    hiringPartners: 180,
    certifications: 18600 + Number(certificates[0]?.total ?? 0),
    internships: Number(internships[0]?.total ?? 0),
    fellowships: Number(fellowships[0]?.total ?? 0),
  };
}
