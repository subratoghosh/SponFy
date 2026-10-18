import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: process.env.DATABASE_URL
      ? { db: { url: process.env.DATABASE_URL } }
      : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    // Neon (us-east) is far from India, so each query adds ~250ms+ of latency.
    // The default 5s interactive-transaction timeout is too short for multi-step
    // writes (create organisation + campaign, approve access request), which then
    // roll back with "Transaction already closed".
    transactionOptions: {
      maxWait: 10_000,
      timeout: 30_000,
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

// Neon Serverless PostgreSQL / Prisma ORM client singleton
// Ensures Next.js hot-reloading doesn't create multiple instances in development
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

/**
 * Helper to check whether a valid PostgreSQL / Neon DATABASE_URL is configured
 */
export function isDatabaseConfigured(): boolean {
  if (process.env.NODE_ENV === "test") return false;
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  return (
    !url.includes("your-neon-host") &&
    !url.includes("placeholder") &&
    (url.startsWith("postgres://") || url.startsWith("postgresql://"))
  );
}

export default prisma;
