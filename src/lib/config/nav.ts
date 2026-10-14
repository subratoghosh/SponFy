export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badgeKey?: string;
  description?: string;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/app", icon: "LayoutDashboard", description: "Daily metrics & priority actions" },
  { label: "Campaigns", href: "/app/campaigns", icon: "FolderKanban", description: "Event campaigns & goals" },
  { label: "Sponsors", href: "/app/sponsors", icon: "Building2", description: "Sponsors board & table" },
  { label: "Discover", href: "/app/discover", icon: "Compass", description: "Find prospective sponsors" },
  { label: "Outreach", href: "/app/outreach", icon: "Send", description: "Draft approval & Gmail dispatch" },
  { label: "Replies", href: "/app/replies", icon: "MailQuestion", description: "Reply intelligence inbox" },
  { label: "Follow-ups", href: "/app/follow-ups", icon: "Clock", description: "Sequenced follow-up queue" },
  { label: "Analytics", href: "/app/analytics", icon: "BarChart3", description: "Sponsorship conversion analytics" },
  { label: "Settings", href: "/app/settings", icon: "Settings", description: "Integrations, caps & Gmail status" },
];

export const MOBILE_BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/app", icon: "LayoutDashboard" },
  { label: "Sponsors", href: "/app/sponsors", icon: "Building2" },
  { label: "Outreach", href: "/app/outreach", icon: "Send" },
  { label: "Replies", href: "/app/replies", icon: "MailQuestion" },
  { label: "More", href: "/app/settings", icon: "Menu" },
];
