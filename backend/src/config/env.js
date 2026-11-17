import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Always load backend/.env regardless of the folder the process was started from.
// This file (env.js) is committed to git, so it must never contain real values.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name) {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        "Add it to backend/.env (see backend/.env.example)."
    );
  }
  return value.trim();
}

function defined(name) {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        "Add it to backend/.env (see backend/.env.example)."
    );
  }
  return value;
}

function optional(name, fallback = "") {
  const value = process.env[name];
  return value === undefined || value.trim() === "" ? fallback : value.trim();
}

function numberFromEnv(name) {
  const value = Number(required(name));
  if (!Number.isFinite(value)) {
    throw new Error(`Environment variable "${name}" must be a number.`);
  }
  return value;
}

function portFromEnv(name) {
  const value = required(name);
  return /^\d+$/.test(value) ? Number(value) : value;
}

function booleanFromEnv(name) {
  return ["1", "true", "yes", "on"].includes(required(name).toLowerCase());
}

const INSECURE_SECRET_VALUES = new Set([
  "dev-access-secret-change-me",
  "dev-refresh-secret-change-me",
  "replace-with-a-long-random-string",
  "replace-with-another-long-random-string",
]);

function secretFromEnv(name) {
  const value = required(name);
  if (INSECURE_SECRET_VALUES.has(value)) {
    throw new Error(
      `Environment variable "${name}" still contains an example value. ` +
        "Generate a real secret with `npm run secrets` and put it in backend/.env."
    );
  }
  if (value.length < 32) {
    throw new Error(
      `Environment variable "${name}" must be at least 32 characters long. ` +
        "Generate a real secret with `npm run secrets`."
    );
  }
  return value;
}

// Every value below comes from the environment (backend/.env).
// No credentials or secret fallbacks are stored in this file.
export const env = {
  nodeEnv: required("NODE_ENV"),
  port: portFromEnv("PORT"),
  clientOrigin: required("CLIENT_ORIGIN"),
  corsOrigins: optional("CORS_ORIGINS", required("CLIENT_ORIGIN"))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  staticDist: optional("STATIC_DIST"),
  jwtAccessSecret: secretFromEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: secretFromEnv("JWT_REFRESH_SECRET"),
  accessTokenTtl: required("ACCESS_TOKEN_TTL"),
  refreshTokenTtl: required("REFRESH_TOKEN_TTL"),
  db: {
    enabled: booleanFromEnv("DB_ENABLED"),
    host: required("DB_HOST"),
    port: numberFromEnv("DB_PORT"),
    user: required("DB_USER"),
    // Local MySQL installs may have an empty password, but the key must exist.
    password: defined("DB_PASSWORD"),
    database: required("DB_NAME"),
    connectionLimit: numberFromEnv("DB_POOL_SIZE"),
    autoCreate: booleanFromEnv("DB_AUTO_CREATE"),
    autoMigrate: booleanFromEnv("DB_AUTO_MIGRATE"),
    adminUser: optional("DB_ADMIN_USER"),
    adminPassword: optional("DB_ADMIN_PASSWORD"),
  },
  razorpay: {
    enabled: booleanFromEnv("RAZORPAY_ENABLED"),
    keyId: optional("RAZORPAY_KEY_ID"),
    keySecret: optional("RAZORPAY_KEY_SECRET"),
    webhookSecret: optional("RAZORPAY_WEBHOOK_SECRET"),
  },
  ai: {
    enabled: booleanFromEnv("AI_ENABLED"),
    apiKey: optional("AI_API_KEY"),
    baseUrl: optional("AI_BASE_URL", "https://api.openai.com/v1"),
    model: optional("AI_MODEL", "gpt-4o-mini"),
  },
  storage: {
    driver: optional("STORAGE_DRIVER", "local"),
    bucket: optional("STORAGE_BUCKET"),
    region: optional("STORAGE_REGION", "ap-south-1"),
    publicBaseUrl: optional("STORAGE_PUBLIC_URL"),
  },
};

export const isProd = env.nodeEnv === "production";
