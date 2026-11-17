import { query } from "../config/db.js";
import {
  mapAssignment,
  mapAtsReport,
  mapCertificate,
  mapClassSession,
  mapEnrollment,
  mapMessage,
  mapMockInterview,
  mapNotification,
  mapResume,
  mapUserProject,
} from "../db/mappers.js";
import { listJobs } from "./catalog.repo.js";
import { toPublicUser } from "./users.repo.js";

function asJson(value, fallback = []) {
  return JSON.stringify(value ?? fallback);
}

// ── Enrollments & progress ─────────────────────────────────────
export async function listEnrollments(userId) {
  const rows = await query(
    "SELECT * FROM enrollments WHERE user_id = ? ORDER BY enrolled_at DESC, id DESC",
    [Number(userId)]
  );
  return rows.map(mapEnrollment);
}

export async function findEnrollment(userId, programType, programId) {
  const rows = await query(
    "SELECT * FROM enrollments WHERE user_id = ? AND program_type = ? AND program_id = ? LIMIT 1",
    [Number(userId), programType, Number(programId)]
  );
  return mapEnrollment(rows[0]);
}

export async function createEnrollment(data) {
  const result = await query(
    `INSERT INTO enrollments (user_id, program_type, program_id, title, thumbnail, plan, progress, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(data.userId),
      data.programType,
      Number(data.programId),
      data.title,
      data.thumbnail ?? null,
      data.plan ?? "self-paced",
      Number(data.progress ?? 0),
      data.status ?? "active",
    ]
  );
  const rows = await query("SELECT * FROM enrollments WHERE id = ?", [result.insertId]);
  return mapEnrollment(rows[0]);
}

export async function countEnrollments() {
  const rows = await query("SELECT COUNT(*) AS total FROM enrollments");
  return Number(rows[0]?.total ?? 0);
}

export async function markLessonComplete(userId, courseId, lessonId) {
  await query(
    `INSERT INTO lesson_progress (user_id, course_id, lesson_id)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE completed_at = completed_at`,
    [Number(userId), Number(courseId), Number(lessonId)]
  );
}

export async function getLessonProgress(userId, courseId) {
  const rows = await query(
    "SELECT * FROM lesson_progress WHERE user_id = ? AND course_id = ? ORDER BY completed_at ASC",
    [Number(userId), Number(courseId)]
  );
  return rows;
}

export async function countLessonProgress(userId) {
  const rows = await query("SELECT COUNT(*) AS total FROM lesson_progress WHERE user_id = ?", [
    Number(userId),
  ]);
  return Number(rows[0]?.total ?? 0);
}

// ── Projects ───────────────────────────────────────────────────
export async function listUserProjects(userId) {
  const rows = await query(
    "SELECT * FROM user_projects WHERE user_id = ? ORDER BY id ASC",
    [Number(userId)]
  );
  return rows.map(mapUserProject);
}

export async function listAllUserProjects({ status } = {}) {
  const rows = status
    ? await query("SELECT * FROM user_projects WHERE status = ? ORDER BY id DESC", [status])
    : await query("SELECT * FROM user_projects ORDER BY id DESC");
  return rows.map(mapUserProject);
}

export async function listReviewableProjects() {
  const rows = await query(
    "SELECT * FROM user_projects WHERE status IN ('submitted', 'under-review') ORDER BY submitted_at ASC, id ASC"
  );
  return rows.map(mapUserProject);
}

export async function getUserProject(id, userId) {
  const rows = await query("SELECT * FROM user_projects WHERE id = ? AND user_id = ? LIMIT 1", [
    Number(id),
    Number(userId),
  ]);
  return mapUserProject(rows[0]);
}

export async function getProjectById(id) {
  const rows = await query("SELECT * FROM user_projects WHERE id = ? LIMIT 1", [Number(id)]);
  return mapUserProject(rows[0]);
}

export async function submitUserProject(id, userId, data) {
  await query(
    `UPDATE user_projects
     SET repo_url = ?, submission_url = ?, description = COALESCE(?, description),
         status = 'submitted', submitted_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [
      data.repoUrl ?? null,
      data.submissionUrl ?? null,
      data.description ?? null,
      Number(id),
      Number(userId),
    ]
  );
  return getUserProject(id, userId);
}

export async function reviewUserProject(id, data) {
  await query(
    `UPDATE user_projects
     SET status = ?, feedback = COALESCE(?, feedback), score = COALESCE(?, score)
     WHERE id = ?`,
    [data.decision, data.feedback ?? null, data.score ?? null, Number(id)]
  );
  return getProjectById(id);
}

export async function createUserProject(data) {
  const result = await query(
    `INSERT INTO user_projects
      (user_id, catalog_id, title, course_slug, course_title, difficulty, description,
       requirements, skills, estimated_hours, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(data.userId),
      data.catalogId ?? null,
      data.title,
      data.courseSlug ?? null,
      data.courseTitle ?? null,
      data.difficulty ?? null,
      data.description ?? null,
      asJson(data.requirements),
      asJson(data.skills),
      Number(data.estimatedHours ?? 0),
      data.status ?? "not-started",
    ]
  );
  return getProjectById(result.insertId);
}

// ── Certificates ───────────────────────────────────────────────
export async function listCertificates(userId) {
  const rows = await query(
    "SELECT * FROM certificates WHERE user_id = ? ORDER BY issued_at DESC, id DESC",
    [Number(userId)]
  );
  return rows.map(mapCertificate);
}

export async function listAllCertificates() {
  const rows = await query("SELECT * FROM certificates ORDER BY issued_at DESC, id DESC");
  return rows.map(mapCertificate);
}

export async function findCertificateByCertificateId(certificateId) {
  const rows = await query(
    "SELECT * FROM certificates WHERE LOWER(certificate_id) = LOWER(?) LIMIT 1",
    [String(certificateId)]
  );
  return mapCertificate(rows[0]);
}

export async function findCertificateById(id) {
  const rows = await query("SELECT * FROM certificates WHERE id = ? LIMIT 1", [Number(id)]);
  return mapCertificate(rows[0]);
}

export async function createCertificate(data) {
  const result = await query(
    `INSERT INTO certificates
      (certificate_id, user_id, student_name, program, program_type, grade, status, issued_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.certificateId,
      Number(data.userId),
      data.studentName,
      data.program,
      data.programType,
      data.grade ?? null,
      data.status ?? "valid",
      data.issuedAt ? new Date(data.issuedAt) : new Date(),
    ]
  );
  return findCertificateById(result.insertId);
}

export async function revokeCertificate(id) {
  await query("UPDATE certificates SET status = 'revoked' WHERE id = ?", [Number(id)]);
  return findCertificateById(id);
}

export async function countCertificates() {
  const rows = await query("SELECT COUNT(*) AS total FROM certificates");
  return Number(rows[0]?.total ?? 0);
}

// ── ATS reports ────────────────────────────────────────────────
export async function listAtsReports(userId) {
  const rows = await query(
    "SELECT * FROM ats_reports WHERE user_id = ? ORDER BY created_at DESC, id DESC",
    [Number(userId)]
  );
  return rows.map(mapAtsReport);
}

export async function createAtsReport(data) {
  const result = await query(
    `INSERT INTO ats_reports
      (user_id, file_name, target_role, overall_score, sections, missing_keywords,
       recommended_skills, suggestions, summary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(data.userId),
      data.fileName ?? "pasted-resume.txt",
      data.targetRole ?? null,
      Number(data.overallScore ?? 0),
      asJson(data.sections),
      asJson(data.missingKeywords),
      asJson(data.recommendedSkills),
      asJson(data.suggestions),
      data.summary ?? null,
    ]
  );
  const rows = await query("SELECT * FROM ats_reports WHERE id = ?", [result.insertId]);
  return mapAtsReport(rows[0]);
}

// ── Resumes ────────────────────────────────────────────────────
export async function listResumes(userId) {
  const rows = await query(
    "SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC, id DESC",
    [Number(userId)]
  );
  return rows.map(mapResume);
}

export async function createResume(data) {
  const result = await query(
    "INSERT INTO resumes (user_id, title, template, data) VALUES (?, ?, ?, ?)",
    [
      Number(data.userId),
      data.title ?? "Untitled Resume",
      data.template ?? "modern",
      asJson(data.data, {}),
    ]
  );
  const rows = await query("SELECT * FROM resumes WHERE id = ?", [result.insertId]);
  return mapResume(rows[0]);
}

// ── Mock interviews ────────────────────────────────────────────
export async function listMockInterviews(userId) {
  const rows = await query(
    "SELECT * FROM mock_interviews WHERE user_id = ? ORDER BY created_at DESC, id DESC",
    [Number(userId)]
  );
  return rows.map(mapMockInterview);
}

export async function createMockInterview(data) {
  const result = await query(
    `INSERT INTO mock_interviews
      (user_id, role, technology, experience, type, interviewer, score, strengths, weaknesses,
       recommendation, questions, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(data.userId),
      data.role ?? "General",
      data.technology ?? "General",
      data.experience ?? "Fresher",
      data.type ?? "Mixed",
      data.interviewer ?? null,
      Number(data.score ?? 0),
      asJson(data.strengths),
      asJson(data.weaknesses),
      data.recommendation ?? null,
      asJson(data.questions),
      data.createdAt ? new Date(data.createdAt) : new Date(),
    ]
  );
  const rows = await query("SELECT * FROM mock_interviews WHERE id = ?", [result.insertId]);
  return mapMockInterview(rows[0]);
}

// ── Notifications ──────────────────────────────────────────────
export async function listNotifications(userId) {
  const rows = await query(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC",
    [Number(userId)]
  );
  return rows.map(mapNotification);
}

export async function createNotification(data) {
  const result = await query(
    "INSERT INTO notifications (user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?)",
    [Number(data.userId), data.title, data.message, data.type ?? "info", data.read ? 1 : 0]
  );
  const rows = await query("SELECT * FROM notifications WHERE id = ?", [result.insertId]);
  return mapNotification(rows[0]);
}

export async function markNotificationRead(id, userId) {
  await query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [
    Number(id),
    Number(userId),
  ]);
  const rows = await query("SELECT * FROM notifications WHERE id = ? AND user_id = ? LIMIT 1", [
    Number(id),
    Number(userId),
  ]);
  return mapNotification(rows[0]);
}

export async function markAllNotificationsRead(userId) {
  await query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [Number(userId)]);
}

// ── Classes & assignments ──────────────────────────────────────
export async function listClasses(userId) {
  const rows = await query(
    "SELECT * FROM class_sessions WHERE user_id = ? ORDER BY starts_at ASC, id ASC",
    [Number(userId)]
  );
  return rows.map(mapClassSession);
}

export async function listAssignments(userId) {
  const rows = await query(
    "SELECT * FROM assignments WHERE user_id = ? ORDER BY due_date ASC, id ASC",
    [Number(userId)]
  );
  return rows.map(mapAssignment);
}

export async function listMessagesForUser(userId) {
  const rows = await query(
    "SELECT * FROM messages WHERE recipient_id = ? ORDER BY created_at DESC, id DESC",
    [Number(userId)]
  );
  return rows.map(mapMessage);
}

export async function listMessagesForMentor(mentorId) {
  const rows = await query(
    "SELECT * FROM messages WHERE mentor_id = ? ORDER BY created_at DESC, id DESC",
    [Number(mentorId)]
  );
  return rows.map(mapMessage);
}

export async function createMessage(data) {
  const result = await query(
    `INSERT INTO messages (sender_id, recipient_id, mentor_id, sender_name, message, is_read)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      data.senderId ?? null,
      data.recipientId ?? null,
      data.mentorId ?? null,
      data.senderName,
      data.message,
      data.read ? 1 : 0,
    ]
  );
  const rows = await query("SELECT * FROM messages WHERE id = ?", [result.insertId]);
  return mapMessage(rows[0]);
}

// ── Dashboard ──────────────────────────────────────────────────
export async function buildDashboard(user) {
  const userId = Number(user.id);
  const [enrollments, certificates, projects, upcomingClasses, pendingAssignments, notifications, messages, lessonCount, jobs] =
    await Promise.all([
      listEnrollments(userId),
      listCertificates(userId),
      listUserProjects(userId),
      listClasses(userId),
      listAssignments(userId),
      listNotifications(userId),
      listMessagesForUser(userId),
      countLessonProgress(userId),
      listJobs({}),
    ]);

  const overallProgress = enrollments.length
    ? Math.round(enrollments.reduce((sum, enrollment) => sum + enrollment.progress, 0) / enrollments.length)
    : 0;

  return {
    user: toPublicUser(user),
    stats: {
      courses: enrollments.filter((enrollment) => enrollment.programType === "course").length,
      internships: enrollments.filter((enrollment) => enrollment.programType === "internship").length,
      certificates: certificates.length,
      projects: projects.length,
      streak: Math.min(12, lessonCount * 2),
      overallProgress,
    },
    enrollments,
    upcomingClasses: upcomingClasses.filter((item) => item.status !== "cancelled"),
    pendingAssignments: pendingAssignments.filter((item) => item.status === "pending"),
    projects,
    certificates,
    recommendedJobs: jobs.slice(0, 4),
    mentorMessages: messages,
    activity: notifications.slice(0, 4).map((notification) => ({
      id: notification.id,
      label: notification.title,
      createdAt: notification.createdAt,
    })),
  };
}
