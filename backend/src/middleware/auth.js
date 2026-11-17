import { ApiError } from "../utils/api-error.js";
import { accessTokenFromRequest, verifyAccessToken } from "../utils/jwt.js";
import { findUserById } from "../repositories/users.repo.js";

export async function authenticate(req, _res, next) {
  const token = accessTokenFromRequest(req);
  if (!token) return next(ApiError.unauthorized());
  try {
    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.sub);
    if (!user) return next(ApiError.unauthorized("Account no longer exists"));
    req.user = user;
    return next();
  } catch {
    return next(ApiError.unauthorized("Session expired, please login again"));
  }
}

export async function optionalAuth(req, _res, next) {
  const token = accessTokenFromRequest(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    req.user = (await findUserById(payload.sub)) ?? undefined;
  } catch {
    req.user = undefined;
  }
  return next();
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    const extended = roles.includes("admin") ? [...roles, "super_admin"] : roles;
    if (!extended.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    return next();
  };
}
