"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  UserCheck,
  UserX,
  Clock,
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
  Layers,
  Calendar,
  MessageSquare,
  Plus,
  FolderKanban,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  availability?: string | null;
  whyJoin?: string | null;
  requestedRole: string;
  message?: string | null;
  details?: Record<string, any>;
  campaignId?: string;
  campaignName: string;
  organisationId?: string;
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
  campaignId?: string;
  campaignName?: string;
  organisationId?: string;
  isOwner?: boolean;
}

interface OrganisationMember {
  id: string;
  organisationMemberId: string;
  userId: string;
  name: string;
  email?: string;
  designation: string;
  collegeOrCompany: string;
  role: "ORGANISER" | "EXECUTIVE";
  status: string;
  joinedAt: string;
  organisationId: string;
  organisationName: string;
  isCreator: boolean;
  isLastOrganizer: boolean;
  assignedCampaigns: { campaignId: string; campaignName: string }[];
}

interface CampaignOption {
  id: string;
  name: string;
  eventType: string;
}

export default function TeamManagementPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"requests" | "members">("requests");
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [orgMembers, setOrgMembers] = useState<OrganisationMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Available campaigns for assignment
  const [campaignOptions, setCampaignOptions] = useState<CampaignOption[]>([]);

  // Decision Modal State
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [decisionAction, setDecisionAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [decisionNote, setDecisionNote] = useState("");
  const [processing, setProcessing] = useState(false);

  // Assign Campaigns Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedExecutive, setSelectedExecutive] = useState<OrganisationMember | null>(null);
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
  const [showNewCampaignSubform, setShowNewCampaignSubform] = useState(false);
  const [newCampaignForm, setNewCampaignForm] = useState({
    name: "",
    eventType: "Tech Hackathon",
    audienceSize: 500,
    location: "Bengaluru",
    targetAmount: 300000,
    preferredIndustries: ["Developer Tools"],
  });
  const [assigning, setAssigning] = useState(false);

  // Member Removal State
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reqRes, memRes, campRes] = await Promise.all([
        fetch("/api/team/requests"),
        fetch("/api/team/members"),
        fetch("/api/campaigns"),
      ]);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }
      if (memRes.ok) {
        const memData = await memRes.json();
        setMembers(memData.members || []);
        if (memData.organisationMembers) {
          setOrgMembers(memData.organisationMembers);
        }
      }
      if (campRes.ok) {
        const campData = await campRes.json();
        const camps = Array.isArray(campData)
          ? campData
          : campData.campaigns || [];
        setCampaignOptions(
          camps.map((c: any) => ({
            id: c.id,
            name: c.name,
            eventType: c.eventType || "Event",
          }))
        );
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
          ? `${selectedRequest.requesterName} has been approved as an ${selectedRequest.requestedRole.toLowerCase()}!`
          : `Request from ${selectedRequest.requesterName} declined.`,
        decisionAction === "APPROVE" ? "success" : "info"
      );

      setDecisionModalOpen(false);

      if (decisionAction === "APPROVE" && selectedRequest.requestedRole === "EXECUTIVE") {
        const approvedOrgId =
          data.organisationId ||
          selectedRequest.organisationId ||
          orgMembers[0]?.organisationId ||
          "";
        const approvedExec: OrganisationMember = {
          id: selectedRequest.id,
          organisationMemberId: data.member?.id || selectedRequest.id,
          userId: selectedRequest.requesterId,
          name: selectedRequest.requesterName,
          email: selectedRequest.requesterEmail,
          designation: selectedRequest.designation,
          collegeOrCompany: selectedRequest.collegeOrCompany,
          role: "EXECUTIVE",
          status: "ACTIVE",
          joinedAt: new Date().toISOString(),
          organisationId: approvedOrgId,
          organisationName: selectedRequest.organisationName,
          isCreator: false,
          isLastOrganizer: false,
          assignedCampaigns: selectedRequest.campaignId
            ? [{ campaignId: selectedRequest.campaignId, campaignName: selectedRequest.campaignName }]
            : [],
        };
        setSelectedExecutive(approvedExec);
        setSelectedCampaignIds(
          selectedRequest.campaignId ? [selectedRequest.campaignId] : []
        );
        setShowNewCampaignSubform(false);
        setAssignModalOpen(true);
      }

      fetchData();
    } catch (err: any) {
      toast(err.message || "Failed to process decision.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const openAssignModal = (exec: OrganisationMember) => {
    setSelectedExecutive(exec);
    setSelectedCampaignIds(exec.assignedCampaigns.map((c) => c.campaignId));
    setShowNewCampaignSubform(false);
    setAssignModalOpen(true);
  };

  const toggleCampaignSelection = (campId: string) => {
    setSelectedCampaignIds((prev) =>
      prev.includes(campId) ? prev.filter((id) => id !== campId) : [...prev, campId]
    );
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExecutive) return;

    setAssigning(true);
    try {
      const payload: any = {
        organisationId: selectedExecutive.organisationId,
        executiveUserId: selectedExecutive.userId,
        campaignIds: selectedCampaignIds,
      };

      if (showNewCampaignSubform && newCampaignForm.name.trim()) {
        payload.newCampaign = {
          name: newCampaignForm.name.trim(),
          eventType: newCampaignForm.eventType,
          audienceSize: Number(newCampaignForm.audienceSize),
          location: newCampaignForm.location.trim(),
          targetAmount: Number(newCampaignForm.targetAmount),
          preferredIndustries: newCampaignForm.preferredIndustries,
        };
      }

      const res = await fetch("/api/team/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update campaign assignments.");
      }

      toast("Campaign assignments updated successfully.", "success");
      setAssignModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast(err.message || "Assignment failed.", "error");
    } finally {
      setAssigning(false);
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

      toast(`${member.name} has been removed from campaign.`, "success");
      fetchData();
    } catch (err: any) {
      toast(err.message || "Failed to remove member.", "error");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleRemoveOrgMember = async (orgMem: OrganisationMember) => {
    if (orgMem.isLastOrganizer) {
      toast("Forbidden: Cannot remove the last active Organizer of this organisation.", "error");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove ${orgMem.name} from "${orgMem.organisationName}"? This will revoke all their campaign assignments immediately.`
      )
    ) {
      return;
    }

    setRemovingMemberId(orgMem.id);
    try {
      const res = await fetch("/api/team/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organisationMemberId: orgMem.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to remove organisation member.");
      }

      toast(`${orgMem.name} has been removed from the organisation.`, "success");
      fetchData();
    } catch (err: any) {
      toast(err.message || "Failed to remove member.", "error");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const userRole = (session?.user as any)?.role;
  const isOrganiser = userRole === "ORGANISER" || userRole === "ADMIN" || session?.user?.email === "admin@sponfy.dev";

  if (session && !isOrganiser) {
    return (
      <div className="bg-white rounded-3xl border border-green-dark/15 p-12 text-center space-y-4 max-w-xl mx-auto my-12 shadow-sm text-green-dark">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="heading-font font-black text-2xl text-green-dark">Organiser Access Required</h2>
        <p className="text-xs sm:text-sm text-text-dim leading-relaxed">
          The Team Management portal is reserved for campaign organisers and administrators. If you need access, ask your campaign organiser to grant you organiser permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-green-dark selection:bg-butter-cream">
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
            Review incoming requests to join your organisation and manage active organisers and executives.
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
            {orgMembers.length > 0 ? orgMembers.length : members.length}
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
                When another student or colleague requests to join your organisation, their request will appear here for your review.
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
                        for <strong className="text-green-dark">{req.organisationName}</strong>
                        {req.campaignName && req.campaignName !== "Organisation Workspace" && (
                          <span> ({req.campaignName})</span>
                        )}
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

                      {/* Attribute Pills */}
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-text-dim mt-1.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-green-dark bg-butter-cream/40 px-2 py-0.5 rounded-md">
                          <Briefcase className="w-3.5 h-3.5 text-green-mid" />
                          {req.designation || (req.details as any)?.roleInTeam || "Team Member"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-green-mid" />
                          {req.collegeOrCompany || req.organisationName}
                        </span>
                        {req.department && (
                          <span className="inline-flex items-center gap-1 text-green-dark/90 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <Layers className="w-3.5 h-3.5 text-emerald-600" />
                            {req.department}
                          </span>
                        )}

                        {req.availability && (
                          <span className="inline-flex items-center gap-1 text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-medium">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            {req.availability}
                          </span>
                        )}

                        {req.collegeOrCompany && (
                          <span className="inline-flex items-center gap-1 text-text-dim">
                            <GraduationCap className="w-3.5 h-3.5 text-green-mid" />
                            {req.collegeOrCompany}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Messages / Why Join */}
                    {(req.whyJoin || req.message) && (
                      <div className="p-3.5 rounded-2xl bg-butter-bg/60 border border-green-dark/10 text-xs space-y-1.5">
                        {req.whyJoin && (
                          <p className="text-green-dark font-medium leading-relaxed">
                            <strong className="text-text-muted">Why:</strong> {req.whyJoin}
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
                      <Calendar className="w-3 h-3" />
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
                      {req.requestedRole === "ORGANISER" ? "Cancel / Decline" : "Disapprove"}
                    </Button>
                    <Button
                      variant="green"
                      size="sm"
                      onClick={() => openDecisionModal(req, "APPROVE")}
                      className="text-xs font-bold shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5 mr-1" />
                      Approve {req.requestedRole === "EXECUTIVE" ? "Executive" : "Organiser"}
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
          {loading && orgMembers.length === 0 && members.length === 0 ? (
            <div className="py-16 text-center text-xs text-text-muted">
              Loading team members...
            </div>
          ) : orgMembers.length > 0 ? (
            /* Organisation-first member view */
            <div className="bg-white rounded-3xl border border-green-dark/15 overflow-hidden shadow-sm">
              <div className="divide-y divide-green-dark/10">
                {orgMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-butter-warm/20 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-green-dark text-butter-cream flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "TM"}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-sm text-green-dark truncate">
                            {member.name}
                          </span>
                          {member.isCreator && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-black uppercase tracking-wider">
                              Creator
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              member.role === "ORGANISER"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-blue-100 text-blue-900 border border-blue-300"
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                        <div className="text-xs text-text-dim flex flex-wrap items-center gap-2">
                          {member.email && <span>{member.email}</span>}
                          {member.designation && (
                            <>
                              <span>•</span>
                              <span>{member.designation}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-semibold text-green-dark">{member.organisationName}</span>
                        </div>

                        {/* Executive Assigned Campaigns Badges */}
                        {member.role === "EXECUTIVE" && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[10px] font-bold text-text-muted uppercase">
                              Assigned Campaigns:
                            </span>
                            {member.assignedCampaigns.length === 0 ? (
                              <span className="text-[11px] text-amber-700 italic font-medium">
                                None assigned yet
                              </span>
                            ) : (
                              member.assignedCampaigns.map((c) => (
                                <span
                                  key={c.campaignId}
                                  className="px-2 py-0.5 rounded-lg bg-green-dark/5 text-green-dark text-[10px] font-bold border border-green-dark/10"
                                >
                                  {c.campaignName}
                                </span>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-green-dark/10">
                      {member.role === "EXECUTIVE" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openAssignModal(member)}
                          className="text-xs font-bold"
                        >
                          <FolderKanban className="w-3.5 h-3.5 mr-1.5" />
                          Assign Campaigns
                        </Button>
                      )}

                      {!member.isCreator && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={member.isLastOrganizer}
                          onClick={() => handleRemoveOrgMember(member)}
                          loading={removingMemberId === member.id}
                          className={`text-xs px-2.5 py-1.5 h-8 font-semibold flex items-center gap-1.5 ${
                            member.isLastOrganizer
                              ? "text-text-muted cursor-not-allowed opacity-40"
                              : "text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200"
                          }`}
                          title={
                            member.isLastOrganizer
                              ? "Cannot remove the last active Organizer"
                              : member.role === "ORGANISER"
                              ? "Cancel / Remove Organiser"
                              : "Disapprove / Remove Executive"
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>
                            {member.role === "ORGANISER" ? "Cancel Organiser" : "Disapprove"}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Fallback to campaign members list */
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
                          {member.campaignName && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-green-dark">{member.campaignName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
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
            ? `Grant ${selectedRequest?.requesterName} ${selectedRequest?.requestedRole === "EXECUTIVE" ? "Executive" : "Organiser"} permissions for "${selectedRequest?.campaignName || selectedRequest?.organisationName}".`
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

      {/* Assign Campaigns Modal */}
      <Dialog
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Campaigns to ${selectedExecutive?.name || "Executive"}`}
        description="Select one or more active campaigns for this executive to work on, or create a new campaign on the spot."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold uppercase tracking-wider text-green-dark text-[11px]">
                Select Active Campaigns ({selectedCampaignIds.length} selected):
              </label>
              <span className="text-[10px] text-text-dim font-medium">
                Multi-campaign support enabled
              </span>
            </div>
            {campaignOptions.length === 0 ? (
              <div className="p-4 rounded-xl bg-butter-bg text-center text-text-muted">
                No campaigns found in this organisation yet.
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-green-dark/10 rounded-xl p-2 bg-butter-bg/40">
                {campaignOptions.map((c) => {
                  const checked = selectedCampaignIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => toggleCampaignSelection(c.id)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        checked
                          ? "bg-green-dark text-butter-cream border-green-dark font-bold"
                          : "bg-white hover:bg-butter-warm/40 border-green-dark/10 text-green-dark"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.name}</span>
                        <span className="text-[10px] opacity-75 font-normal">({c.eventType})</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          checked
                            ? "bg-butter-cream border-butter-cream text-green-dark"
                            : "border-green-dark/30 text-transparent"
                        }`}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Toggle Create New Campaign in Same Step */}
          <div className="pt-2 border-t border-green-dark/10">
            <button
              type="button"
              onClick={() => setShowNewCampaignSubform(!showNewCampaignSubform)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-green-mid hover:text-green-dark transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {showNewCampaignSubform
                ? "Hide new campaign form"
                : "+ Or create a new campaign and assign immediately"}
            </button>

            {showNewCampaignSubform && (
              <div className="mt-3 p-3.5 rounded-2xl bg-butter-bg/60 border border-green-dark/15 space-y-3 animate-fade-in">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-green-dark mb-1">
                    Campaign Name *
                  </label>
                  <Input
                    placeholder="e.g. Horizon Tech Expo 2026"
                    value={newCampaignForm.name}
                    onChange={(e) =>
                      setNewCampaignForm({ ...newCampaignForm, name: e.target.value })
                    }
                    className="text-xs"
                    required={showNewCampaignSubform}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-green-dark mb-1">
                      Event Type
                    </label>
                    <Input
                      value={newCampaignForm.eventType}
                      onChange={(e) =>
                        setNewCampaignForm({ ...newCampaignForm, eventType: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-green-dark mb-1">
                      Target Amount (INR)
                    </label>
                    <Input
                      type="number"
                      value={newCampaignForm.targetAmount}
                      onChange={(e) =>
                        setNewCampaignForm({
                          ...newCampaignForm,
                          targetAmount: Number(e.target.value),
                        })
                      }
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-green-dark/10 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setAssignModalOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="green"
              size="sm"
              loading={assigning}
              className="font-bold shadow-sm"
            >
              Save Assignments
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
