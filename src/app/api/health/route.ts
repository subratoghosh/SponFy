import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const startTime = Date.now();

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  let dbStatus = "not_configured";
  let isDbHealthy = true;

  if (isDatabaseConfigured()) {
    try {
      // Execute a minimal lightweight query to test pooler responsiveness
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = "connected";
    } catch (err: any) {
      console.error("[HealthCheck] Database connection check failed:", err?.message || err);
      dbStatus = "disconnected";
      isDbHealthy = false;
    }
  } else {
    dbStatus = "in_memory_mode";
  }

  const isHealthy = isDbHealthy;
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      timestamp,
      uptimeSeconds,
      environment: process.env.NODE_ENV || "development",
      storage: {
        mode: isDatabaseConfigured() ? "postgresql_neon" : "demo_memory",
        database: dbStatus,
      },
      version: process.env.npm_package_version || "0.1.0",
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Content-Type": "application/json",
      },
    }
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
