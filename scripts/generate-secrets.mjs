import { randomBytes } from "node:crypto";

const access = randomBytes(48).toString("hex");
const refresh = randomBytes(48).toString("hex");

console.log("# Add these lines to backend/.env. Never commit that file.");
console.log(`JWT_ACCESS_SECRET=${access}`);
console.log(`JWT_REFRESH_SECRET=${refresh}`);
