import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `var` declarations in TypeScript
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Neon Serverless PostgreSQL / Prisma ORM client singleton
// Ensures Next.js hot-reloading doesn't create multiple instances in development
export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: process.env.DATABASE_URL
      ? { db: { url: process.env.DATABASE_URL } }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/**
 * Helper to check whether a valid PostgreSQL / Neon DATABASE_URL is configured
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  return (
    !url.includes("your-neon-host") &&
    !url.includes("placeholder") &&
    (url.startsWith("postgres://") || url.startsWith("postgresql://"))
  );
}

export default prisma;
