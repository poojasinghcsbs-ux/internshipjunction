import { query } from "../config/db.js";
import { mapAuditLog } from "../db/mappers.js";

export async function audit(userId, action, entity, entityId, meta = {}) {
  try {
    await query(
      "INSERT INTO audit_logs (user_id, action, entity, entity_id, meta) VALUES (?, ?, ?, ?, ?)",
      [
        userId ? Number(userId) : null,
        action,
        entity,
        entityId === undefined || entityId === null ? null : String(entityId),
        JSON.stringify(meta ?? {}),
      ]
    );
  } catch (error) {
    console.warn(`[audit] Could not write audit log: ${error.message}`);
  }
}

export async function listAuditLogs() {
  const rows = await query("SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC");
  return rows.map(mapAuditLog);
}
