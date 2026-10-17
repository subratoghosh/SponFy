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
  Check,
  AlertCircle,
  Briefcase,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

interface OrganisationItem {
  id: string;
  name: string;
  type: string;
  city?: string | null;
  slug: string;
  campaignCount: number;
  activeMemberCount: number;
}

export default function OnboardingExecutivePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Search organisations
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [organisations, setOrganisations] = useState<OrganisationItem[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<OrganisationItem | null>(null);

  // Form details
  const [roleInTeam, setRoleInTeam] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`/api/organisations?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.organisations) {
            setOrganisations(data.organisations);
          }
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!selectedOrg) {
      setServerError("Please select an organisation to apply to.");
      return;
    }

    if (!roleInTeam.trim()) {
      setServerError("Please specify your desired role in the team (e.g. Outreach Executive).");
      return;
    }

    if (!whyJoin.trim()) {
      setServerError("Please provide a brief note or credentials on why you want to join.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisationId: selectedOrg.id,
          roleInTeam: roleInTeam.trim(),
          whyJoin: whyJoin.trim(),
          message: message.trim() || undefined,
          requestedRole: "EXECUTIVE",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit executive access request.");
      }

      toast("Executive access request submitted to organisation organisers.", "success");
      window.location.href = data.redirectUrl || "/onboarding/pending";
    } catch (err: any) {
      setServerError(err.message || "Failed to submit request.");
      toast(err.message || "Submission failed.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-butter-bg flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-green-dark selection:bg-butter-cream">
      {/* Brand Header */}
      <div className="w-full max-w-3xl mb-6 flex items-center justify-between">
        <SponfyBrand href="/" size="md" theme="light" />
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-green-dark transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Mode Selection
        </Link>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-3xl border border-green-dark/15 shadow-2xl p-6 sm:p-10 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider border border-blue-200 mb-3">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Executive Onboarding
          </div>
          <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark tracking-tight">
            Apply to Join an Organisation
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-1.5 leading-relaxed">
            As an Executive, you will collaborate with event organisers to manage sponsor outreach, send pitches from your connected inbox, and execute assigned campaign queues.
          </p>
        </div>

        {serverError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Organisation Search */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-green-dark">
              1. Select Organisation <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-green-dark/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by organisation name, city, or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs border-green-dark/20 focus:border-green-dark"
              />
              {searching && (
                <Loader2 className="w-4 h-4 animate-spin text-green-dark/40 absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Organisation List */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 border border-green-dark/10 rounded-2xl p-2 bg-butter-bg/30">
              {organisations.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  {searching ? "Searching organisations..." : "No organisations found matching your search."}
                </div>
              ) : (
                organisations.map((org) => {
                  const isSelected = selectedOrg?.id === org.id;
                  return (
                    <div
                      key={org.id}
                      onClick={() => setSelectedOrg(org)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-green-dark text-butter-cream border-green-dark shadow-sm"
                          : "bg-white hover:bg-butter-cream/40 border-green-dark/10 text-green-dark"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{org.name}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isSelected
                                ? "bg-butter-cream/20 text-butter-cream"
                                : "bg-green-dark/10 text-green-dark"
                            }`}
                          >
                            {org.type}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-3 text-[11px] ${
                            isSelected ? "text-butter-cream/80" : "text-text-muted"
                          }`}
                        >
                          {org.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {org.city}
                            </span>
                          )}
                          <span>{org.campaignCount} campaigns</span>
                          <span>•</span>
                          <span>{org.activeMemberCount} team members</span>
                        </div>
                      </div>

                      <div className="shrink-0 pl-3">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-butter-cream border-butter-cream text-green-dark"
                              : "border-green-dark/30 text-transparent"
                          }`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Role and pitch */}
          {selectedOrg && (
            <div className="space-y-4 pt-2 border-t border-green-dark/10 animate-fade-in">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-green-dark">
                  2. Your Role in the Team <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g. Corporate Relations Lead, Outreach Executive, Sponsorship Representative"
                  value={roleInTeam}
                  onChange={(e) => setRoleInTeam(e.target.value)}
                  className="text-xs border-green-dark/20 focus:border-green-dark"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-green-dark">
                  3. Why Join / Qualifications <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Share your prior experience with sponsor outreach, event execution, or your network of brands..."
                  value={whyJoin}
                  onChange={(e) => setWhyJoin(e.target.value)}
                  className="text-xs border-green-dark/20 focus:border-green-dark min-h-[90px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-green-dark">
                  4. Note to Organisers (Optional)
                </label>
                <Input
                  placeholder="Any specific campaign or industry focus you are excited about?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="text-xs border-green-dark/20 focus:border-green-dark"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between border-t border-green-dark/10">
            <Link href="/onboarding">
              <Button type="button" variant="secondary" className="text-xs font-bold">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Cancel
              </Button>
            </Link>

            <Button
              type="submit"
              variant="green"
              disabled={loading || !selectedOrg}
              className="text-xs font-bold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
