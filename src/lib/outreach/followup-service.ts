import { getSponsors } from "@/lib/data/repositories/sponsors";
import { getDrafts, getMessages } from "@/lib/data/repositories/outreach";
import { isSuppressed } from "@/lib/data/repositories/settings";
import { computeFollowups, type FollowupItem } from "./followups";

/** Gathers the facts from the data layer and lets the pure rules decide. */
export async function loadFollowups(now?: Date): Promise<FollowupItem[]> {
  const [companies, messages, drafts] = await Promise.all([getSponsors(), getMessages(), getDrafts()]);

  const recipients = Array.from(
    new Set(messages.filter((m) => m.direction === "outbound").map((m) => m.toEmail.toLowerCase()))
  );
  const flags = await Promise.all(recipients.map(async (e) => [e, await isSuppressed(e)] as const));
  const suppressedEmails = new Set(flags.filter(([, s]) => s).map(([e]) => e));

  return computeFollowups({ companies, messages, drafts, suppressedEmails, now });
}
