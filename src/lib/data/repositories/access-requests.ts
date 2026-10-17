import { memoryStore } from "@/lib/data/memory-store";
import { AccessRequest } from "@/types";

export const demoAccessRequestsRef = memoryStore<AccessRequest[]>(
  "accessRequests",
  () => [
    {
      id: "req-demo-1",
      requesterId: "usr-demo-lead",
      campaignId: "cmp_demo_org_1",
      organisationId: "org-demo-1",
      requestedRole: "ORGANISER",
      message: "I am leading corporate outreach for the 2026 fest.",
      details: {
        roleInTeam: "Sponsorship Convenor",
        designation: "Sponsorship Convenor",
        department: "Corporate Relations",
        availabilityHours: "15",
        whyJoin: "Connect corporate brands and coordinate deals with the core team.",
      },
      status: "PENDING",
      createdAt: new Date().toISOString(),
    },
  ]
);
