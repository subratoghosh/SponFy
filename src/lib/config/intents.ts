import { Intent } from "@prisma/client";

export interface IntentConfig {
  key: Intent;
  label: string;
  badge: {
    bg: string;
    text: string;
    border: string;
  };
  recommendedAction: string;
  defaultNextStage?: string;
}

export const INTENT_CONFIGS: Record<Intent, IntentConfig> = {
  INTERESTED: {
    key: "INTERESTED",
    label: "Interested",
    badge: { bg: "bg-[#16A34A]/15", text: "text-[#16A34A]", border: "border-[#16A34A]/35" },
    recommendedAction: "Send brochure & schedule call",
    defaultNextStage: "INTERESTED",
  },
  POSITIVE: {
    key: "POSITIVE",
    label: "Positive",
    badge: { bg: "bg-[#16A34A]/12", text: "text-[#15803D]", border: "border-[#16A34A]/30" },
    recommendedAction: "Share sponsorship tiers & deliverables",
    defaultNextStage: "INTERESTED",
  },
  NEEDS_INFO: {
    key: "NEEDS_INFO",
    label: "Needs Information",
    badge: { bg: "bg-[#0284C7]/12", text: "text-[#0284C7]", border: "border-[#0284C7]/35" },
    recommendedAction: "Answer specific questions requested",
    defaultNextStage: "REPLIED",
  },
  NEGOTIATING: {
    key: "NEGOTIATING",
    label: "Negotiating",
    badge: { bg: "bg-[#D97706]/15", text: "text-[#D97706]", border: "border-[#D97706]/35" },
    recommendedAction: "Customize deliverables & quote",
    defaultNextStage: "NEGOTIATION",
  },
  NOT_INTERESTED: {
    key: "NOT_INTERESTED",
    label: "Not Interested",
    badge: { bg: "bg-[#DC2626]/12", text: "text-[#DC2626]", border: "border-[#DC2626]/35" },
    recommendedAction: "Mark as lost & halt follow-ups",
    defaultNextStage: "LOST",
  },
  MAYBE_LATER: {
    key: "MAYBE_LATER",
    label: "Maybe Later",
    badge: { bg: "bg-[#D97706]/10", text: "text-[#B45309]", border: "border-[#D97706]/25" },
    recommendedAction: "Schedule reminder for next campaign cycle",
    defaultNextStage: "REPLIED",
  },
  OUT_OF_OFFICE: {
    key: "OUT_OF_OFFICE",
    label: "Out of Office",
    badge: { bg: "bg-[#0C382E]/10", text: "text-[#0C382E]", border: "border-[#0C382E]/20" },
    recommendedAction: "Delay next follow-up until return date",
    defaultNextStage: "CONTACTED",
  },
  UNCLEAR: {
    key: "UNCLEAR",
    label: "Unclear Response",
    badge: { bg: "bg-[#0C382E]/15", text: "text-[#244D3F]", border: "border-[#0C382E]/25" },
    recommendedAction: "Review manually before replying",
    defaultNextStage: "REPLIED",
  },
};
