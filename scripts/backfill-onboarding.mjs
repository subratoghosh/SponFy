import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database connection and backfilling existing users...");

  try {
    const result = await prisma.user.updateMany({
      where: {
        OR: [
          { onboardingStatus: { not: "COMPLETE" } },
          { onboarded: false },
        ],
      },
      data: {
        onboarded: true,
        onboardingStatus: "COMPLETE",
        accountMode: "INDIVIDUAL",
      },
    });

    console.log(`\nSuccess! Backfilled ${result.count} existing user(s) to onboardingStatus='COMPLETE', onboarded=true, and accountMode='INDIVIDUAL'.`);
  } catch (err) {
    console.error("Backfill failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
