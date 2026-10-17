import { memoryStore } from "@/lib/data/memory-store";

export interface DemoOrg {
  id: string;
  name: string;
  slug: string;
  type: string;
  description?: string | null;
  website?: string | null;
  city?: string | null;
  createdById: string;
}

export const demoOrganisationsRef = memoryStore<DemoOrg[]>(
  "organisations",
  () => [
    {
      id: "org-demo-1",
      name: "TechFest Committee",
      slug: "techfest-committee",
      type: "College Club",
      city: "Mumbai",
      createdById: "usr-demo-organiser",
    },
  ]
);
