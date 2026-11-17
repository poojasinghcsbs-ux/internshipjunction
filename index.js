#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const appRoot = __dirname;
process.chdir(appRoot);

const envFile = path.join(appRoot, "backend", ".env");
const distEntry = path.join(appRoot, "frontend", "dist", "index.html");
const backendEntry = pathToFileURL(
  path.join(appRoot, "backend", "src", "index.js")
).href;

if (!fs.existsSync(envFile)) {
  console.warn(`[startup] Missing ${envFile}`);
  console.warn(
    "[startup] Either add backend/.env, or set all required variables in cPanel > Setup Node.js App > Environment Variables."
  );
}

if (!fs.existsSync(distEntry)) {
  console.warn(
    "[startup] frontend/dist not found. The API will start, but the website will not be served."
  );
  console.warn(
    '[startup] Build it first with "npm run build", or upload the built dist folder.'
  );
}

process.on("unhandledRejection", (reason) => {
  console.error("[startup] Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[startup] Uncaught exception:", error);
  process.exit(1);
});

console.log(
  "[startup] Starting InternshipJunction (Express API + built frontend)..."
);

import(backendEntry).catch((error) => {
  console.error("[startup] Failed to start the application.");
  if (error && error.code === "ERR_MODULE_NOT_FOUND") {
    console.error(
      '[startup] A dependency is missing. Run "npm install" in the application root.'
    );
  }
  console.error(error);
  process.exit(1);
});
