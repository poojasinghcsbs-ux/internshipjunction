import net from "node:net";

const DEFAULT_SERVICES = [
  { name: "backend", port: 5000 },
  { name: "frontend", port: 5173 },
];

const args = process.argv.slice(2);
const services = args.length
  ? args.map((value) => {
      const [name, port] = value.includes("=") ? value.split("=") : [value, value];
      return { name, port: Number(port) };
    })
  : DEFAULT_SERVICES;

function canConnect(host, port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let settled = false;

    const finish = (value) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    };

    socket.setTimeout(700);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

async function isInUse(port) {
  if (await canConnect("127.0.0.1", port)) return true;
  if (await canConnect("::1", port)) return true;
  return false;
}

function printHelp(port) {
  console.error(`  Windows:     Get-NetTCPConnection -LocalPort ${port} -State Listen`);
  console.error("               Stop-Process -Id <PID> -Force");
  console.error(`  macOS/Linux: lsof -i :${port}   then   kill <PID>`);
}

const results = [];
for (const service of services) {
  if (!Number.isInteger(service.port) || service.port < 1 || service.port > 65535) {
    console.error(`[ports] Invalid port: ${service.port}`);
    process.exit(1);
  }
  results.push({ ...service, inUse: await isInUse(service.port) });
}

console.log("\nPort status");
for (const item of results) {
  const status = item.inUse ? "IN USE" : "free";
  console.log(`  ${String(item.port).padEnd(5)} ${item.name.padEnd(10)} ${status}`);
}
console.log("");

const busy = results.filter((item) => item.inUse);
if (busy.length) {
  console.error("[ports] Some ports are already in use.");
  for (const item of busy) {
    console.error(`\n  ${item.name} (${item.port}) is busy. Stop the other process:`);
    printHelp(item.port);
  }
  console.error("\n[ports] Or change the port in backend/.env (PORT) / frontend/vite.config.ts.\n");
  process.exit(1);
}
