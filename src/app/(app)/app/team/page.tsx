"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
  Building2,
  Mail,
  GraduationCap,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Trash2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

interface PendingRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail?: string;
  designation: string;
  collegeOrCompany: string;
  department: string;
  requestedRole: string;
  message?: string | null;
  details?: Record<string, any>;
  campaignId: string;
  campaignName: string;
  organisationName: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email?: string;
  designation: string;
  collegeOrCompany: string;
  role: string;
  status: string;
  joinedAt: string;
  campaignId: string;
  campaignName: string;
  isOwner: boolean;
}

export default function TeamManagementPage() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"requests" | "members">("requests");
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [decisionAction, setDecisionAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [decisionNote, setDecisionNote] = useState("");
  const [processing, setProcessing] = useState(false);

  // Member Removal State
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, memRes] = await Promise.all([
        fetch("/api/team/requests"),
        fetch("/api/team/members"),
      ]);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }
      if (memRes.ok) {
        const memData = await memRes.json();
        setMembers(memData.members || []);
      }
    } catch {
      toast("Failed to load team data.", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openDecisionModal = (req: PendingRequest, action: "APPROVE" | "REJECT") => {
    setSelectedRequest(req);
    setDecisionAction(action);
    setDecisionNote("");
    setDecisionModalOpen(true);
  };

  const handleDecisionSubmit = async () => {
    if (!selectedRequest) return;
    setProcessing(true);
    try {
      const res = await fetch(`/api/access-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: decisionAction,
          note: decisionNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process request decision.");
      }

      toast(
        decisionAction === "APPROVE"
          ? `${selectedRequest.requesterName} has been approved as an organiser!`
          : `Request from ${selectedRequest.requesterName} declined.`,
        decisionAction === "APPROVE" ? "success" : "info"
      );

      setDecisionModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast(err.message || "Failed to process decision.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveMember = async (member: TeamMember) => {
    if (member.isOwner) {
      toast("The campaign owner cannot be removed.", "error");
      return;
    }

    if (!confirm(`Are you sure you want to remove ${member.name} from "${member.campaignName}"?`)) {
      return;
    }

    setRemovingMemberId(member.id);
    try {
      const res = await fetch("/api/team/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignMemberId: member.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove member.");
      }

      toast(`${member.name} has been removed.`, "success");
      fetchData();
    } catch (err: any) {
      toast(err.message || "Failed to remove member.", "error");
    } finally {
      setRemovingMemberId(null);
    }
  };

  return (
    <div className="space-y-6 text-green-dark">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-green-dark/10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold uppercase tracking-wider border border-amber-200 mb-2">
            <Users className="w-3.5 h-3.5 text-amber-600" />
            Organisation Workspace
          </div>
          <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark tracking-tight">
            Team & Access Management
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-1">
            Review incoming requests to join your campaigns and manage active organisers and executives.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchData}
          loading={loading}
          className="text-xs font-bold self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Segmented Tabs */}
      <div className="flex items-center gap-2 border-b border-green-dark/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === "requests"
              ? "bg-green-dark text-butter-cream shadow-sm"
              : "bg-white text-green-dark hover:bg-butter-warm/40 border border-green-dark/10"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Access Requests</span>
          {requests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-green-dark font-black text-[10px]">
              {requests.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
            activeTab === "members"
              ? "bg-green-dark text-butter-cream shadow-sm"
              : "bg-white text-green-dark hover:bg-butter-warm/40 border border-green-dark/10"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Members</span>
          <span className="px-2 py-0.5 rounded-full bg-butter-cream/60 text-green-dark font-bold text-[10px]">
            {members.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PENDING REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          {loading && requests.length === 0 ? (
            <div className="py-16 text-center text-xs text-text-muted">
              Loading pending access requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-green-dark/15 p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-butter-cream/60 text-green-dark flex items-center justify-center mx-auto">
                <UserCheck className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-extrabold text-base text-green-dark">
                No pending requests
              </h3>
              <p className="text-xs text-text-dim max-w-sm mx-auto leading-relaxed">
                When another student or colleague requests to join your organisation's campaigns, their request will appear here for your review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-3xl border border-green-dark/15 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left Column: Requester profile & details */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                        Requested: {req.requestedRole}
                      </span>
                      <span className="text-xs font-semibold text-text-dim">
                        for <strong className="text-green-dark">{req.campaignName}</strong> ({req.organisationName})
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-lg text-green-dark flex items-center gap-2">
                        {req.requesterName}
                        {req.requesterEmail && (
                          <span className="text-xs font-normal text-text-dim">
                            ({req.requesterEmail})
                          </span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-dim mt-1">
                        <span className="flex items-center gap-1 font-semibold text-green-dark">
                          <Briefcase className="w-3.5 h-3.5 text-green-mid" />
                          {req.designation}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-green-mid" />
                          {req.collegeOrCompany}
                        </span>
                        {req.department && (
                          <>
                            <span>•</span>
                            <span>{req.department}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Messages / Details */}
                    {((req.details as any)?.whyJoin || req.message) && (
                      <div className="p-3.5 rounded-2xl bg-butter-bg/60 border border-green-dark/10 text-xs space-y-1">
                        {(req.details as any)?.whyJoin && (
                          <p className="text-green-dark font-medium leading-relaxed">
                            <strong className="text-text-muted">Why:</strong> {(req.details as any).whyJoin}
                          </p>
                        )}
                        {req.message && (
                          <p className="text-text-dim italic leading-relaxed">
                            <strong className="text-text-muted not-italic">Note:</strong> "{req.message}"
                          </p>
                        )}
                      </div>
                    )}

                    <div className="text-[11px] text-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Submitted {new Date(req.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-green-dark/10">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDecisionModal(req, "REJECT")}
                      className="text-xs font-bold"
                    >
                      <UserX className="w-3.5 h-3.5 mr-1" />
                      Decline
                    </Button>
                    <Button
                      variant="green"
                      size="sm"
                      onClick={() => openDecisionModal(req, "APPROVE")}
                      className="text-xs font-bold shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Approve Organiser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE MEMBERS */}
      {activeTab === "members" && (
        <div className="space-y-4">
          {loading && members.length === 0 ? (
            <div className="py-16 text-center text-xs text-text-muted">
              Loading team members...
            </div>
          ) : members.length === 0 ? (
            <div className="bg-white rounded-3xl border border-green-dark/15 p-12 text-center space-y-2 shadow-sm">
              <Users className="w-10 h-10 text-green-dark/30 mx-auto" />
              <h3 className="font-extrabold text-base text-green-dark">
                No active team members yet
              </h3>
              <p className="text-xs text-text-dim">
                Approve pending access requests to build your campaign team.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-green-dark/15 overflow-hidden shadow-sm">
              <div className="divide-y divide-green-dark/10">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-butter-warm/20 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-green-dark text-butter-cream flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "TM"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-green-dark truncate">
                            {member.name}
                          </span>
                          {member.isOwner && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black uppercase tracking-wider">
                              Owner
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full bg-butter-cream/60 text-green-dark border border-green-dark/10 text-[9px] font-bold uppercase tracking-wider">
                            {member.role}
                          </span>
                        </div>
                        <div className="text-xs text-text-dim flex flex-wrap items-center gap-2 mt-0.5">
                          {member.email && <span>{member.email}</span>}
                          {member.designation && (
                            <>
                              <span>•</span>
                              <span>{member.designation}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-semibold text-green-dark">{member.campaignName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <span className="text-[11px] text-text-muted">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>

                      {!member.isOwner && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member)}
                          loading={removingMemberId === member.id}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 p-2 h-8"
                          title="Remove team member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decision Dialog */}
      <Dialog
        open={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title={decisionAction === "APPROVE" ? "Approve Access Request" : "Decline Access Request"}
        description={
          decisionAction === "APPROVE"
            ? `Grant ${selectedRequest?.requesterName} organiser privileges for "${selectedRequest?.campaignName}".`
            : `Decline access request for ${selectedRequest?.requesterName}.`
        }
      >
        <div className="space-y-4">
          <Textarea
            label={decisionAction === "APPROVE" ? "Optional welcome note" : "Optional reason / feedback"}
            placeholder={
              decisionAction === "APPROVE"
                ? "Welcome aboard! Let's conquer our sponsorship goal together."
                : "Thank you for applying. Currently the team is full..."
            }
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            rows={3}
          />

          <div className="pt-3 border-t border-green-dark/10 flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDecisionModalOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant={decisionAction === "APPROVE" ? "green" : "danger"}
              size="sm"
              loading={processing}
              onClick={handleDecisionSubmit}
              className="font-bold shadow-sm"
            >
              {decisionAction === "APPROVE" ? "Confirm & Approve" : "Confirm & Decline"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
