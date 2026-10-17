"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  Search,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  FolderKanban,
  Check,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { SponfyBrand } from "@/components/ui/SponfyBrand";
import { TARGET_INDUSTRIES } from "@/lib/config/constants";

interface ExistingOrg {
  id: string;
  name: string;
  type: string;
  city?: string | null;
  website?: string | null;
  description?: string | null;
}

interface SearchCampaign {
  id: string;
  name: string;
  eventType: string;
  city: string;
  organisation: {
    id: string;
    name: string;
    type: string;
    city?: string;
  } | null;
  authorName: string;
}

export default function OnboardingOrganiserPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [mode, setMode] = useState<"CHOICE" | "NEW" | "JOIN">("CHOICE");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Existing user organisations (for reuse)
  const [myOrgs, setMyOrgs] = useState<ExistingOrg[]>([]);
  const [selectedExistingOrgId, setSelectedExistingOrgId] = useState<string>("");

  // New Org + Campaign Form State
  const [orgForm, setOrgForm] = useState({
    name: "",
    type: "College Club" as "College Club" | "Company" | "NGO" | "Fest Committee" | "Other",
    description: "",
    website: "",
    city: "",
  });

  const [campaignForm, setCampaignForm] = useState({
    name: "",
    eventType: "Tech Conference & Summit",
    audienceSize: 500,
    location: "Bengaluru, India",
    targetAmount: 300000,
    preferredIndustries: ["Developer Tools", "AI & Machine Learning"] as string[],
    description: "",
    deckUrl: "",
  });

  // Join Existing Campaign State
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<SearchCampaign | null>(null);
  const [joinForm, setJoinForm] = useState({
    roleInTeam: "",
    whyJoin: "",
    message: "",
  });

  // Load existing organisations for reuse
  useEffect(() => {
    fetch("/api/organisations/mine")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.organisations) {
          setMyOrgs(data.organisations);
        }
      })
      .catch(() => {});
  }, []);

  // When selecting an existing org, prefill orgForm
  const handleSelectExistingOrg = (orgId: string) => {
    setSelectedExistingOrgId(orgId);
    if (!orgId) {
      setOrgForm({
        name: "",
        type: "College Club",
        description: "",
        website: "",
        city: "",
      });
      return;
    }
    const found = myOrgs.find((o) => o.id === orgId);
    if (found) {
      setOrgForm({
        name: found.name,
        type: found.type as any,
        description: found.description || "",
        website: found.website || "",
        city: found.city || "",
      });
    }
  };

  // Search campaigns for Join flow
  useEffect(() => {
    if (mode !== "JOIN") return;
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/campaigns/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.campaigns) {
            setSearchResults(data.campaigns);
          }
        })
        .finally(() => setSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, mode]);

  const toggleIndustry = (ind: string) => {
    setCampaignForm((prev) => {
      const exists = prev.preferredIndustries.includes(ind);
      return {
        ...prev,
        preferredIndustries: exists
          ? prev.preferredIndustries.filter((i) => i !== ind)
          : [...prev.preferredIndustries, ind],
      };
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!selectedExistingOrgId && !orgForm.name.trim()) {
      setServerError("Organisation name is required.");
      return;
    }

    if (!campaignForm.name.trim()) {
      setServerError("Campaign name is required.");
      return;
    }

    if (campaignForm.preferredIndustries.length === 0) {
      setServerError("Please select at least 1 preferred industry.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/organisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisationId: selectedExistingOrgId || undefined,
          name: orgForm.name.trim(),
          type: orgForm.type,
          description: orgForm.description.trim() || undefined,
          website: orgForm.website.trim() || undefined,
          city: orgForm.city.trim() || undefined,
          campaign: {
            name: campaignForm.name.trim(),
            eventType: campaignForm.eventType,
            audienceSize: Number(campaignForm.audienceSize),
            location: campaignForm.location.trim(),
            targetAmount: Number(campaignForm.targetAmount),
            preferredIndustries: campaignForm.preferredIndustries,
            description: campaignForm.description.trim() || undefined,
            deckUrl: campaignForm.deckUrl.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create organisation and campaign.");
      }

      toast("Organisation workspace initialized successfully!", "success");
      window.location.href = data.redirectUrl || "/app";
    } catch (err: any) {
      setServerError(err.message || "Failed to create organisation.");
      toast(err.message || "Submission failed.", "error");
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!selectedCampaign) {
      setServerError("Please select a campaign from the search list to join.");
      return;
    }

    if (!joinForm.roleInTeam.trim()) {
      setServerError("Your role in the team is required.");
      return;
    }

    if (!joinForm.whyJoin.trim()) {
      setServerError("Please share why you want to join this campaign.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          roleInTeam: joinForm.roleInTeam.trim(),
          whyJoin: joinForm.whyJoin.trim(),
          message: joinForm.message.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit access request.");
      }

      toast("Access request submitted to organisers.", "success");
      window.location.href = data.redirectUrl || "/onboarding/pending";
    } catch (err: any) {
      setServerError(err.message || "Failed to submit access request.");
      toast(err.message || "Request failed.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-butter-bg flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-green-dark selection:bg-butter-cream">
      {/* Top Header */}
      <div className="w-full max-w-4xl mb-6 flex items-center justify-between">
        <SponfyBrand href="/" size="md" theme="light" />
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-green-dark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Mode Selection
        </Link>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-white rounded-3xl border border-green-dark/15 shadow-2xl p-6 sm:p-10 transition-all">
        {/* STEP A: Two Big Choices */}
        {mode === "CHOICE" && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Organiser Mode Setup
              </div>
              <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark tracking-tight">
                How would you like to get started?
              </h1>
              <p className="text-xs sm:text-sm text-text-dim mt-1.5 leading-relaxed">
                Choose whether you want to set up an organisation with a brand-new campaign, or request access to collaborate on an existing one.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              {/* Choice 1: New Campaign */}
              <div
                onClick={() => setMode("NEW")}
                className="group relative rounded-3xl p-6 sm:p-8 border-2 border-green-dark/15 hover:border-green-dark bg-white hover:bg-butter-cream/20 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-lg"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-green-dark">
                    Organise a new campaign
                  </h3>
                  <p className="text-xs font-semibold text-green-dark/80 mt-1.5">
                    Register an organisation and launch your sponsorship campaign.
                  </p>
                  <p className="text-[12px] text-text-dim mt-3 leading-relaxed">
                    Set up your club or committee profile, define your target amount and tiers, and start discovering sponsors right away.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-green-dark/10">
                  <Button
                    type="button"
                    variant="green"
                    onClick={() => setMode("NEW")}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Start New Campaign
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>

              {/* Choice 2: Join Existing Campaign */}
              <div
                onClick={() => setMode("JOIN")}
                className="group relative rounded-3xl p-6 sm:p-8 border-2 border-green-dark/15 hover:border-green-dark bg-white hover:bg-butter-cream/20 transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-lg"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="font-black text-lg sm:text-xl text-green-dark">
                    Join an existing campaign
                  </h3>
                  <p className="text-xs font-semibold text-green-dark/80 mt-1.5">
                    Request organiser access to a live campaign team.
                  </p>
                  <p className="text-[12px] text-text-dim mt-3 leading-relaxed">
                    Search your college or organisation's active campaigns and request access to coordinate outreach and approve sponsor drafts.
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-green-dark/10">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMode("JOIN")}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Find Existing Campaign
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOW 1: NEW CAMPAIGN (Organisation Form + Campaign Form) */}
        {mode === "NEW" && (
          <form onSubmit={handleCreateSubmit} className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-green-dark/10">
              <button
                type="button"
                onClick={() => setMode("CHOICE")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-green-dark transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to choices
              </button>
              <div className="text-xs font-bold text-green-dark bg-butter-cream/60 px-3 py-1 rounded-full border border-green-dark/10">
                New Organisation & Campaign
              </div>
            </div>

            {/* FORM 1: Organisation */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Part 1: Organisation Details
                </span>
                <h2 className="heading-font font-black text-xl text-green-dark mt-1">
                  Tell us about your organisation
                </h2>
              </div>

              {/* Reusable Organisation Dropdown if user has existing ones */}
              {myOrgs.length > 0 && (
                <div className="p-4 rounded-2xl bg-butter-bg border border-green-dark/15 space-y-1.5">
                  <label className="text-xs font-bold text-green-dark block">
                    Reuse one of your existing organisations?
                  </label>
                  <Select
                    value={selectedExistingOrgId}
                    onChange={(e) => handleSelectExistingOrg(e.target.value)}
                  >
                    <option value="">Create a new organisation...</option>
                    {myOrgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.type}{org.city ? `, ${org.city}` : ""})
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Organisation Name"
                    placeholder="e.g. SVNIT TechFest Committee"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    disabled={Boolean(selectedExistingOrgId)}
                    required
                  />
                </div>

                <div>
                  <Select
                    label="Organisation Type"
                    value={orgForm.type}
                    onChange={(e) => setOrgForm({ ...orgForm, type: e.target.value as any })}
                    disabled={Boolean(selectedExistingOrgId)}
                  >
                    <option value="College Club">College Club</option>
                    <option value="Fest Committee">Fest Committee</option>
                    <option value="Company">Company</option>
                    <option value="NGO">NGO</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="City / Headquarters"
                  placeholder="e.g. Surat, Gujarat"
                  value={orgForm.city}
                  onChange={(e) => setOrgForm({ ...orgForm, city: e.target.value })}
                  disabled={Boolean(selectedExistingOrgId)}
                />
                <Input
                  label="Website / Portal URL"
                  placeholder="https://techfest.example.com"
                  value={orgForm.website}
                  onChange={(e) => setOrgForm({ ...orgForm, website: e.target.value })}
                  disabled={Boolean(selectedExistingOrgId)}
                />
              </div>

              <Textarea
                label="Short Description"
                placeholder="Briefly describe what your organisation does..."
                value={orgForm.description}
                onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                disabled={Boolean(selectedExistingOrgId)}
                rows={2}
              />
            </div>

            {/* FORM 2: Campaign */}
            <div className="space-y-4 pt-4 border-t border-green-dark/10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Part 2: Flagship Campaign
                </span>
                <h2 className="heading-font font-black text-xl text-green-dark mt-1">
                  Define your sponsorship campaign
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Campaign / Event Name"
                  placeholder="e.g. InnovateX 2026"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  required
                />
                <Select
                  label="Event Type"
                  value={campaignForm.eventType}
                  onChange={(e) => setCampaignForm({ ...campaignForm, eventType: e.target.value })}
                >
                  <option value="Tech Conference & Summit">Tech Conference & Summit</option>
                  <option value="Innovation Challenge">Innovation Challenge & Hackathon</option>
                  <option value="Cultural Event">Cultural & Arts Festival</option>
                  <option value="Startup Summit">Startup & Entrepreneurship Summit</option>
                  <option value="Community Initiative">Community Initiative</option>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Expected Audience Size"
                  type="number"
                  value={campaignForm.audienceSize}
                  onChange={(e) => setCampaignForm({ ...campaignForm, audienceSize: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Location"
                  value={campaignForm.location}
                  onChange={(e) => setCampaignForm({ ...campaignForm, location: e.target.value })}
                  required
                />
                <Input
                  label="Target Goal (₹ INR)"
                  type="number"
                  value={campaignForm.targetAmount}
                  onChange={(e) => setCampaignForm({ ...campaignForm, targetAmount: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-green-dark block mb-2">
                  Target Sponsor Sectors:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TARGET_INDUSTRIES.map((ind) => {
                    const isSelected = campaignForm.preferredIndustries.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => toggleIndustry(ind)}
                        className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                          isSelected
                            ? "bg-green-dark text-butter-cream border-green-mid shadow-xs"
                            : "bg-white text-green-dark border-green-dark/15 hover:bg-butter-warm/40"
                        }`}
                      >
                        {ind}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Brochure / Pitch Deck PDF Link (Optional)"
                  placeholder="https://drive.google.com/..."
                  value={campaignForm.deckUrl}
                  onChange={(e) => setCampaignForm({ ...campaignForm, deckUrl: e.target.value })}
                />
                <Input
                  label="Campaign Headline / Motto (Optional)"
                  placeholder="Empowering 1,000+ student innovators"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                />
              </div>
            </div>

            {serverError && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-800">Validation Error</p>
                  <p className="mt-0.5 text-red-600">{serverError}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-green-dark/10 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMode("CHOICE")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="green"
                loading={loading}
                disabled={loading}
                className="px-6 py-2.5 font-black uppercase tracking-wider text-xs sm:text-sm"
              >
                Create Workspace & Launch
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        )}

        {/* FLOW 2: JOIN EXISTING CAMPAIGN */}
        {mode === "JOIN" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-green-dark/10">
              <button
                type="button"
                onClick={() => {
                  setSelectedCampaign(null);
                  setMode("CHOICE");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-green-dark transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to choices
              </button>
              <div className="text-xs font-bold text-green-dark bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                Join Campaign Team
              </div>
            </div>

            <div>
              <h2 className="heading-font font-black text-2xl text-green-dark tracking-tight">
                Find an organisation campaign
              </h2>
              <p className="text-xs sm:text-sm text-text-dim mt-1">
                Search by campaign name, organisation name, or city. Only public organisation campaigns are displayed.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search campaigns, college clubs, fest committees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-green-dark/15 focus:border-green-dark text-xs sm:text-sm text-green-dark bg-white shadow-2xs outline-none"
              />
            </div>

            {/* Search Results List */}
            {!selectedCampaign ? (
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-dim block">
                  Available Organisation Campaigns ({searchResults.length})
                </span>

                {searching ? (
                  <div className="py-10 text-center text-xs text-text-muted">
                    Searching organisation campaigns...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-10 text-center text-xs text-text-muted space-y-1">
                    <FolderKanban className="w-8 h-8 text-green-dark/30 mx-auto mb-2" />
                    <p className="font-bold text-green-dark">No organisation campaigns found</p>
                    <p className="text-[11px] text-text-dim">Try modifying your search or start a new campaign instead.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                    {searchResults.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCampaign(c)}
                        className="p-4 rounded-2xl border-2 border-green-dark/15 hover:border-green-dark bg-white hover:bg-butter-cream/25 transition-all cursor-pointer flex flex-col justify-between shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                              {c.eventType}
                            </span>
                            <span className="text-[11px] text-text-dim flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {c.city}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-green-dark leading-snug">
                            {c.name}
                          </h4>
                          <p className="text-xs font-bold text-green-mid mt-1">
                            {c.organisation?.name || "Organisation"}
                          </p>
                          <p className="text-[11px] text-text-dim mt-0.5">
                            Organised by {c.authorName}
                          </p>
                        </div>

                        <div className="mt-3 pt-3 border-t border-green-dark/10 flex items-center justify-end">
                          <span className="text-xs font-bold text-green-dark hover:underline flex items-center gap-1">
                            Select to Join &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Selected Campaign Join Form */
              <form onSubmit={handleJoinSubmit} className="space-y-5 animate-fade-in">
                <div className="p-4 rounded-2xl bg-butter-cream/40 border border-green-dark/15 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      Selected Campaign
                    </span>
                    <h3 className="font-black text-base text-green-dark mt-0.5">
                      {selectedCampaign.name}
                    </h3>
                    <p className="text-xs text-green-dark/80 font-semibold">
                      {selectedCampaign.organisation?.name} • {selectedCampaign.city}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="glass"
                    size="sm"
                    onClick={() => setSelectedCampaign(null)}
                    className="text-xs"
                  >
                    Change
                  </Button>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Your Role in the Team"
                    placeholder="e.g. Sponsorship Head / Convenor / Corporate Relations"
                    value={joinForm.roleInTeam}
                    onChange={(e) => setJoinForm({ ...joinForm, roleInTeam: e.target.value })}
                    required
                  />

                  <Textarea
                    label="Why do you want to join this campaign?"
                    placeholder="Share your experience, network, or how you will contribute to this sponsorship drive..."
                    value={joinForm.whyJoin}
                    onChange={(e) => setJoinForm({ ...joinForm, whyJoin: e.target.value })}
                    required
                    rows={3}
                  />

                  <Textarea
                    label="Optional message to the campaign owner"
                    placeholder="e.g. Let's sync on title sponsor targets..."
                    value={joinForm.message}
                    onChange={(e) => setJoinForm({ ...joinForm, message: e.target.value })}
                    rows={2}
                  />
                </div>

                {serverError && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-red-800">Submission Error</p>
                      <p className="mt-0.5 text-red-600">{serverError}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-green-dark/10 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSelectedCampaign(null)}
                  >
                    Back to Search
                  </Button>
                  <Button
                    type="submit"
                    variant="green"
                    loading={loading}
                    disabled={loading}
                    className="px-6 py-2.5 font-black uppercase tracking-wider text-xs sm:text-sm"
                  >
                    Submit Access Request
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
