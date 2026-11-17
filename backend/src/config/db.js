import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";
import { env } from "./env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, "../db/schema.sql");
// Keep database names to a safe subset; names are always quoted with backticks.
const databaseNamePattern = /^[A-Za-z0-9_$]+$/;

let pool = null;
let available = false;

// Connection-level failures are usually transient: a network blip, a database
// restart, or a remote host dropping an idle socket. Retrying once keeps these
// out of the API response instead of surfacing as a 500 error.
const TRANSIENT_DB_ERROR_CODES = new Set([
  "ECONNRESET",
  "EPIPE",
  "ETIMEDOUT",
  "PROTOCOL_CONNECTION_LOST",
]);

function isTransientDbError(error) {
  return TRANSIENT_DB_ERROR_CODES.has(error?.code);
}

function baseConnectionOptions() {
  return {
    host: env.db.host,
    port: env.db.port,
    connectTimeout: 10_000,
  };
}

function quoteIdentifier(value) {
  if (!databaseNamePattern.test(value)) {
    throw new Error(
      `Invalid DB_NAME "${value}". Use only letters, numbers, underscore, or dollar sign.`
    );
  }
  return `\`${value}\``;
}

function bootstrapCredentials() {
  const useAdmin = Boolean(env.db.adminUser);
  return {
    user: useAdmin ? env.db.adminUser : env.db.user,
    password: useAdmin ? env.db.adminPassword : env.db.password,
  };
}

async function databaseExists() {
  const connection = await mysql.createConnection({
    ...baseConnectionOptions(),
    ...bootstrapCredentials(),
  });
  try {
    const [rows] = await connection.execute(
      "SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?",
      [env.db.database]
    );
    return rows.length > 0;
  } finally {
    await connection.end().catch(() => {});
  }
}

async function createDatabaseIfMissing() {
  const quotedName = quoteIdentifier(env.db.database);

  if (await databaseExists()) {
    console.log(`[db] Database "${env.db.database}" already exists.`);
    return false;
  }

  const { user } = bootstrapCredentials();
  const connection = await mysql.createConnection({
    ...baseConnectionOptions(),
    ...bootstrapCredentials(),
  });

  let currentUser = user;
  let grantee = `'${env.db.user}'@'localhost'`;

  try {
    const [identityRows] = await connection.query("SELECT CURRENT_USER() AS currentUser");
    currentUser = String(identityRows[0]?.currentUser ?? user);
    const hostSeparator = currentUser.lastIndexOf("@");
    if (hostSeparator !== -1) {
      grantee = `'${env.db.user}'@'${currentUser.slice(hostSeparator + 1)}'`;
    }

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${quotedName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log(`[db] Created database "${env.db.database}".`);
    return true;
  } catch (error) {
    if (error.code === "ER_DBACCESS_DENIED_ERROR" || error.code === "ER_ACCESS_DENIED_ERROR") {
      throw new Error(
        `MySQL user "${currentUser}" cannot create database "${env.db.database}". ` +
          `Run this once with an admin account, then restart the backend:\n` +
          `  CREATE DATABASE IF NOT EXISTS ${quotedName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n` +
          `  GRANT ALL PRIVILEGES ON ${quotedName}.* TO ${grantee};\n` +
          `  FLUSH PRIVILEGES;\n` +
          `Alternatively set DB_ADMIN_USER and DB_ADMIN_PASSWORD in backend/.env.`
      );
    }
    throw error;
  } finally {
    await connection.end().catch(() => {});
  }
}

/**
 * Split a .sql file into individual statements. Handles quoted strings,
 * backtick identifiers, line comments (--, #) and block comments.
 */
function splitStatements(sql) {
  const statements = [];
  let current = "";
  let quote = null;
  let lineComment = false;
  let blockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
        current += char;
      }
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      current += char;
      if (char === "\\" && next !== undefined) {
        current += next;
        i += 1;
        continue;
      }
      if (char === quote) {
        if (next === quote) {
          current += next;
          i += 1;
          continue;
        }
        quote = null;
      }
      continue;
    }

    if (char === "-" && next === "-") {
      lineComment = true;
      i += 1;
      continue;
    }
    if (char === "#") {
      lineComment = true;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      current += char;
      continue;
    }
    if (char === ";") {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      continue;
    }
    current += char;
  }

  const last = current.trim();
  if (last) statements.push(last);
  return statements;
}

// Additive migrations for databases created by the earlier schema version.
// New installs get these columns directly from schema.sql.
const columnMigrations = [
  ["project_catalog", "course_title", "VARCHAR(200) NULL AFTER course_slug"],
  ["applications", "application_number", "VARCHAR(40) NULL AFTER id"],
  ["applications", "applicant_name", "VARCHAR(120) NULL AFTER slug"],
  ["applications", "email", "VARCHAR(190) NULL AFTER applicant_name"],
  ["applications", "phone", "VARCHAR(30) NULL AFTER email"],
  ["applications", "college", "VARCHAR(160) NULL AFTER phone"],
  ["applications", "degree", "VARCHAR(120) NULL AFTER college"],
  ["applications", "graduation_year", "VARCHAR(20) NULL AFTER degree"],
  ["applications", "duration", "VARCHAR(60) NULL AFTER graduation_year"],
  ["applications", "linkedin_url", "VARCHAR(500) NULL AFTER duration"],
  ["user_projects", "course_title", "VARCHAR(200) NULL AFTER course_slug"],
  ["user_projects", "difficulty", "ENUM('Beginner','Intermediate','Advanced') NULL AFTER course_title"],
  ["user_projects", "description", "TEXT NULL AFTER difficulty"],
  ["user_projects", "requirements", "JSON NULL AFTER description"],
  ["user_projects", "skills", "JSON NULL AFTER requirements"],
  ["user_projects", "estimated_hours", "INT NULL AFTER skills"],
  ["mock_interviews", "interviewer", "VARCHAR(120) NULL AFTER type"],
  ["orders", "program_id", "INT NULL AFTER program_type"],
  ["orders", "provider_payment_id", "VARCHAR(120) NULL AFTER provider_order_id"],
  ["orders", "simulated", "TINYINT(1) NOT NULL DEFAULT 0 AFTER provider_payment_id"],
];

async function ensureColumns() {
  for (const [table, column, definition] of columnMigrations) {
    const [rows] = await pool.query(
      "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?",
      [env.db.database, table, column]
    );
    if (rows.length === 0) {
      await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      console.log(`[db] Added column ${table}.${column}`);
    }
  }

  const [userIdColumn] = await pool.query(
    "SELECT IS_NULLABLE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'applications' AND COLUMN_NAME = 'user_id'",
    [env.db.database]
  );
  if (userIdColumn[0]?.IS_NULLABLE === "NO") {
    await pool.query("ALTER TABLE applications MODIFY COLUMN user_id INT NULL");
    console.log("[db] Allowed guest internship applications (applications.user_id is nullable).");
  }
}

async function applySchema() {
  const sql = await fs.readFile(schemaPath, "utf8");
  const statements = splitStatements(sql);
  let executed = 0;
  let skipped = 0;

  for (const statement of statements) {
    const normalized = statement.replace(/^\s+/, "");
    // The configured database is already selected on the pool. Never let the
    // schema file switch to a hardcoded database name.
    if (/^CREATE\s+DATABASE\b/i.test(normalized) || /^USE\b/i.test(normalized)) {
      continue;
    }

    try {
      await pool.query(statement);
      executed += 1;
    } catch (error) {
      // CREATE INDEX is not idempotent in MySQL; ignore indexes that already exist.
      if (error.code === "ER_DUP_KEYNAME" || error.code === "ER_MULTIPLE_PRI_KEY") {
        skipped += 1;
        continue;
      }
      const preview = normalized.split("\n")[0].slice(0, 120);
      throw new Error(`Failed to apply schema statement "${preview}": ${error.message}`);
    }
  }

  return { executed, skipped };
}

export async function initDb() {
  if (!env.db.enabled) {
    throw new Error(
      "MySQL is disabled (DB_ENABLED=false). This app requires MySQL; " +
        "set DB_ENABLED=true in backend/.env."
    );
  }

  try {
    if (env.db.autoCreate) {
      await createDatabaseIfMissing();
    }

    pool = mysql.createPool({
      ...baseConnectionOptions(),
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      waitForConnections: true,
      connectionLimit: env.db.connectionLimit,
      queueLimit: 0,
      timezone: "Z",
      decimalNumbers: true,
      // Keep idle connections alive so remote databases/firewalls do not drop them.
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
    await pool.query("SELECT 1");
    available = true;
    console.log(
      `[db] Connected to MySQL at ${env.db.host}:${env.db.port}/${env.db.database}`
    );

    if (env.db.autoMigrate) {
      const { executed, skipped } = await applySchema();
      await ensureColumns();
      console.log(
        `[db] Schema ready (${executed} statement${executed === 1 ? "" : "s"} applied` +
          `${skipped ? `, ${skipped} existing index${skipped === 1 ? "" : "es"} skipped` : ""}).`
      );
    }

    return true;
  } catch (error) {
    available = false;
    if (pool) {
      await pool.end().catch(() => {});
      pool = null;
    }
    if (error.code === "ER_ACCESS_DENIED_ERROR") {
      throw new Error(
        `[db] MySQL rejected the login for user "${env.db.user}" ` +
          `(${error.sqlMessage ?? error.message}). ` +
          "Check DB_USER/DB_PASSWORD, and make sure this machine's IP is allowed " +
          "in your MySQL host's remote-access/whitelist settings."
      );
    }
    throw new Error(
      `[db] MySQL initialization failed (${error.message}). ` +
        "Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_NAME in backend/.env."
    );
  }
}

export function dbAvailable() {
  return available;
}

export async function query(sql, params = []) {
  if (!pool) throw new Error("Database pool is not initialized");
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    if (!isTransientDbError(error)) throw error;
    // The broken connection has already been removed from the pool, so this
    // retry runs on a fresh connection.
    console.warn(`[db] ${error.code} while running a query; retrying once.`);
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

async function getConnection() {
  if (!pool) throw new Error("Database pool is not initialized");
  try {
    return await pool.getConnection();
  } catch (error) {
    if (!isTransientDbError(error)) throw error;
    console.warn(`[db] ${error.code} while connecting; retrying once.`);
    return pool.getConnection();
  }
}

export async function withTransaction(callback) {
  const connection = await getConnection();
  const executor = async (sql, params = []) => {
    const [rows] = await connection.execute(sql, params);
    return rows;
  };
  try {
    await connection.beginTransaction();
    const result = await callback(executor);
    await connection.commit();
    return result;
  } catch (error) {
    // A broken connection cannot roll back; never let that mask the real error.
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
    available = false;
  }
}

export default { initDb, dbAvailable, query, withTransaction, closeDb };
