import { PipelineStage, ReplyIntent } from "@/types";

export const APP_NAME = "SponFy";
export const APP_TAGLINE = "AI Sponsorship Operating System for College Fests & Hackathons";
export const DEFAULT_DAILY_SEND_CAP = 30;

// Central Nav Configuration
export const NAV_ITEMS = [
  { label: "Overview", href: "/app", icon: "LayoutDashboard" },
  { label: "Campaigns", href: "/app/campaigns", icon: "FolderKanban" },
  { label: "Discover", href: "/app/discover", icon: "Compass" },
  { label: "Sponsors", href: "/app/sponsors", icon: "Building2" },
  { label: "Outreach", href: "/app/outreach", icon: "Send" },
  { label: "Replies", href: "/app/replies", icon: "Inbox" },
  { label: "Follow-ups", href: "/app/followups", icon: "Clock" },
  { label: "Analytics", href: "/app/analytics", icon: "BarChart3" },
  { label: "Settings", href: "/app/settings", icon: "Settings" },
];

export const MOBILE_NAV_ITEMS = [
  { label: "Overview", href: "/app", icon: "LayoutDashboard" },
  { label: "Sponsors", href: "/app/sponsors", icon: "Building2" },
  { label: "Outreach", href: "/app/outreach", icon: "Send" },
  { label: "Replies", href: "/app/replies", icon: "Inbox" },
  { label: "More", href: "/app/campaigns", icon: "Menu" },
];

// Industries list for campaign wizard and filters
export const TARGET_INDUSTRIES = [
  "Developer Tools",
  "Cloud & DevOps",
  "Fintech & Payments",
  "SaaS & Productivity",
  "EdTech & Upskilling",
  "Web3 & Blockchain",
  "AI & Machine Learning",
  "Gaming & Entertainment",
  "Hardware & IoT",
  "Consumer Brands & FMCG",
];

// Intent Colors & Badges mapping
export const INTENT_CONFIG: Record<
  ReplyIntent,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  Interested: {
    label: "Interested",
    bg: "rgba(22, 163, 74, 0.12)",
    text: "#16A34A",
    border: "rgba(22, 163, 74, 0.35)",
    icon: "CheckCircle2",
  },
  Positive: {
    label: "Positive",
    bg: "rgba(34, 197, 94, 0.12)",
    text: "#15803D",
    border: "rgba(34, 197, 94, 0.30)",
    icon: "Smile",
  },
  "Needs Info": {
    label: "Needs Info",
    bg: "rgba(2, 132, 199, 0.12)",
    text: "#0284C7",
    border: "rgba(2, 132, 199, 0.30)",
    icon: "HelpCircle",
  },
  Negotiating: {
    label: "Negotiating",
    bg: "rgba(217, 119, 6, 0.12)",
    text: "#D97706",
    border: "rgba(217, 119, 6, 0.35)",
    icon: "Scale",
  },
  "Not Interested": {
    label: "Not Interested",
    bg: "rgba(220, 38, 38, 0.10)",
    text: "#DC2626",
    border: "rgba(220, 38, 38, 0.30)",
    icon: "XCircle",
  },
  "Maybe Later": {
    label: "Maybe Later",
    bg: "rgba(100, 116, 139, 0.12)",
    text: "#475569",
    border: "rgba(100, 116, 139, 0.30)",
    icon: "Clock",
  },
  "Out of Office": {
    label: "Out of Office",
    bg: "rgba(148, 163, 184, 0.15)",
    text: "#64748B",
    border: "rgba(148, 163, 184, 0.30)",
    icon: "CalendarOff",
  },
  Unclear: {
    label: "Unclear",
    bg: "rgba(241, 245, 249, 0.8)",
    text: "#475569",
    border: "rgba(203, 213, 225, 0.5)",
    icon: "HelpCircle",
  },
};
