import { Router } from "express";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/helpers.js";
import { env, isProd } from "../config/env.js";
import {
  createUser,
  deleteRefreshToken,
  findRefreshToken,
  findUserByEmail,
  findUserById,
  saveRefreshToken,
  toPublicUser,
} from "../repositories/users.repo.js";
import { audit } from "../repositories/audit.repo.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

const REFRESH_COOKIE = "internshipjunction_refresh";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/auth",
};

function refreshExpiryDate() {
  const ttl = String(env.refreshTokenTtl ?? "7d").trim();
  const match = /^(\d+)\s*([smhd])?$/i.exec(ttl);
  if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const amount = Number(match[1]);
  const unit = (match[2] ?? "s").toLowerCase();
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 1000;
  return new Date(Date.now() + amount * multiplier);
}

async function issueTokens(res, user) {
  const payload = { sub: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: user.id, tokenType: "refresh" });
  await saveRefreshToken(user.id, refreshToken, refreshExpiryDate());
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  return { accessToken, user: toPublicUser(user) };
}

function validateRegister(body) {
  const errors = [];
  const value = {};
  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const phone = String(body.phone ?? "").trim();
  const role = body.role === "mentor" ? "mentor" : "student";

  if (fullName.length < 3) errors.push({ field: "fullName", message: "Full name must be at least 3 characters." });
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push({ field: "email", message: "Enter a valid email address." });
  if (password.length < 8) errors.push({ field: "password", message: "Password must be at least 8 characters." });
  if (phone && !/^[+\d][\d\s-]{7,}$/.test(phone)) errors.push({ field: "phone", message: "Enter a valid phone number." });

  value.fullName = fullName;
  value.email = email;
  value.password = password;
  value.phone = phone || null;
  value.role = role;
  return { value, errors };
}

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { value, errors } = validateRegister(req.body ?? {});
    if (errors.length) throw ApiError.badRequest(errors[0].message, errors);
    if (await findUserByEmail(value.email)) {
      throw ApiError.conflict("An account with this email already exists.");
    }

    const user = await createUser({
      fullName: value.fullName,
      email: value.email,
      phone: value.phone,
      role: value.role,
      passwordHash: hashPassword(value.password),
      avatarUrl: null,
      headline: value.role === "mentor" ? "Industry Mentor" : "Learner",
    });
    await audit(user.id, "register", "user", user.id);
    res.status(201).json(await issueTokens(res, user));
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    if (!email || !password) throw ApiError.badRequest("Email and password are required.");
    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw ApiError.unauthorized("Invalid email or password.");
    }
    await audit(user.id, "login", "user", user.id);
    res.json(await issueTokens(res, user));
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) throw ApiError.unauthorized("No active session.");
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized("Session expired, please login again.");
    }

    const stored = await findRefreshToken(token);
    if (!stored) throw ApiError.unauthorized("Session expired, please login again.");

    const user = await findUserById(payload.sub);
    if (!user) throw ApiError.unauthorized("Account not found.");

    await deleteRefreshToken(token);
    res.json(await issueTokens(res, user));
  })
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) await deleteRefreshToken(token).catch(() => {});
    res.clearCookie(REFRESH_COOKIE, { ...cookieOptions, maxAge: undefined });
    res.json({ message: "Logged out successfully." });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json(toPublicUser(req.user));
  })
);

export default router;
