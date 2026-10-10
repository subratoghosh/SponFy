import { isDatabaseConfigured } from "@/lib/prisma";
import { isDemoMode } from "@/lib/env";
import { prismaRepositories } from "./prisma";
import { mockRepositories } from "./mock";
import { RepositoryBundle } from "./types";

export function getRepositories(): RepositoryBundle {
  // If Demo Mode is enabled or no database is configured, use in-memory mock repositories
  if (isDemoMode() || !isDatabaseConfigured()) {
    return mockRepositories;
  }
  return prismaRepositories;
}

export const repositories = getRepositories();

export * from "./types";
