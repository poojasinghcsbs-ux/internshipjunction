import { query } from "../config/db.js";
import { mapCoupon, mapOrder } from "../db/mappers.js";

export async function listCoupons() {
  const rows = await query("SELECT * FROM coupons ORDER BY code ASC");
  return rows.map(mapCoupon);
}

export async function findCoupon(code) {
  const rows = await query("SELECT * FROM coupons WHERE code = ? LIMIT 1", [
    String(code ?? "").toUpperCase(),
  ]);
  return mapCoupon(rows[0]);
}

export async function createCoupon(data) {
  await query(
    `INSERT INTO coupons (code, type, value, max_discount, active, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      String(data.code).toUpperCase(),
      data.type,
      Number(data.value),
      Number(data.maxDiscount ?? data.value),
      data.active === false ? 0 : 1,
      data.description ?? "",
    ]
  );
  return findCoupon(data.code);
}

export async function createOrderRecord(data) {
  const result = await query(
    `INSERT INTO orders
      (user_id, program, program_type, program_id, plan, base_amount, discount, amount,
       coupon_code, provider, provider_order_id, provider_payment_id, simulated, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      Number(data.userId),
      data.program,
      data.programType ?? null,
      data.programId ?? null,
      data.plan ?? null,
      Number(data.baseAmount ?? 0),
      Number(data.discount ?? 0),
      Number(data.amount ?? 0),
      data.couponCode ?? null,
      data.provider ?? "razorpay",
      data.providerOrderId ?? null,
      data.providerPaymentId ?? null,
      data.simulated ? 1 : 0,
      data.status ?? "pending",
    ]
  );
  return getOrderById(result.insertId);
}

export async function getOrderById(id) {
  const rows = await query("SELECT * FROM orders WHERE id = ? LIMIT 1", [Number(id)]);
  return mapOrder(rows[0]);
}

export async function getOrderForUser(id, userId) {
  const rows = await query("SELECT * FROM orders WHERE id = ? AND user_id = ? LIMIT 1", [
    Number(id),
    Number(userId),
  ]);
  return mapOrder(rows[0]);
}

export async function markOrderPaid(id, { paymentId, simulated = false } = {}) {
  await query(
    "UPDATE orders SET status = 'paid', provider_payment_id = ?, simulated = ? WHERE id = ?",
    [paymentId ?? null, simulated ? 1 : 0, Number(id)]
  );
  return getOrderById(id);
}

export async function listOrders({ status } = {}) {
  const rows = status
    ? await query("SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC, id DESC", [status])
    : await query("SELECT * FROM orders ORDER BY created_at DESC, id DESC");
  return rows.map(mapOrder);
}

export async function refundOrder(id) {
  await query("UPDATE orders SET status = 'refunded' WHERE id = ?", [Number(id)]);
  return getOrderById(id);
}

export async function orderTotals() {
  const rows = await query(
    `SELECT
       COUNT(*) AS total,
       SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid,
       COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS revenue
     FROM orders`
  );
  return {
    total: Number(rows[0]?.total ?? 0),
    paid: Number(rows[0]?.paid ?? 0),
    revenue: Number(rows[0]?.revenue ?? 0),
  };
}
