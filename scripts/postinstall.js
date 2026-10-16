const { execSync } = require("child_process");

try {
  // Generate Prisma Client if prisma CLI binary is present in node_modules
  execSync("npx --no-install prisma generate", { stdio: "inherit" });
} catch {
  // If prisma CLI is omitted in production-only installs (e.g. npm ci --omit=dev),
  // skip gracefully without breaking npm install / npm ci.
  console.log("Notice: Prisma CLI not available in postinstall; skipping code generation.");
  process.exit(0);
}
