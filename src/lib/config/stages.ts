import { Stage } from "@prisma/client";

export interface StageConfig {
  key: Stage;
  label: string;
  description: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
  step: number;
}

export const STAGE_CONFIGS: Record<Stage, StageConfig> = {
  DISCOVERED: {
    key: "DISCOVERED",
    label: "Discovered",
    description: "Identified via AI search or student suggestion",
    color: { bg: "bg-[#0C382E]/10", text: "text-[#0C382E]", border: "border-[#0C382E]/20" },
    step: 1,
  },
  RESEARCHED: {
    key: "RESEARCHED",
    label: "Researched",
    description: "Deep dossier with verified sources compiled",
    color: { bg: "bg-[#0284C7]/12", text: "text-[#0284C7]", border: "border-[#0284C7]/35" },
    step: 2,
  },
  QUALIFIED: {
    key: "QUALIFIED",
    label: "Qualified",
    description: "Passes event criteria with fit score >= 60",
    color: { bg: "bg-[#2A6F5A]/15", text: "text-[#0E3B2E]", border: "border-[#2A6F5A]/30" },
    step: 3,
  },
  CONTACT_FOUND: {
    key: "CONTACT_FOUND",
    label: "Contact Found",
    description: "Verified partnership or developer relations contact",
    color: { bg: "bg-[#D97706]/12", text: "text-[#D97706]", border: "border-[#D97706]/35" },
    step: 4,
  },
  DRAFT_READY: {
    key: "DRAFT_READY",
    label: "Draft Ready",
    description: "Personalized pitch generated awaiting student review",
    color: { bg: "bg-[#FFF0B3]", text: "text-[#0C382E]", border: "border-[#0C382E]/25" },
    step: 5,
  },
  APPROVED: {
    key: "APPROVED",
    label: "Approved",
    description: "Human organizer reviewed and approved for Gmail dispatch",
    color: { bg: "bg-[#16A34A]/15", text: "text-[#16A34A]", border: "border-[#16A34A]/35" },
    step: 6,
  },
  CONTACTED: {
    key: "CONTACTED",
    label: "Contacted",
    description: "Email dispatched via Gmail API; awaiting reply",
    color: { bg: "bg-[#428E75]/15", text: "text-[#0C382E]", border: "border-[#428E75]/30" },
    step: 7,
  },
  REPLIED: {
    key: "REPLIED",
    label: "Replied",
    description: "Response received and analyzed by AI",
    color: { bg: "bg-[#0284C7]/15", text: "text-[#0284C7]", border: "border-[#0284C7]/35" },
    step: 8,
  },
  INTERESTED: {
    key: "INTERESTED",
    label: "Interested",
    description: "Sponsor expressed direct interest in partnering",
    color: { bg: "bg-[#16A34A]/20", text: "text-[#0E3B2E]", border: "border-[#16A34A]/40" },
    step: 9,
  },
  NEGOTIATION: {
    key: "NEGOTIATION",
    label: "Negotiation",
    description: "Discussing tier, deliverables, or contract terms",
    color: { bg: "bg-[#D97706]/20", text: "text-[#92400E]", border: "border-[#D97706]/40" },
    step: 10,
  },
  COMMITTED: {
    key: "COMMITTED",
    label: "Committed",
    description: "Sponsorship confirmed and MoU / payment in progress",
    color: { bg: "bg-[#16A34A]/25", text: "text-[#15803D]", border: "border-[#16A34A]/50" },
    step: 11,
  },
  LOST: {
    key: "LOST",
    label: "Lost",
    description: "Declined or stopped replying after follow-ups",
    color: { bg: "bg-[#DC2626]/12", text: "text-[#DC2626]", border: "border-[#DC2626]/35" },
    step: 12,
  },
};

export const PIPELINE_STAGES: Stage[] = [
  "DISCOVERED",
  "RESEARCHED",
  "QUALIFIED",
  "CONTACT_FOUND",
  "DRAFT_READY",
  "APPROVED",
  "CONTACTED",
  "REPLIED",
  "INTERESTED",
  "NEGOTIATION",
  "COMMITTED",
  "LOST",
];

// Kanban columns grouped for intuitive desktop viewing
export const KANBAN_COLUMNS: { id: string; title: string; stages: Stage[] }[] = [
  { id: "prospects", title: "Prospects", stages: ["DISCOVERED", "RESEARCHED", "QUALIFIED"] },
  { id: "outreach", title: "Ready & Outreach", stages: ["CONTACT_FOUND", "DRAFT_READY", "APPROVED", "CONTACTED"] },
  { id: "engagement", title: "In Discussion", stages: ["REPLIED", "INTERESTED", "NEGOTIATION"] },
  { id: "closed", title: "Outcomes", stages: ["COMMITTED", "LOST"] },
];
