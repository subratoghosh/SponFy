import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
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
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  return (
    !url.includes("your-neon-host") &&
    !url.includes("placeholder") &&
    (url.startsWith("postgres://") || url.startsWith("postgresql://"))
  );
}

export default prisma;
