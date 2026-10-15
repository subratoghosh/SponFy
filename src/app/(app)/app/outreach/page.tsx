"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EmailDraft, Company } from "@/types";
import { DraftQueueList } from "@/components/outreach/DraftQueueList";
import { EmailComposer } from "@/components/outreach/EmailComposer";
import { QualityScorePanel } from "@/components/outreach/QualityScorePanel";
import { SafetyChecklist } from "@/components/outreach/SafetyChecklist";
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
import { useToast } from "@/components/ui/toast";
import { Send, SendHorizontal, CheckCircle2 } from "lucide-react";
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

  const handleSave = async (subject: string, body: string) => {
    if (!activeDraft) return;
    try {
      const res = await fetch("/api/outreach/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: activeDraft.id, subject, body }),
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

  const handleConfirmSend = async () => {
    if (!activeDraft || !activeCompany) return;
    const recipientEmail = activeCompany.contacts?.[0]?.email;
    if (!recipientEmail) {
      toast("Add a verified contact for this company before sending.", "error");
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            Outreach Approval Hub
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Review personalized pitch drafts, inspect quality metrics, and approve sends with human-in-the-loop control.
          </p>
        </div>

        {approvedDraftsCount > 0 && (
          <Button
            variant="butter"
            size="sm"
            onClick={() => setBulkSendOpen(true)}
            className="font-bold text-xs shadow-sm flex items-center gap-1.5"
          >
            <SendHorizontal className="w-4 h-4" />
            Send All Approved ({approvedDraftsCount})
          </Button>
        )}
      </div>

      {loading ? (
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Queue List */}
          <div className="lg:col-span-4 h-[750px]">
            <DraftQueueList
              drafts={drafts}
              companies={companies}
              selectedDraftId={selectedDraftId}
              onSelectDraft={setSelectedDraftId}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              selectedDraftIds={selectedDraftIds}
              onToggleDraftSelect={handleToggleDraftSelect}
              onSelectAllEligible={handleSelectAllEligible}
              onClearSelection={handleClearSelection}
              onBulkApprove={handleBulkApprove}
              approvingBulk={approvingBulk}
            />
          </div>

          {/* Right Column: Composer & Quality / Safety Panel */}
          <div className="lg:col-span-8 space-y-6">
            {activeDraft ? (
              <>
                <EmailComposer
                  key={activeDraft.id}
                  draft={activeDraft}
                  company={activeCompany}
                  onSave={handleSave}
                  onApprove={handleApprove}
                  onOpenSendDialog={() => setConfirmOpen(true)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SafetyChecklist
                    checks={{
                      recipientVerified: !!activeCompany?.contacts?.[0]?.email,
                      hasSponsorshipAsk:
                        activeDraft.body.includes("₹") ||
                        activeDraft.body.includes("$") ||
                        activeDraft.body.includes("Tier") ||
                        activeDraft.body.includes("Partner"),
                      notSuppressed: true,
                      withinDailyCap: true,
                    }}
                  />

                  <QualityScorePanel quality={activeDraft.quality} />
                </div>
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
          toEmail={activeCompany.contacts?.[0]?.email || "partner@company.com"}
          companyName={activeCompany.name}
          onConfirmSend={handleConfirmSend}
          loading={sending}
        />
      )}

      {/* Bulk Send Modal */}
      <BulkSendModal
        isOpen={bulkSendOpen}
        onClose={() => setBulkSendOpen(false)}
        onSuccess={() => {
          setBulkSendOpen(false);
          loadData();
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

