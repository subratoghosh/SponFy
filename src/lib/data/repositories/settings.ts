export interface UserProfile {
  fullName: string;
  organization: string;
  email: string;
  avatarUrl: string;
  title?: string;
  signature?: string;
  dailySendLimit: number;
}

export interface SuppressionEntry {
  id: string;
  email: string;
  domain?: string;
  reason: "unsubscribed" | "bounced" | "not_interested" | "manual" | string;
  createdAt: string;
}

let profileStore: UserProfile = {
  fullName: "Subrato Ghosh",
  title: "Lead Hackathon Organizer",
  organization: "SponFy Hackathon Organizers",
  email: "organizer@sponfy.dev",
  avatarUrl: "",
  signature: "--\nSubrato Ghosh\nLead Organizer | SponFy Hackathon 2026\n+91 98765 43210 | sponfy.dev",
  dailySendLimit: 30,
};

let suppressionsStore: SuppressionEntry[] = [
  {
    id: "sup-1",
    email: "declined@algorand.foundation",
    domain: "algorand.foundation",
    reason: "not_interested",
    createdAt: "2026-08-25T16:00:00Z",
  },
];

export async function getUserProfile(): Promise<UserProfile> {
  return { ...profileStore };
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  profileStore = { ...profileStore, ...updates };
  return { ...profileStore };
}

export async function getSuppressions(): Promise<SuppressionEntry[]> {
  return [...suppressionsStore];
}

export async function addSuppression(email: string, reason: string = "manual"): Promise<SuppressionEntry> {
  const domain = email.includes("@") ? email.split("@")[1] : undefined;
  const entry: SuppressionEntry = {
    id: `sup-${Date.now()}`,
    email,
    domain,
    reason,
    createdAt: new Date().toISOString(),
  };
  suppressionsStore.unshift(entry);
  return entry;
}

export async function removeSuppression(id: string): Promise<boolean> {
  suppressionsStore = suppressionsStore.filter((s) => s.id !== id);
  return true;
}

export async function isSuppressed(email: string): Promise<boolean> {
  const domain = email.includes("@") ? email.split("@")[1].toLowerCase() : "";
  return suppressionsStore.some(
    (s) => s.email.toLowerCase() === email.toLowerCase() || (s.domain && s.domain.toLowerCase() === domain)
  );
}

export const settingsRepository = {
  getProfile: async () => ({
    full_name: profileStore.fullName,
    title: profileStore.title || "Lead Hackathon Organizer",
    organization: profileStore.organization,
    email: profileStore.email,
    signature: profileStore.signature || "",
  }),
  updateProfile: async (data: any) => {
    profileStore.fullName = data.full_name || profileStore.fullName;
    profileStore.title = data.title || profileStore.title;
    profileStore.organization = data.organization || profileStore.organization;
    profileStore.signature = data.signature || profileStore.signature;
    return profileStore;
  },
  getSuppressionList: async () => getSuppressions(),
  addSuppression: async (email: string, reason: string) => addSuppression(email, reason),
  removeSuppression: async (id: string) => removeSuppression(id),
};
