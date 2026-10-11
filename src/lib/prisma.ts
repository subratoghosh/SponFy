import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    datasources: process.env.DATABASE_URL
      ? { db: { url: process.env.DATABASE_URL } }
      : undefined,
    log: [
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" },
    ],
  });

  // Filter out benign remote idle pool cleanup by Neon Serverless / PgBouncer (Windows 10054 ConnectionReset)
  client.$on("error" as never, (e: any) => {
    const msg = e?.message || "";
    if (
      msg.includes("10054") ||
      msg.includes("ConnectionReset") ||
      msg.includes("forcibly closed by the remote host") ||
      msg.includes("kind: ConnectionReset")
    ) {
      // Harmless: Neon serverless compute suspended idle connections or PgBouncer recycled idle pool socket.
      return;
    }
    console.error("[Prisma Error]", e);
  });

  client.$on("warn" as never, (e: any) => {
    const msg = e?.message || "";
    if (msg.includes("10054") || msg.includes("ConnectionReset")) return;
    console.warn("[Prisma Warn]", e);
  });

  return client;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

// Neon Serverless PostgreSQL / Prisma ORM client singleton with auto-reconnect retry extension
const basePrisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = basePrisma;
}

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        try {
          return await query(args);
        } catch (err: any) {
          const msg = err?.message || String(err);
          // If Neon serverless closed the idle socket right before this query, retry once with a freshly negotiated connection
          if (
            msg.includes("10054") ||
            msg.includes("ConnectionReset") ||
            msg.includes("forcibly closed") ||
            msg.includes("closed the connection")
          ) {
            return await query(args);
          }
          throw err;
        }
      },
    },
  },
}) as unknown as typeof basePrisma;

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
