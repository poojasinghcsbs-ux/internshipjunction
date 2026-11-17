import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { env, isProd } from "./config/env.js";
import { initDb } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { rateLimit } from "./middleware/rate-limit.js";
import { seedDatabase } from "./db/seed.js";
import { demoCredentials } from "./data/users.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (isProd) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

const allowedOrigins = env.corsOrigins;
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (server-to-server, curl) are allowed.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/api/auth",
  rateLimit({ windowMs: 60_000, max: 120, keyGenerator: (req) => `auth:${req.ip}` })
);
app.use(
  "/api",
  rateLimit({ windowMs: 60_000, max: 600, keyGenerator: (req) => `api:${req.ip}` })
);

app.use("/api", routes);

// In production (single-repo mode): backend can optionally serve the built frontend.
// Set STATIC_DIST env var, or use Nginx (recommended) to serve frontend/dist/ separately.
const clientDist = env.staticDist || path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await initDb();
  await seedDatabase();

  const server = app.listen(env.port, () => {
    console.log(`\n  InternshipJunction API ready`);
    console.log(`  http://localhost:${env.port}/api/health`);
    console.log(`  Database: MySQL (${env.db.database})`);
    console.log(`  Demo login: ${demoCredentials.student.email} / ${demoCredentials.student.password}\n`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`\n[startup] Port ${env.port} is already in use.`);
      console.error("[startup] Stop the other process or change PORT in backend/.env.\n");
      console.error(`  Windows:     Get-NetTCPConnection -LocalPort ${env.port} -State Listen`);
      console.error("               Stop-Process -Id <PID> -Force");
      console.error(`  macOS/Linux: lsof -i :${env.port}   then   kill <PID>\n`);
      process.exit(1);
    }
    console.error("[startup] Server error:", error);
    process.exit(1);
  });

  const shutdown = () => server.close(() => process.exit(0));
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("[startup] Failed to start InternshipJunction API.");
  console.error(error);
  process.exitCode = 1;
});
