import { ShowcaseCompany, AdminLogEntry } from "@/types";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { memoryStore } from "@/lib/data/memory-store";
import { revalidatePath } from "next/cache";

export const INITIAL_SHOWCASE_COMPANIES: ShowcaseCompany[] = [
  {
    id: "showcase-1",
    name: "Acme Cloud",
    websiteUrl: "https://acmecloud.dev",
    logoUrl: null,
    industry: "Developer Tools",
    shortDescription: "API and cloud platform with active student developer grants and workshops.",
    sortOrder: 0,
    isVisible: true,
    isPartner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "showcase-2",
    name: "Nimbus APIs",
    websiteUrl: "https://nimbus.dev",
    logoUrl: null,
    industry: "Developer Platform",
    shortDescription: "Developer tooling ecosystem and community platform supporting student builders.",
    sortOrder: 1,
    isVisible: true,
    isPartner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "showcase-3",
    name: "Orbit Payments",
    websiteUrl: "https://orbitpay.com",
    logoUrl: null,
    industry: "Fintech & Payments",
    shortDescription: "Full-stack payment infrastructure with startup and community partnership grants.",
    sortOrder: 2,
    isVisible: true,
    isPartner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "showcase-4",
    name: "DevStack Labs",
    websiteUrl: "https://devstack.io",
    logoUrl: null,
    industry: "Developer Tools",
    shortDescription: "Developer platform empowering student builders with cloud packs and tools.",
    sortOrder: 3,
    isVisible: true,
    isPartner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "showcase-5",
    name: "Vortex Data",
    websiteUrl: "https://vortexdata.dev",
    logoUrl: null,
    industry: "Cloud & Data",
    shortDescription: "Database and cloud analytics platform offering student developer tier benefits.",
    sortOrder: 4,
    isVisible: true,
    isPartner: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const showcaseStoreRef = memoryStore<ShowcaseCompany[]>("showcaseCompanies", () => [
  ...INITIAL_SHOWCASE_COMPANIES,
]);
const adminLogsStoreRef = memoryStore<AdminLogEntry[]>("adminLogs", () => []);

export async function logAdminAction(
  adminEmail: string,
  action: string,
  targetType: string,
  targetId?: string | null,
  details: any = {}
): Promise<void> {
  const logEntry: AdminLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    adminEmail,
    action,
    targetType,
    targetId: targetId || null,
    details,
    createdAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured() && (prisma as any).adminLog) {
    try {
      await (prisma as any).adminLog.create({
        data: {
          adminEmail,
          action,
          targetType,
          targetId: targetId || null,
          details,
        },
      });
      return;
    } catch {
      // Fall through to memory store on DB timeout
    }
  }

  adminLogsStoreRef.value = [logEntry, ...adminLogsStoreRef.value];
}

export async function getAdminLogs(): Promise<AdminLogEntry[]> {
  if (isDatabaseConfigured() && (prisma as any).adminLog) {
    try {
      const records = await (prisma as any).adminLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return records;
    } catch {
      // Fall through
    }
  }
  return adminLogsStoreRef.value;
}

/**
 * Public read of visible showcase companies, ordered by sortOrder.
 * Contains ZERO user data.
 */
export async function getVisibleShowcaseCompanies(): Promise<ShowcaseCompany[]> {
  if (isDatabaseConfigured() && (prisma as any).showcaseCompany) {
    try {
      const records = await (prisma as any).showcaseCompany.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
      });
      if (records && records.length > 0) {
        return records;
      }
    } catch {
      // fallback to memory store
    }
  }

  return showcaseStoreRef.value
    .filter((c: ShowcaseCompany) => c.isVisible)
    .sort((a: ShowcaseCompany, b: ShowcaseCompany) => a.sortOrder - b.sortOrder);
}

/**
 * Admin read of all showcase companies (including hidden).
 */
export async function getAllShowcaseCompanies(): Promise<ShowcaseCompany[]> {
  if (isDatabaseConfigured() && (prisma as any).showcaseCompany) {
    try {
      const records = await (prisma as any).showcaseCompany.findMany({
        orderBy: { sortOrder: "asc" },
      });
      if (records && records.length > 0) {
        return records;
      }
    } catch {
      // fallback
    }
  }

  return [...showcaseStoreRef.value].sort(
    (a: ShowcaseCompany, b: ShowcaseCompany) => a.sortOrder - b.sortOrder
  );
}

/**
 * Admin create showcase company.
 */
export async function createShowcaseCompany(
  data: Omit<ShowcaseCompany, "id" | "createdAt" | "updatedAt">,
  adminEmail: string
): Promise<ShowcaseCompany> {
  const newCompany: ShowcaseCompany = {
    id: `showcase-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isDatabaseConfigured() && (prisma as any).showcaseCompany) {
    try {
      const created = await (prisma as any).showcaseCompany.create({
        data,
      });
      await logAdminAction(adminEmail, "CREATE_SHOWCASE_COMPANY", "ShowcaseCompany", created.id, { name: data.name });
      try {
        revalidatePath("/");
        revalidatePath("/showcase");
      } catch {}
      return created;
    } catch {
      // fallback to memory
    }
  }

  showcaseStoreRef.value = [...showcaseStoreRef.value, newCompany];
  await logAdminAction(adminEmail, "CREATE_SHOWCASE_COMPANY", "ShowcaseCompany", newCompany.id, { name: data.name });
  try {
    revalidatePath("/");
    revalidatePath("/showcase");
  } catch {}
  return newCompany;
}

/**
 * Admin update showcase company.
 */
export async function updateShowcaseCompany(
  id: string,
  data: Partial<Omit<ShowcaseCompany, "id" | "createdAt" | "updatedAt">>,
  adminEmail: string
): Promise<ShowcaseCompany | null> {
  if (isDatabaseConfigured() && (prisma as any).showcaseCompany) {
    try {
      const updated = await (prisma as any).showcaseCompany.update({
        where: { id },
        data,
      });
      await logAdminAction(adminEmail, "UPDATE_SHOWCASE_COMPANY", "ShowcaseCompany", id, data);
      try {
        revalidatePath("/");
        revalidatePath("/showcase");
      } catch {}
      return updated;
    } catch {
      // fallback
    }
  }

  const list = showcaseStoreRef.value;
  const idx = list.findIndex((c: ShowcaseCompany) => c.id === id);
  if (idx === -1) return null;

  const updated: ShowcaseCompany = {
    ...list[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...list];
  nextList[idx] = updated;
  showcaseStoreRef.value = nextList;

  await logAdminAction(adminEmail, "UPDATE_SHOWCASE_COMPANY", "ShowcaseCompany", id, data);
  try {
    revalidatePath("/");
    revalidatePath("/showcase");
  } catch {}
  return updated;
}

/**
 * Admin delete showcase company.
 */
export async function deleteShowcaseCompany(id: string, adminEmail: string): Promise<boolean> {
  if (isDatabaseConfigured() && (prisma as any).showcaseCompany) {
    try {
      await (prisma as any).showcaseCompany.delete({
        where: { id },
      });
      await logAdminAction(adminEmail, "DELETE_SHOWCASE_COMPANY", "ShowcaseCompany", id);
      try {
        revalidatePath("/");
        revalidatePath("/showcase");
      } catch {}
      return true;
    } catch {
      // fallback
    }
  }

  showcaseStoreRef.value = showcaseStoreRef.value.filter((c: ShowcaseCompany) => c.id !== id);

  await logAdminAction(adminEmail, "DELETE_SHOWCASE_COMPANY", "ShowcaseCompany", id);
  try {
    revalidatePath("/");
    revalidatePath("/showcase");
  } catch {}
  return true;
}

/**
 * Admin reorder showcase companies.
 */
export async function reorderShowcaseCompanies(
  orderedIds: string[],
  adminEmail: string
): Promise<void> {
  if (isDatabaseConfigured() && (prisma as any).showcaseCompany) {
    try {
      await Promise.all(
        orderedIds.map((id, index) =>
          (prisma as any).showcaseCompany.update({
            where: { id },
            data: { sortOrder: index },
          })
        )
      );
      await logAdminAction(adminEmail, "REORDER_SHOWCASE_COMPANIES", "ShowcaseCompany", null, { orderedIds });
      try {
        revalidatePath("/");
        revalidatePath("/showcase");
      } catch {}
      return;
    } catch {
      // fallback
    }
  }

  const list = showcaseStoreRef.value;
  const map = new Map(list.map((c: ShowcaseCompany) => [c.id, c]));
  const reordered: ShowcaseCompany[] = [];

  orderedIds.forEach((id, index) => {
    const item = map.get(id);
    if (item) {
      reordered.push({
        ...item,
        sortOrder: index,
        updatedAt: new Date().toISOString(),
      });
    }
  });

  showcaseStoreRef.value = reordered;
  await logAdminAction(adminEmail, "REORDER_SHOWCASE_COMPANIES", "ShowcaseCompany", null, { orderedIds });
  try {
    revalidatePath("/");
    revalidatePath("/showcase");
  } catch {}
}
