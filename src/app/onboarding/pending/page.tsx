"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Mail,
  Building2,
  MapPin,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

interface RequestStatusData {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  campaignName: string;
  organisationName: string;
  city?: string;
  decisionNote?: string | null;
  createdAt: string;
}

export default function OnboardingPendingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [statusData, setStatusData] = useState<RequestStatusData | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<string>("PENDING_APPROVAL");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await fetch("/api/access-requests/status");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setStatusData(data.request);
        setOnboardingStatus(data.onboardingStatus);

        // If user is already COMPLETE, redirect to /app
        if (data.onboardingStatus === "COMPLETE") {
          router.replace("/app");
        }
      }
    } catch {
      // background polling
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchStatus();
    // Poll every 15 seconds as specified
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleCancelRequest = async () => {
    if (!confirm("Are you sure you want to cancel this access request?")) return;
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/access-requests/cancel", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to cancel request.");
      }
      toast("Access request cancelled.", "success");
      window.location.href = data.redirectUrl || "/onboarding/organiser";
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to cancel request.");
      toast(err.message || "Cancel failed.", "error");
      setActionLoading(false);
    }
  };

  const handleOpenWorkspace = async () => {
    setActionLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/access-requests/complete", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to finalize workspace activation.");
      }
      toast("Welcome to the workspace!", "success");
      window.location.href = data.redirectUrl || "/app";
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to activate workspace.");
      toast(err.message || "Activation failed.", "error");
      setActionLoading(false);
    }
  };

  const isApproved = statusData?.status === "APPROVED" || onboardingStatus === "COMPLETE";
  const isRejected = statusData?.status === "REJECTED";

  return (
    <div className="min-h-screen bg-butter-bg flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-green-dark selection:bg-butter-cream">
      {/* Brand Header */}
      <div className="w-full max-w-xl mb-6 flex items-center justify-between">
        <SponfyBrand href="/" size="md" theme="light" />
        <Link
          href="/login"
          className="text-xs font-bold text-text-muted hover:text-green-dark transition-colors"
        >
          Sign Out
        </Link>
      </div>

      <div className="w-full max-w-xl bg-white rounded-3xl border border-green-dark/15 shadow-2xl p-6 sm:p-10 space-y-6 text-center transition-all">
        {/* Loading Spinner */}
        {loading && !statusData ? (
          <div className="py-12 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-green-dark mx-auto" />
            <p className="text-xs font-bold text-text-muted">Loading access request details...</p>
          </div>
        ) : isApproved ? (
          /* STATE 1: APPROVED SUCCESS STATE */
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold tracking-wider uppercase border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Access Approved
              </div>
              <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark">
                You're in! Access Approved
              </h1>
              <p className="text-xs sm:text-sm text-text-dim max-w-md mx-auto leading-relaxed">
                The campaign organisers have approved your request. You now have full organiser permissions on this campaign.
              </p>
            </div>

            {statusData && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-left space-y-2">
                <div className="text-xs font-bold text-emerald-900">
                  {statusData.campaignName}
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  {statusData.organisationName} {statusData.city ? `• ${statusData.city}` : ""}
                </div>
              </div>
            )}

            <Button
              variant="green"
              loading={actionLoading}
              onClick={handleOpenWorkspace}
              className="w-full py-3 text-xs sm:text-sm font-black uppercase tracking-wider justify-center shadow-md"
            >
              Open Workspace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : isRejected ? (
          /* STATE 2: REJECTED STATE */
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
              <XCircle className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-800 text-[11px] font-bold tracking-wider uppercase border border-rose-200">
                <XCircle className="w-3.5 h-3.5" />
                Request Declined
              </div>
              <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark">
                Access Request Not Approved
              </h1>
              <p className="text-xs sm:text-sm text-text-dim max-w-md mx-auto leading-relaxed">
                The organiser was unable to accept your request to join this campaign team.
              </p>
            </div>

            {statusData?.decisionNote && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-left space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                  Organiser Note:
                </span>
                <p className="text-xs text-rose-900 italic font-medium leading-relaxed">
                  "{statusData.decisionNote}"
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/onboarding/organiser" className="w-full">
                <Button variant="green" className="w-full text-xs font-bold justify-center">
                  Choose Another Option
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* STATE 3: PENDING APPROVAL (Default) */
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold tracking-wider uppercase border border-amber-200">
                <ShieldAlert className="w-3.5 h-3.5" />
                Review Pending
              </div>
              <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark">
                Waiting for Organiser Approval
              </h1>
              <p className="text-xs sm:text-sm text-text-dim max-w-md mx-auto leading-relaxed">
                Your request to join the campaign team has been sent and is awaiting review by the campaign organisers.
              </p>
            </div>

            {/* Campaign & Org Details Card */}
            {statusData && (
              <div className="p-5 rounded-2xl bg-butter-panel/60 border border-green-dark/15 text-left space-y-3 shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                    Target Campaign
                  </span>
                  <div className="font-extrabold text-sm text-green-dark mt-0.5">
                    {statusData.campaignName}
                  </div>
                  <div className="text-xs text-green-mid font-bold">
                    {statusData.organisationName} {statusData.city ? `• ${statusData.city}` : ""}
                  </div>
                </div>

                <div className="pt-2.5 border-t border-green-dark/10 flex items-center justify-between text-[11px] text-text-dim">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Submitted: {new Date(statusData.createdAt).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                    Pending Review
                  </span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-white border border-green-dark/10 text-left space-y-1.5 text-xs text-text-dim">
              <div className="font-bold flex items-center gap-2 text-green-dark">
                <Mail className="w-4 h-4 text-emerald-600" />
                Live Status Updates (Refreshing every 15s)
              </div>
              <p className="text-[11px] text-text-dim leading-relaxed">
                As soon as an organiser reviews and approves your request, this page will automatically unlock your workspace.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="secondary"
                onClick={fetchStatus}
                className="text-xs font-bold justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Refresh Now
              </Button>

              <Button
                variant="danger"
                loading={actionLoading}
                onClick={handleCancelRequest}
                className="text-xs font-bold justify-center"
              >
                Cancel Request
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
