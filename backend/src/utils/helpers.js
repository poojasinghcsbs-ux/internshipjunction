export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function paginate(items, query) {
  const page = Math.max(1, Number(query.page ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(query.pageSize ?? 9)));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export function sanitizeText(value) {
  if (typeof value !== "string") return value;
  return value.replace(/[<>]/g, "").trim();
}

export function pick(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
}
