"use client";

import React, { useState, useEffect } from "react";
import { getDrafts, approveDraft, saveDraft } from "@/lib/data/repositories/outreach";
import { getSponsors } from "@/lib/data/repositories/sponsors";
import { EmailDraft, Company } from "@/types";
import { DraftQueueList } from "@/components/outreach/DraftQueueList";
import { EmailComposer } from "@/components/outreach/EmailComposer";
import { QualityScorePanel } from "@/components/outreach/QualityScorePanel";
import { SafetyChecklist } from "@/components/outreach/SafetyChecklist";
import { SendConfirmationDialog } from "@/components/outreach/SendConfirmationDialog";
import { useToast } from "@/components/ui/toast";
import { Send, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { OutreachSkeleton } from "@/components/skeletons/OutreachSkeleton";

export default function OutreachPage() {
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<EmailDraft[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allDrafts, allCompanies] = await Promise.all([
        getDrafts(),
        getSponsors(),
      ]);
      setDrafts(allDrafts);
      setCompanies(allCompanies);
      if (allDrafts.length > 0 && !selectedDraftId) {
        setSelectedDraftId(allDrafts[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeDraft = drafts.find((d) => d.id === selectedDraftId) || drafts[0];
  const activeCompany = companies.find((c) => c.id === activeDraft?.companyId);

  const handleSave = async (subject: string, body: string) => {
    if (!activeDraft) return;
    await saveDraft({
      id: activeDraft.id, // update this draft instead of creating a copy
      companyId: activeDraft.companyId,
      contactId: activeDraft.contactId,
      subject,
      body,
      quality: activeDraft.quality,
    });
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
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
          Outreach Approval Hub
        </h1>
        <p className="text-xs sm:text-sm text-text-dim mt-0.5">
          Review personalized pitch drafts, inspect quality metrics, and approve sends with 1-click.
        </p>
      </div>

      {loading ? (
        <OutreachSkeleton />
      ) : drafts.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No outreach drafts generated yet"
          description="SponFy generates high-converting, personalized email pitches for discovered sponsors with safety checks. Find sponsors and generate your first pitch."
          actionLabel="View Sponsors Pipeline"
          actionHref="/app/sponsors"
          secondaryActionLabel="Discover Sponsors with AI"
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
    </div>
  );
}
