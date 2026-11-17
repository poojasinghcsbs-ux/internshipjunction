import { query } from "../config/db.js";
import {
  mapClassSession,
  mapMentorQuestion,
  mapMentorSession,
  mapMessage,
} from "../db/mappers.js";

export async function listMentorSessions(mentorId) {
  const rows = await query(
    "SELECT * FROM mentor_sessions WHERE mentor_id = ? ORDER BY scheduled_at ASC, id ASC",
    [Number(mentorId)]
  );
  return rows.map(mapMentorSession);
}

export async function listMentorQuestions() {
  const rows = await query("SELECT * FROM mentor_questions ORDER BY created_at DESC, id DESC");
  return rows.map(mapMentorQuestion);
}

export async function listStudentSummaries(limit = 20) {
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const rows = await query(
    `SELECT u.id, u.full_name, u.email, u.headline, u.created_at,
            COALESCE(ROUND(AVG(e.progress)), 0) AS progress
     FROM users u
     LEFT JOIN enrollments e ON e.user_id = u.id
     WHERE u.role = 'student'
     GROUP BY u.id, u.full_name, u.email, u.headline, u.created_at
     ORDER BY u.created_at DESC, u.id DESC
     LIMIT ${safeLimit}`
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    headline: row.headline,
    progress: Number(row.progress ?? 0),
    joinedAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  }));
}

export async function getMentorQuestion(id) {
  const rows = await query("SELECT * FROM mentor_questions WHERE id = ? LIMIT 1", [Number(id)]);
  return mapMentorQuestion(rows[0]);
}

export async function answerMentorQuestion(id, answer) {
  await query(
    `UPDATE mentor_questions
     SET answer = ?, status = 'answered', answered_at = NOW()
     WHERE id = ?`,
    [answer, Number(id)]
  );
  return getMentorQuestion(id);
}

export async function listMentorClasses(mentorId) {
  const rows = await query(
    `SELECT c.* FROM class_sessions c
     INNER JOIN mentors m ON m.name = c.mentor
     WHERE m.id = ?
     ORDER BY c.starts_at ASC, c.id ASC`,
    [Number(mentorId)]
  );
  return rows.map(mapClassSession);
}

export async function listMentorMessages(mentorId) {
  const rows = await query(
    "SELECT * FROM messages WHERE mentor_id = ? ORDER BY created_at DESC, id DESC",
    [Number(mentorId)]
  );
  return rows.map(mapMessage);
}

export async function countReviewableProjects() {
  const rows = await query(
    "SELECT COUNT(*) AS total FROM user_projects WHERE status IN ('submitted', 'under-review')"
  );
  return Number(rows[0]?.total ?? 0);
}
