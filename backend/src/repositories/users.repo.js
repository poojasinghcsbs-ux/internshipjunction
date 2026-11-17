import crypto from "node:crypto";
import { query } from "../config/db.js";
import { mapUser } from "../db/mappers.js";

const USER_COLUMNS = {
  fullName: "full_name",
  email: "email",
  phone: "phone",
  role: "role",
  headline: "headline",
  avatarUrl: "avatar_url",
  mentorId: "mentor_id",
  passwordHash: "password_hash",
};

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function findUserById(id) {
  const rows = await query("SELECT * FROM users WHERE id = ? LIMIT 1", [Number(id)]);
  return mapUser(rows[0]);
}

export async function findUserByEmail(email) {
  const rows = await query("SELECT * FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1", [
    String(email ?? ""),
  ]);
  return mapUser(rows[0]);
}

export async function findMentorUserByMentorId(mentorId) {
  const rows = await query(
    "SELECT * FROM users WHERE role = 'mentor' AND mentor_id = ? LIMIT 1",
    [Number(mentorId)]
  );
  return mapUser(rows[0]);
}

export async function createUser(data) {
  const result = await query(
    `INSERT INTO users (full_name, email, phone, password_hash, role, headline, avatar_url, mentor_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.fullName,
      String(data.email).toLowerCase(),
      data.phone ?? null,
      data.passwordHash,
      data.role ?? "student",
      data.headline ?? null,
      data.avatarUrl ?? null,
      data.mentorId ?? null,
    ]
  );
  return findUserById(result.insertId);
}

export async function updateUser(id, fields) {
  const updates = [];
  const values = [];
  for (const [key, column] of Object.entries(USER_COLUMNS)) {
    if (fields[key] !== undefined && key !== "passwordHash") {
      updates.push(`\`${column}\` = ?`);
      values.push(fields[key]);
    }
  }
  if (!updates.length) return findUserById(id);
  values.push(Number(id));
  await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);
  return findUserById(id);
}

export async function updateUserRole(id, role) {
  await query("UPDATE users SET role = ? WHERE id = ?", [role, Number(id)]);
  return findUserById(id);
}

export async function deleteUser(id) {
  const result = await query("DELETE FROM users WHERE id = ?", [Number(id)]);
  return result.affectedRows > 0;
}

export async function listUsers({ role, search } = {}) {
  const rows = await query("SELECT * FROM users ORDER BY created_at DESC, id DESC");
  let users = rows.map(mapUser);
  if (role && role !== "all") users = users.filter((user) => user.role === role);
  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
    );
  }
  return users;
}

export async function listStudents(limit = 20) {
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 20));
  const rows = await query(
    `SELECT * FROM users WHERE role = 'student' ORDER BY created_at DESC, id DESC LIMIT ${safeLimit}`
  );
  return rows.map(mapUser);
}

export async function countUsersByRole(role) {
  const rows = await query("SELECT COUNT(*) AS total FROM users WHERE role = ?", [role]);
  return Number(rows[0]?.total ?? 0);
}

export async function countUsers() {
  const rows = await query("SELECT COUNT(*) AS total FROM users");
  return Number(rows[0]?.total ?? 0);
}

// ── Refresh tokens ─────────────────────────────────────────────
export async function saveRefreshToken(userId, token, expiresAt) {
  const tokenHash = hashToken(token);
  await query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), expires_at = VALUES(expires_at)`,
    [Number(userId), tokenHash, expiresAt]
  );
}

export async function findRefreshToken(token) {
  const tokenHash = hashToken(token);
  const rows = await query(
    "SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW() LIMIT 1",
    [tokenHash]
  );
  return rows[0] ?? null;
}

export async function deleteRefreshToken(token) {
  await query("DELETE FROM refresh_tokens WHERE token = ?", [hashToken(token)]);
}

export async function deleteUserRefreshTokens(userId) {
  await query("DELETE FROM refresh_tokens WHERE user_id = ?", [Number(userId)]);
}
