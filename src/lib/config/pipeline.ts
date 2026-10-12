import { PipelineStage } from "@/types";

export interface StageDefinition {
  id: PipelineStage;
  label: string;
  order: number;
  color: string;
  bgColor: string;
  description: string;
}

export const PIPELINE_STAGES: StageDefinition[] = [
  {
    id: "Discovered",
    label: "Discovered",
    order: 1,
    color: "#4A6F62",
    bgColor: "rgba(74, 111, 98, 0.12)",
    description: "Company identified as potential target",
  },
  {
    id: "Researched",
    label: "Researched",
    order: 2,
    color: "#2A6F5A",
    bgColor: "rgba(42, 111, 90, 0.12)",
    description: "Deep web research and cited sources gathered",
  },
  {
    id: "Qualified",
    label: "Qualified",
    order: 3,
    color: "#164E3E",
    bgColor: "rgba(22, 78, 62, 0.15)",
    description: "Fit score calculated and passed criteria (>=70)",
  },
  {
    id: "Contact Found",
    label: "Contact Found",
    order: 4,
    color: "#0284C7",
    bgColor: "rgba(2, 132, 199, 0.12)",
    description: "Verified partnership / DevRel contact located",
  },
  {
    id: "Draft Ready",
    label: "Draft Ready",
    order: 5,
    color: "#8B5CF6",
    bgColor: "rgba(139, 92, 246, 0.12)",
    description: "Personalized pitch email drafted by AI",
  },
  {
    id: "Approved",
    label: "Approved",
    order: 6,
    color: "#D97706",
    bgColor: "rgba(217, 119, 6, 0.15)",
    description: "Human organizer reviewed and approved for sending",
  },
  {
    id: "Contacted",
    label: "Contacted",
    order: 7,
    color: "#0EA5E9",
    bgColor: "rgba(14, 165, 233, 0.12)",
    description: "Outreach email sent via Gmail API",
  },
  {
    id: "Replied",
    label: "Replied",
    order: 8,
    color: "#6366F1",
    bgColor: "rgba(99, 102, 241, 0.12)",
    description: "Inbound response received and logged",
  },
  {
    id: "Interested",
    label: "Interested",
    order: 9,
    color: "#16A34A",
    bgColor: "rgba(22, 163, 74, 0.15)",
    description: "Sponsor confirmed interest or requested deck/call",
  },
  {
    id: "Negotiation",
    label: "Negotiation",
    order: 10,
    color: "#EAB308",
    bgColor: "rgba(234, 179, 8, 0.15)",
    description: "Discussing tier deliverables and sponsorship amount",
  },
  {
    id: "Committed",
    label: "Committed",
    order: 11,
    color: "#15803D",
    bgColor: "rgba(21, 128, 61, 0.20)",
    description: "Agreement closed & funds / perks committed!",
  },
  {
    id: "Lost",
    label: "Lost",
    order: 12,
    color: "#DC2626",
    bgColor: "rgba(220, 38, 38, 0.12)",
    description: "Passed or budget exhausted for this cycle",
  },
];
