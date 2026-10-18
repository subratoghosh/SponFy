"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmailDraft, Company } from "@/types";
import { DraftQueueList } from "@/components/outreach/DraftQueueList";
import { EmailComposer } from "@/components/outreach/EmailComposer";
import { QualityScorePanel } from "@/components/outreach/QualityScorePanel";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const SendConfirmationDialog = dynamic(
  () => import("@/components/outreach/SendConfirmationDialog").then((m) => m.SendConfirmationDialog),
  { ssr: false }
);

const BulkSendModal = dynamic(
  () => import("@/components/outreach/BulkSendModal").then((m) => m.BulkSendModal),
  { ssr: false }
);

const BulkDraftModal = dynamic(
  () => import("@/components/sponsors/BulkDraftModal").then((m) => m.BulkDraftModal),
  { ssr: false }
);
import { useToast } from "@/components/ui/toast";
import { Send, SendHorizontal, CheckCircle2, Layers, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { OutreachSkeleton } from "@/components/skeletons/OutreachSkeleton";
import { useOutreachData } from "@/lib/hooks/useOutreachData";

function OutreachContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const urlDraftId = searchParams.get("draftId");
  const urlCompanyId = searchParams.get("companyId");

  const { drafts, companies, loading, refetch: loadData } = useOutreachData();
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkSendOpen, setBulkSendOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
  const [approvingBulk, setApprovingBulk] = useState(false);
  const [removingBulk, setRemovingBulk] = useState(false);
  const [isMassOutreachOpen, setIsMassOutreachOpen] = useState(false);
  const [dailyStats, setDailyStats] = useState({ sent: 0, limit: 30 });
  const composerRef = useRef<HTMLDivElement>(null);

  // Fetch real-time daily send quota and sent counts (resets at 12:00 AM midnight)
  useEffect(() => {
    fetch("/api/outreach/eligibility")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDailyStats({
            sent: data.sentInWindow ?? 0,
            limit: data.dailyCap ?? 30,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Sync selected draft when drafts load or URL changes
  useEffect(() => {
    if (drafts.length === 0) return;

    if (urlDraftId && drafts.some((d: EmailDraft) => d.id === urlDraftId)) {
      setSelectedDraftId(urlDraftId);
    } else if (urlCompanyId) {
      const existingDraft = drafts.find((d: EmailDraft) => d.companyId === urlCompanyId);
      if (existingDraft) {
        setSelectedDraftId(existingDraft.id);
      } else if (!selectedDraftId) {
        setSelectedDraftId(drafts[0].id);
      }
    } else if (!selectedDraftId) {
      setSelectedDraftId(drafts[0].id);
    }
  }, [drafts, urlDraftId, urlCompanyId, selectedDraftId]);

  const activeDraft = drafts.find((d: EmailDraft) => d.id === selectedDraftId) || drafts[0];
  const activeCompany = companies.find((c: Company) => c.id === activeDraft?.companyId);

  const approvedDraftsCount = drafts.filter((d: EmailDraft) => d.status === "approved").length;

  const handleToggleDraftSelect = (id: string) => {
    setSelectedDraftIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllEligible = () => {
    const eligible = drafts
      .filter((d: EmailDraft) => d.status === "draft" && !d.needsAttention)
      .map((d: EmailDraft) => d.id);
    setSelectedDraftIds(eligible);
  };

  const handleClearSelection = () => {
    setSelectedDraftIds([]);
  };

  const handleBulkApprove = async () => {
    if (selectedDraftIds.length === 0) return;
    setApprovingBulk(true);
    try {
      const res = await fetch("/api/outreach/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftIds: selectedDraftIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Approved ${data.approvedCount} draft(s)! Ready for dispatch.`, "success");
        setSelectedDraftIds([]);
        loadData();
      } else {
        toast(data.error || "Bulk approval failed", "error");
      }
    } catch {
      toast("Failed to approve selected drafts", "error");
    } finally {
      setApprovingBulk(false);
    }
  };

  const handleSave = async (subject: string, body: string, customToEmail?: string) => {
    if (!activeDraft) return;
    try {
      const res = await fetch("/api/outreach/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeDraft.id, subject, body, toEmail: customToEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (activeDraft.status === "approved") {
        toast("Edited after approval: please approve the draft again.", "info");
      }
    } catch (err: any) {
      toast(err.message || "Failed to save draft", "error");
    }
    loadData();
  };

  const handleApprove = async () => {
    if (!activeDraft) return;
    try {
      const res = await fetch("/api/outreach/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId: activeDraft.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast("Draft approved! Ready to dispatch via Gmail.", "success");
        loadData();
      } else {
        toast(data.error || "Approval failed", "error");
      }
    } catch {
      toast("Failed to approve draft", "error");
    }
  };

  const handleRemoveDraft = async (id: string) => {
    const targetDraft = drafts.find((d: EmailDraft) => d.id === id);
    if (!targetDraft) return;
    if (targetDraft.status === "sent" || targetDraft.status === "sending") {
      toast("Dispatched emails cannot be removed from queue.", "warning");
      return;
    }
    const targetComp = companies.find((c: Company) => c.id === targetDraft.companyId);
    const confirmDelete = window.confirm(
      `Are you sure you want to remove the outreach draft for ${targetComp?.name || "this company"} from the queue?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/outreach/draft?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast(`Draft for ${targetComp?.name || "company"} removed from queue.`, "info");
        if (selectedDraftId === id) {
          const remaining = drafts.filter((d: EmailDraft) => d.id !== id);
          setSelectedDraftId(remaining[0]?.id || null);
        }
        setSelectedDraftIds((prev) => prev.filter((item) => item !== id));
        loadData();
      } else {
        toast(data.error || "Failed to remove draft", "error");
      }
    } catch {
      toast("Error removing draft", "error");
    }
  };

  const handleBulkRemove = async () => {
    if (selectedDraftIds.length === 0) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to remove ${selectedDraftIds.length} draft(s) from the outreach queue?`
    );
    if (!confirmDelete) return;

    setRemovingBulk(true);
    try {
      const res = await fetch("/api/outreach/draft", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedDraftIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Removed ${data.removedCount ?? selectedDraftIds.length} draft(s) from queue.`, "info");
        if (selectedDraftIds.includes(selectedDraftId || "")) {
          const remaining = drafts.filter((d: EmailDraft) => !selectedDraftIds.includes(d.id));
          setSelectedDraftId(remaining[0]?.id || null);
        }
        setSelectedDraftIds([]);
        loadData();
      } else {
        toast(data.error || "Failed to remove drafts", "error");
      }
    } catch {
      toast("Error removing selected drafts", "error");
    } finally {
      setRemovingBulk(false);
    }
  };

  const handleRejectDraft = async () => {
    if (!activeDraft) return;
    await handleRemoveDraft(activeDraft.id);
  };

  const getRecipientEmail = (comp?: Company | null, draft?: EmailDraft | null) => {
    if (!comp) return "";
    if (draft?.contactId) {
      const match = comp.contacts?.find((c) => c.id === draft.contactId);
      if (match?.email) return match.email;
    }
    const primaryContact = comp.contacts?.find((c) => c.email && c.email.trim() !== "") || comp.contacts?.[0];
    return primaryContact?.email || "";
  };

  const handleConfirmSend = async (targetEmail?: string, isCustomEmail?: boolean) => {
    if (!activeDraft || !activeCompany) return;
    const recipientEmail = targetEmail || getRecipientEmail(activeCompany, activeDraft);
    if (!recipientEmail) {
      toast("Please add or discover a verified contact email for this company first.", "error");
      return;
    }
    setSending(true);

    try {
      const res = await fetch("/api/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: activeDraft.id,
          toEmail: recipientEmail,
          isCustomEmail: Boolean(isCustomEmail),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast(`Email outreach sent to ${activeCompany.name}!`, "success");
        setConfirmOpen(false);
        loadData();
      } else {
        toast(data.error || "Send blocked by safety gate", "error");
      }
    } catch (err: any) {
      toast(err.message || "Failed to send email", "error");
    } finally {
      setSending(false);
    }
  };

  const limitReached = dailyStats !== null && dailyStats.sent >= dailyStats.limit;
  const queueStats = [
    { label: "To Review", value: drafts.filter((d: EmailDraft) => d.status === "draft").length, icon: FileText },
    { label: "Approved", value: approvedDraftsCount, icon: CheckCircle2 },
    { label: "Sent", value: drafts.filter((d: EmailDraft) => d.status === "sent").length, icon: Send },
  ];

  const handleSelectDraft = (id: string) => {
    setSelectedDraftId(id);
    // On stacked (mobile/tablet) layouts, bring the composer into view
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            Outreach Approval Hub
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Review personalized pitch drafts, check their quality, and approve every send yourself.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
          <Button
            variant="green"
            size="sm"
            onClick={() => setIsMassOutreachOpen(true)}
            className="w-full sm:w-auto justify-center font-bold text-xs shadow-sm gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-butter-gold" />
            Mass Outreach
          </Button>

          <Button
            variant="butter"
            size="sm"
            disabled={approvedDraftsCount === 0}
            onClick={() => setBulkSendOpen(true)}
            className="w-full sm:w-auto justify-center font-bold text-xs shadow-sm gap-1.5 cursor-pointer disabled:opacity-50"
            title={approvedDraftsCount === 0 ? "Approve drafts first to send them in bulk" : undefined}
          >
            <SendHorizontal className="w-4 h-4" />
            <span className="sm:hidden">Send ({approvedDraftsCount})</span>
            <span className="hidden sm:inline">Send Approved ({approvedDraftsCount})</span>
          </Button>
        </div>
      </div>

      {/* Stats Strip: queue counts + daily send quota */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {queueStats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-green-dark/10 px-4 py-3 flex items-center justify-between shadow-xs"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                {stat.label}
              </span>
              <span className="stat-font text-xl font-black text-green-dark">{stat.value}</span>
            </div>
            <stat.icon className="w-4 h-4 text-green-mid" />
          </div>
        ))}

        <div
          className={`rounded-2xl border px-4 py-3 shadow-xs space-y-1.5 ${
            limitReached ? "bg-amber-50 border-amber-300" : "bg-white border-green-dark/10"
          }`}
          title="Daily send volume is capped to protect your sender reputation."
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
              Daily Limit
            </span>
            {limitReached ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="stat-font text-xl font-black text-green-dark">
              {dailyStats ? dailyStats.sent : "–"}
            </span>
            <span className="text-xs font-bold text-text-muted">
              / {dailyStats ? dailyStats.limit : "–"} sent
            </span>
          </div>
          <div className="w-full h-1.5 bg-butter-warm rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${limitReached ? "bg-amber-500" : "bg-green-600"}`}
              style={{
                width: dailyStats ? `${Math.min(100, (dailyStats.sent / Math.max(1, dailyStats.limit)) * 100)}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Alert banner if user exceeds recommended daily limit */}
      {limitReached && dailyStats && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs text-amber-900 animate-fade-in shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-amber-950">
              Recommended daily sending limit reached
            </span>
            <p className="text-amber-800 leading-relaxed">
              You&apos;ve sent {dailyStats.sent} of {dailyStats.limit} recommended emails today. You can keep sending, but sudden spikes raise the chance of landing in sponsors&apos; spam folders.
            </p>
          </div>
        </div>
      )}

      {loading && drafts.length === 0 ? (
        <OutreachSkeleton />
      ) : drafts.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No outreach drafts generated yet"
          description="SponFy generates high-converting, personalized email pitches for discovered sponsors with safety checks. Find sponsors and generate your first pitch."
          actionLabel="View Sponsors Tracker"
          actionHref="/app/sponsors"
          secondaryActionLabel="Discover Sponsors"
          secondaryActionHref="/app/discover"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Left Column: Queue List (sticky on desktop, shorter on phones) */}
          <div className="lg:col-span-4 h-[420px] lg:h-[calc(100vh-7rem)] lg:sticky lg:top-20">
            <DraftQueueList
              drafts={drafts}
              companies={companies}
              selectedDraftId={selectedDraftId}
              onSelectDraft={handleSelectDraft}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              selectedDraftIds={selectedDraftIds}
              onToggleDraftSelect={handleToggleDraftSelect}
              onSelectAllEligible={handleSelectAllEligible}
              onClearSelection={handleClearSelection}
              onBulkApprove={handleBulkApprove}
              approvingBulk={approvingBulk}
              onRemoveDraft={handleRemoveDraft}
              onBulkRemove={handleBulkRemove}
              removingBulk={removingBulk}
            />
          </div>

          {/* Right Column: Composer & Quality / Safety Panel */}
          <div ref={composerRef} className="lg:col-span-8 space-y-5 lg:space-y-6 scroll-mt-20">
            {activeDraft ? (
              <>
                <EmailComposer
                  key={activeDraft.id}
                  draft={activeDraft}
                  company={activeCompany}
                  onSave={handleSave}
                  onApprove={handleApprove}
                  onRejectDraft={handleRejectDraft}
                  onOpenSendDialog={() => setConfirmOpen(true)}
                  onContactUpdated={loadData}
                />

                {activeDraft.quality && <QualityScorePanel quality={activeDraft.quality} />}
              </>
            ) : (
              <div className="p-12 text-center bg-white rounded-3xl border border-green-dark/10">
                <p className="text-text-dim text-sm">Select a draft from the queue to review.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {activeDraft && activeCompany && (
        <SendConfirmationDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          draft={activeDraft}
          toEmail={getRecipientEmail(activeCompany, activeDraft)}
          companyName={activeCompany.name}
          onConfirmSend={handleConfirmSend}
          loading={sending}
          isPatternGuess={!activeCompany.contacts?.some((c) => c.email && c.status === "verified")}
          remainingDailyCap={Math.max(0, dailyStats.limit - dailyStats.sent)}
          dailyCapLimit={dailyStats.limit}
        />
      )}

      {/* Bulk Send Modal (Dispatching Approved Drafts) */}
      <BulkSendModal
        isOpen={bulkSendOpen}
        onClose={() => setBulkSendOpen(false)}
        onSuccess={() => {
          setBulkSendOpen(false);
          loadData();
        }}
      />

      {/* Mass Outreach Modal (Personalized Pitch Generation for Every Company) */}
      <BulkDraftModal
        isOpen={isMassOutreachOpen}
        onClose={() => setIsMassOutreachOpen(false)}
        selectedSponsors={companies}
        onSuccess={() => {
          setIsMassOutreachOpen(false);
          loadData();
          toast("Mass outreach pitches generated! Review and approve in queue.", "success");
        }}
      />
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense fallback={<OutreachSkeleton />}>
      <OutreachContent />
    </Suspense>
  );
}

