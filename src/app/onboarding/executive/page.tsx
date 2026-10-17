"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Users,
  Search,
  Building2,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Briefcase,
  AlertCircle,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

interface CampaignSearchResult {
  id: string;
  name: string;
  eventType: string;
  city: string;
  organisation: {
    id: string;
    name: string;
    type?: string;
    city?: string;
  } | null;
  authorName: string;
}

export default function OnboardingExecutivePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  // Form State
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [availability, setAvailability] = useState("10");
  const [whyJoin, setWhyJoin] = useState("");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CampaignSearchResult[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-redirect if onboarding is already completed or pending
  useEffect(() => {
    if (session?.user) {
      if (session.user.role !== "ADMIN") {
        if (session.user.onboardingStatus === "COMPLETE") {
          router.replace("/app");
          return;
        }
        if (session.user.onboardingStatus === "PENDING_APPROVAL") {
          router.replace("/onboarding/pending");
          return;
        }
      }

      // Prefill user profile details if available
      if ((session.user as any).designation && !designation) {
        setDesignation((session.user as any).designation);
      }
      if ((session.user as any).department && !department) {
        setDepartment((session.user as any).department);
      }
    }
  }, [session, router, designation, department]);

  // Debounced search for organisation campaigns
  const fetchCampaigns = useCallback(async (q: string) => {
    setIsSearching(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/campaigns/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSearchResults(data.campaigns || []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns(searchQuery);
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, fetchCampaigns]);

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!designation.trim()) errs.designation = "Designation/role in team is required";
    if (!department.trim()) errs.department = "Department/vertical is required";
    if (!availability.trim() || isNaN(Number(availability)) || Number(availability) <= 0) {
      errs.availability = "Enter estimated hours/week (e.g. 10)";
    }
    if (!whyJoin.trim() || whyJoin.trim().length < 5) {
      errs.whyJoin = "Please describe why you want to join (min. 5 characters)";
    }
    if (!selectedCampaignId) {
      errs.campaign = "Please select a campaign from the search results";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!validateForm()) {
      toast("Please complete all required fields and pick a campaign.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/access-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: selectedCampaignId,
          designation: designation.trim(),
          department: department.trim(),
          availabilityHours: availability.trim(),
          whyJoin: whyJoin.trim(),
          requestedRole: "EXECUTIVE",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit access request.");
      }

      toast("Join request submitted! Awaiting organiser approval.", "success");
      router.push(data.redirectUrl || "/onboarding/pending");
    } catch (err: any) {
      const msg = err.message || "Failed to submit request. Please try again.";
      setErrorMsg(msg);
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCampaign = searchResults.find((c) => c.id === selectedCampaignId);

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
          Change Workspace Mode
        </Link>
      </div>

      {/* Main Centered Form Card */}
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-green-dark/15 shadow-2xl p-6 sm:p-10 space-y-8 transition-all">
        {/* Card Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold tracking-wider uppercase mb-3">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            Executive Join Flow
          </div>
          <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark tracking-tight">
            Join a Campaign Team
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-1.5 leading-relaxed">
            Apply to collaborate on an active organisation campaign. Once an organiser approves your request, you'll unlock the executive workspace to run corporate sponsor outreach.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Executive Credentials */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-green-dark/80 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-green-mid" />
              1. Your Team Profile
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Designation / Role in Team"
                  placeholder="e.g. Sponsorship Associate / Outreach Executive"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  required
                />
                {errors.designation && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.designation}</p>
                )}
              </div>

              <div>
                <Input
                  label="Department / Vertical"
                  placeholder="e.g. Corporate Relations / Marketing"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
                {errors.department && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.department}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Availability (hours / week)"
                  placeholder="e.g. 10"
                  type="number"
                  min="1"
                  max="80"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  required
                />
                {errors.availability && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">{errors.availability}</p>
                )}
              </div>
            </div>

            <div>
              <Textarea
                label="Why do you want to join this campaign?"
                placeholder="Share your background, any past sponsorship deals or brands you can connect with, and how you will help reach our target..."
                value={whyJoin}
                onChange={(e) => setWhyJoin(e.target.value)}
                rows={3}
                required
              />
              {errors.whyJoin && (
                <p className="text-xs text-red-600 mt-1 font-semibold">{errors.whyJoin}</p>
              )}
            </div>
          </div>

          {/* Section 2: Campaign Search & Selection */}
          <div className="space-y-4 pt-4 border-t border-green-dark/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-xs font-black uppercase tracking-wider text-green-dark/80 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-green-mid" />
                2. Select Target Campaign
              </h2>
              <span className="text-[11px] text-text-dim">
                Pick the active campaign you are applying to join
              </span>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns by name, fest, or organisation (e.g. InnovateX, TechFest)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-butter-bg/60 border border-green-dark/15 text-xs sm:text-sm text-green-dark placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-green-dark/20 transition-all font-medium"
              />
              {isSearching && (
                <RefreshCw className="w-4 h-4 text-green-dark animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {errors.campaign && (
              <p className="text-xs text-red-600 font-semibold">{errors.campaign}</p>
            )}

            {/* Campaign Selection Results List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {isSearching && searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  Searching directory...
                </div>
              ) : searchResults.length === 0 && hasSearched ? (
                <div className="p-6 rounded-2xl bg-butter-bg/50 border border-green-dark/10 text-center space-y-1">
                  <p className="text-xs font-bold text-green-dark">No campaigns found</p>
                  <p className="text-[11px] text-text-dim">
                    Try searching with another keyword or ask your campaign organiser for the exact campaign title.
                  </p>
                </div>
              ) : (
                searchResults.map((campaign) => {
                  const isSelected = selectedCampaignId === campaign.id;
                  return (
                    <div
                      key={campaign.id}
                      onClick={() => setSelectedCampaignId(campaign.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? "border-green-dark bg-butter-cream/30 shadow-sm ring-2 ring-green-dark/10"
                          : "border-green-dark/15 hover:border-green-dark/35 bg-white"
                      }`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-sm text-green-dark truncate">
                            {campaign.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                            {campaign.eventType}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-dim">
                          {campaign.organisation && (
                            <span className="flex items-center gap-1 font-semibold text-green-dark">
                              <Building2 className="w-3.5 h-3.5 text-green-mid" />
                              {campaign.organisation.name}
                            </span>
                          )}

                          {campaign.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-green-mid" />
                              {campaign.city}
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-text-muted">
                            <UserCheck className="w-3.5 h-3.5 text-green-mid" />
                            Lead: {campaign.authorName}
                          </span>
                        </div>
                      </div>

                      {/* Radio Selection Indicator */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-green-dark text-butter-cream shadow-xs"
                            : "border-2 border-green-dark/25 bg-white"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Campaign Badge Preview */}
            {selectedCampaign && (
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between text-xs animate-fade-in">
                <span className="text-emerald-900 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Selected: <strong>{selectedCampaign.name}</strong>
                  {selectedCampaign.organisation ? ` (${selectedCampaign.organisation.name})` : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedCampaignId(null)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Server Error Message */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 shadow-sm animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-800">Submission Error</p>
                <p className="mt-0.5 text-red-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-green-dark/10">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button type="button" variant="secondary" className="w-full text-xs font-bold">
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back
              </Button>
            </Link>

            <Button
              type="submit"
              variant="green"
              loading={submitting}
              disabled={submitting || !selectedCampaignId}
              className="w-full sm:w-auto px-8 py-2.5 font-black uppercase tracking-wider text-xs sm:text-sm shadow-md"
            >
              Submit Join Request
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
