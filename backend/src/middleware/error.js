import { ApiError } from "../utils/api-error.js";
import { env } from "../config/env.js";

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(error, _req, res, _next) {
  const status = error instanceof ApiError ? error.status : error.status ?? 500;
  const message = error?.message ?? "Internal server error";
  if (status >= 500) {
    console.error("[error]", error);
  }
  res.status(status).json({
    message,
    ...(error?.details ? { errors: error.details } : {}),
    ...(env.nodeEnv === "development" && status >= 500 ? { stack: error.stack } : {}),
  });
}

export function validate(schema) {
  return (req, _res, next) => {
    const { value, errors } = schema(req.body ?? {});
    if (errors && errors.length) {
      return next(ApiError.badRequest(errors[0].message, errors));
    }
    req.validated = value;
    return next();
  };
}
