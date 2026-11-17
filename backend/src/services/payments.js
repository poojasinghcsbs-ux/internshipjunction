import crypto from "node:crypto";
import { env } from "../config/env.js";

export function paymentsEnabled() {
  return env.razorpay.enabled && Boolean(env.razorpay.keyId && env.razorpay.keySecret);
}

function basicAuth() {
  return "Basic " + Buffer.from(`${env.razorpay.keyId}:${env.razorpay.keySecret}`).toString("base64");
}

export async function createOrder({ amount, currency = "INR", receipt, notes = {} }) {
  const amountPaise = Math.round(amount * 100);
  if (!paymentsEnabled()) {
    return {
      id: `order_sim_${Date.now()}`,
      amount: amountPaise,
      currency,
      receipt,
      notes,
      simulated: true,
      keyId: env.razorpay.keyId || "rzp_test_simulated",
    };
  }
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: basicAuth() },
    body: JSON.stringify({ amount: amountPaise, currency, receipt, notes }),
  });
  if (!response.ok) throw new Error(`Razorpay order creation failed: ${response.status}`);
  const order = await response.json();
  return { ...order, simulated: false, keyId: env.razorpay.keyId };
}

export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!paymentsEnabled()) {
    return { verified: true, simulated: true };
  }
  const expected = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const verified = expected === signature;
  return { verified, simulated: false };
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!env.razorpay.webhookSecret) return false;
  const expected = crypto
    .createHmac("sha256", env.razorpay.webhookSecret)
    .update(rawBody)
    .digest("hex");
  return expected === signature;
}

export function applyCoupon(coupons, code, amount) {
  const coupon = coupons.find((c) => c.code === code && c.active);
  if (!coupon) return { valid: false, discount: 0, total: amount, message: "Invalid or expired coupon code." };
  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.min((amount * coupon.value) / 100, coupon.maxDiscount ?? Infinity);
  } else {
    discount = Math.min(coupon.value, amount);
  }
  discount = Math.round(discount);
  return { valid: true, discount, total: Math.max(0, amount - discount), message: `Coupon applied. You saved ₹${discount}.`, code: coupon.code };
}
