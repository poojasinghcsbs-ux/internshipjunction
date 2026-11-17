import { query } from "../config/db.js";
import { mapApplication, mapJob, mapJobApplication } from "../db/mappers.js";

// ── Internship / fellowship applications ───────────────────────
export async function findApplication(userId, kind, programId) {
  const rows = await query(
    "SELECT * FROM applications WHERE user_id = ? AND kind = ? AND program_id = ? LIMIT 1",
    [Number(userId), kind, Number(programId)]
  );
  return mapApplication(rows[0]);
}

export async function findApplicationById(id) {
  const rows = await query("SELECT * FROM applications WHERE id = ? LIMIT 1", [Number(id)]);
  return mapApplication(rows[0]);
}

export async function createApplication(data) {
  const result = await query(
    `INSERT INTO applications
      (application_number, user_id, kind, program_id, slug, applicant_name, email, phone,
       college, degree, graduation_year, duration, linkedin_url, status, cover_letter,
       portfolio_url, motivation, applied_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.applicationNumber ?? null,
      data.userId ? Number(data.userId) : null,
      data.kind,
      Number(data.programId),
      data.slug ?? null,
      data.applicantName ?? null,
      data.email ?? null,
      data.phone ?? null,
      data.college ?? null,
      data.degree ?? null,
      data.graduationYear ?? null,
      data.duration ?? null,
      data.linkedinUrl ?? null,
      data.status ?? "applied",
      data.coverLetter ?? null,
      data.portfolioUrl ?? null,
      data.motivation ?? null,
      data.appliedAt ? new Date(data.appliedAt) : new Date(),
    ]
  );
  return findApplicationById(result.insertId);
}

export async function listApplications() {
  const rows = await query("SELECT * FROM applications ORDER BY applied_at DESC, id DESC");
  return rows.map(mapApplication);
}

export async function countApplications() {
  const rows = await query("SELECT COUNT(*) AS total FROM applications");
  return Number(rows[0]?.total ?? 0);
}

// ── Job applications ───────────────────────────────────────────
export async function listJobApplications(userId) {
  const rows = await query(
    "SELECT * FROM job_applications WHERE user_id = ? ORDER BY applied_at DESC, id DESC",
    [Number(userId)]
  );
  return rows.map(mapJobApplication);
}

export async function findJobApplication(userId, jobId) {
  const rows = await query(
    "SELECT * FROM job_applications WHERE user_id = ? AND job_id = ? LIMIT 1",
    [Number(userId), Number(jobId)]
  );
  return mapJobApplication(rows[0]);
}

export async function createJobApplication(data) {
  const result = await query(
    `INSERT INTO job_applications (user_id, job_id, job_title, company, status, resume_url, cover_letter)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(data.userId),
      Number(data.jobId),
      data.jobTitle,
      data.company,
      data.status ?? "applied",
      data.resumeUrl ?? null,
      data.coverLetter ?? null,
    ]
  );
  const rows = await query("SELECT * FROM job_applications WHERE id = ?", [result.insertId]);
  return mapJobApplication(rows[0]);
}

export async function listAllJobApplications() {
  const rows = await query("SELECT * FROM job_applications ORDER BY applied_at DESC, id DESC");
  return rows.map(mapJobApplication);
}

export async function countJobApplications() {
  const rows = await query("SELECT COUNT(*) AS total FROM job_applications");
  return Number(rows[0]?.total ?? 0);
}

// ── Saved jobs ─────────────────────────────────────────────────
export async function listSavedJobs(userId) {
  const rows = await query(
    `SELECT j.* FROM jobs j
     INNER JOIN saved_jobs s ON s.job_id = j.id
     WHERE s.user_id = ?
     ORDER BY s.id DESC`,
    [Number(userId)]
  );
  return rows.map(mapJob);
}

export async function listSavedJobIds(userId) {
  const rows = await query("SELECT job_id FROM saved_jobs WHERE user_id = ?", [Number(userId)]);
  return rows.map((row) => row.job_id);
}

export async function saveJob(userId, jobId) {
  await query("INSERT IGNORE INTO saved_jobs (user_id, job_id) VALUES (?, ?)", [
    Number(userId),
    Number(jobId),
  ]);
}

export async function unsaveJob(userId, jobId) {
  await query("DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?", [
    Number(userId),
    Number(jobId),
  ]);
}
