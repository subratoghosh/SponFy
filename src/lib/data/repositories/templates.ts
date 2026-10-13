export interface CustomEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  createdAt: string;
}

export const DEFAULT_TEMPLATES: CustomEmailTemplate[] = [
  {
    id: "tmpl-executive-pitch",
    name: "Executive Partnership Pitch",
    subject: "Partnership Opportunity: {{company_name}} x {{event_name}}",
    body: `Hi {{contact_name}},

I'm reaching out from the organizing team of {{event_name}}. We've been following {{company_name}}'s recent developer and tech initiatives with great excitement.

Our upcoming flagship event will convene over {{audience_size}} talented students, software developers, and researchers. Given {{company_name}}'s focus on innovative technology, we would love to invite your team as a key sponsor.

We offer customized engagement tracks including keynote workshops, targeted challenge bounties, and direct recruiting access to top campus talent.

Would you have 10 minutes next week to explore a potential collaboration? I'd be happy to share our partnership deck.

Best regards,
{{organizer_name}}
{{organizer_title}}`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tmpl-tech-challenge",
    name: "Technical Challenge & API Track",
    subject: "Hosting a {{company_name}} Challenge Track at {{event_name}}",
    body: `Hello {{contact_name}},

Hope you're having a great week!

At {{event_name}}, we are hosting a major hackathon with {{audience_size}}+ attendees building cutting-edge applications.

We'd love to partner with {{company_name}} to host a dedicated sponsor challenge track where developers build directly with your platform and APIs. This provides unmatched hands-on adoption, product feedback, and talent visibility.

Could we schedule a quick call this week to walk through our challenge tiers and developer reach?

Warm regards,
{{organizer_name}}
{{organizer_title}}`,
    createdAt: new Date().toISOString(),
  },
  {
    id: "tmpl-quick-followup",
    name: "Quick Sponsorship Follow-up",
    subject: "Re: Sponsorship proposal for {{company_name}} ({{event_name}})",
    body: `Hi {{contact_name}},

Just following up on my previous note regarding partnering with {{event_name}}.

We are finalizing our title and track sponsors this week and wanted to make sure {{company_name}} has the opportunity to connect with our {{audience_size}}+ participants.

Please let me know if you would like me to send over our one-page sponsorship prospectus.

Thanks,
{{organizer_name}}`,
    createdAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = "sponfy_custom_email_templates";

export function getCustomTemplates(userEmail?: string): CustomEmailTemplate[] {
  if (typeof window === "undefined") return DEFAULT_TEMPLATES;
  try {
    const key = userEmail ? `${STORAGE_KEY}_${userEmail}` : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_TEMPLATES));
      return DEFAULT_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TEMPLATES;
  } catch {
    return DEFAULT_TEMPLATES;
  }
}

export function saveCustomTemplate(
  template: Omit<CustomEmailTemplate, "id" | "createdAt"> & { id?: string },
  userEmail?: string
): CustomEmailTemplate {
  const current = getCustomTemplates(userEmail);
  const now = new Date().toISOString();
  let updated: CustomEmailTemplate[];

  if (template.id) {
    updated = current.map((t) =>
      t.id === template.id
        ? { ...t, name: template.name, subject: template.subject, body: template.body }
        : t
    );
  } else {
    const newTmpl: CustomEmailTemplate = {
      id: `tmpl-${Date.now()}`,
      name: template.name,
      subject: template.subject,
      body: template.body,
      createdAt: now,
    };
    updated = [newTmpl, ...current];
  }

  if (typeof window !== "undefined") {
    const key = userEmail ? `${STORAGE_KEY}_${userEmail}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(updated));
  }

  return updated.find((t) => (template.id ? t.id === template.id : true)) || updated[0];
}

export function deleteCustomTemplate(id: string, userEmail?: string): void {
  const current = getCustomTemplates(userEmail);
  const filtered = current.filter((t) => t.id !== id);
  if (typeof window !== "undefined") {
    const key = userEmail ? `${STORAGE_KEY}_${userEmail}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(filtered));
  }
}

export interface InterpolationContext {
  companyName?: string;
  contactName?: string;
  eventName?: string;
  audienceSize?: string | number;
  organizerName?: string;
  organizerTitle?: string;
  industry?: string;
  fitScore?: string | number;
}

export function interpolateTemplate(
  text: string,
  context: InterpolationContext
): string {
  const map: Record<string, string> = {
    "{{company_name}}": context.companyName || "your company",
    "{{contact_name}}": context.contactName || "Team",
    "{{event_name}}": context.eventName || "our event",
    "{{audience_size}}": context.audienceSize ? String(context.audienceSize) : "500+",
    "{{organizer_name}}": context.organizerName || "Event Organizer",
    "{{organizer_title}}": context.organizerTitle || "Head of Sponsorships",
    "{{industry}}": context.industry || "Technology",
    "{{fit_score}}": context.fitScore ? `${context.fitScore}%` : "90%",
  };

  let result = text;
  for (const [key, val] of Object.entries(map)) {
    // Replace all occurrences case-insensitively
    result = result.split(key).join(val);
  }
  return result;
}
