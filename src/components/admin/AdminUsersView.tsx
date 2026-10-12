"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  MoreVertical,
  UserX,
  UserCheck,
  KeyRound,
  Trash2,
  Download,
  AlertTriangle,
  X,
  CheckCircle2,
  Calendar,
  FolderKanban,
  Send,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { AdminUser, UserRole, AccountStatus } from "@/types";
import { AdminHeader } from "./AdminHeader";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { ProfileSkeleton } from "@/components/skeletons/ProfileSkeleton";

interface Props {
  initialUsers: AdminUser[];
  total: number;
  adminUser?: any;
}

export function AdminUsersView({ initialUsers, total, adminUser }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Modals state
  const [actionModal, setActionModal] = useState<{
    type: "status" | "role" | "delete";
    user: AdminUser;
    newStatus?: AccountStatus;
    newRole?: UserRole;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      u.id.toLowerCase().includes(q) ||
      (u.orgName && u.orgName.toLowerCase().includes(q));

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUpdateStatus = async (user: AdminUser, newStatus: AccountStatus) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason: actionReason || "Administrative status change" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status update failed");

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setFeedback({ type: "success", message: `Account status for ${user.name || user.email} updated to ${newStatus}.` });
      setActionModal(null);
      setActionReason("");
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to update user status" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (user: AdminUser, newRole: UserRole) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Role update failed");

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
      setFeedback({ type: "success", message: `User role for ${user.name || user.email} updated to ${newRole}.` });
      setActionModal(null);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to change user role" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: actionReason || "Administrative account deletion" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "User deletion failed");

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      if (selectedUser?.id === user.id) setSelectedUser(null);
      setFeedback({ type: "success", message: `User account ${user.email} successfully deleted.` });
      setActionModal(null);
      setActionReason("");
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to delete user account" });
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Organization", "Role", "Status", "Campaigns", "EmailsSent", "Created"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name || ""}"`,
      `"${u.email || ""}"`,
      `"${u.orgName || ""}"`,
      u.role,
      u.status,
      u.campaignsCount,
      u.emailsSentCount,
      u.createdAt,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sponfy-users-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#FAF4E6]">
      <AdminHeader
        adminUser={adminUser}
        title="User Governance"
        subtitle="Manage organizer accounts, verify roles, suspend or moderate access, and inspect account activity."
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-70">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, org, or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10 focus:outline-none focus:ring-2 focus:ring-[#0C382E]/20 text-[#0C382E]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs bg-[#FAF4E6] border border-[#0C382E]/10 px-3 py-2 rounded-xl text-[#0C382E] font-medium focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="ADMIN">Admins Only</option>
              <option value="USER">Standard Users</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-[#FAF4E6] border border-[#0C382E]/10 px-3 py-2 rounded-xl text-[#0C382E] font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>

            {/* Export CSV */}
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#0C382E]/15 text-[#0C382E] text-xs font-bold hover:bg-[#FAF4E6] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-[#0C382E]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF4E6]/60 border-b border-[#0C382E]/10 text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">User / Organizer</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Campaigns</th>
                  <th className="py-3 px-4">Emails Sent</th>
                  <th className="py-3 px-4">Registered</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400">
                      No user accounts found matching current query or filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`hover:bg-[#FAF4E6]/40 cursor-pointer transition-colors ${
                        selectedUser?.id === user.id ? "bg-[#FAF4E6]/70" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#0C382E] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <div className="font-bold text-[#0C382E]">
                              {user.name || "Unnamed Organizer"}
                            </div>
                            <div className="text-[11px] text-neutral-500 font-mono">
                              {user.email || user.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.role === "ADMIN"
                              ? "bg-[#0C382E] text-[#FFF0B3]"
                              : "bg-neutral-100 text-neutral-600"
                          }`}
                        >
                          {user.role === "ADMIN" && <ShieldCheck className="w-3 h-3" />}
                          {user.role}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-neutral-700">
                        {user.campaignsCount}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-neutral-700">
                        {user.emailsSentCount}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-500">
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Suspend / Restore Button */}
                          {user.status === "ACTIVE" ? (
                            <button
                              onClick={() =>
                                setActionModal({ type: "status", user, newStatus: "SUSPENDED" })
                              }
                              title="Suspend User"
                              className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setActionModal({ type: "status", user, newStatus: "ACTIVE" })
                              }
                              title="Restore User"
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Role Toggle Button */}
                          <button
                            onClick={() =>
                              setActionModal({
                                type: "role",
                                user,
                                newRole: user.role === "ADMIN" ? "USER" : "ADMIN",
                              })
                            }
                            title="Toggle Admin Role"
                            className="p-1.5 rounded-lg text-[#0C382E] hover:bg-[#FAF4E6]"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setActionModal({ type: "delete", user })}
                            title="Delete User Account"
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Drawer (when selected) */}
        {selectedUser && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white border-l border-[#0C382E]/10 shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0C382E]">
                  User Profile Inspector
                </span>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0C382E] text-white flex items-center justify-center font-bold text-lg">
                  {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-[#0C382E] text-base">
                    {selectedUser.name || "Organizer"}
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    {selectedUser.email || selectedUser.id}
                  </p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-[#FAF4E6] rounded-2xl border border-[#0C382E]/10 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">User ID:</span>
                  <span className="font-mono text-[11px] text-[#0C382E]">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Role:</span>
                  <span className="font-bold text-[#0C382E]">{selectedUser.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Status:</span>
                  <span className="font-bold">{selectedUser.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Organization:</span>
                  <span className="font-medium text-neutral-800">{selectedUser.orgName || "Not configured"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Registered:</span>
                  <span className="font-mono">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-neutral-200 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold">Campaigns</span>
                  <div className="text-xl font-black text-[#0C382E] mt-0.5">
                    {selectedUser.campaignsCount}
                  </div>
                </div>
                <div className="p-3 bg-white border border-neutral-200 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase font-bold">Emails Sent</span>
                  <div className="text-xl font-black text-[#0C382E] mt-0.5">
                    {selectedUser.emailsSentCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 flex gap-2">
              <button
                onClick={() =>
                  setActionModal({
                    type: "status",
                    user: selectedUser,
                    newStatus: selectedUser.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                  })
                }
                className="flex-1 py-2.5 rounded-xl border border-[#0C382E]/20 text-[#0C382E] font-bold text-xs hover:bg-[#FAF4E6]"
              >
                {selectedUser.status === "ACTIVE" ? "Suspend Account" : "Restore Account"}
              </button>
              <button
                onClick={() => setActionModal({ type: "delete", user: selectedUser })}
                className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                title="Delete User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Action Modal */}
        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-neutral-200">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    actionModal.type === "delete"
                      ? "bg-red-100 text-red-600"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {actionModal.type === "delete" ? (
                    <Trash2 className="w-5 h-5" />
                  ) : actionModal.type === "role" ? (
                    <KeyRound className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[#0C382E] text-base">
                    {actionModal.type === "delete"
                      ? "Confirm Account Deletion"
                      : actionModal.type === "role"
                      ? "Confirm Role Modification"
                      : `Confirm Account ${actionModal.newStatus}`}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Target account: <strong className="text-neutral-800">{actionModal.user.email}</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {actionModal.type === "delete"
                  ? "This operation will permanently delete this user account. Campaigns and audit logs will be preserved or archived to protect business data integrity."
                  : actionModal.type === "role"
                  ? `Changing role to ${actionModal.newRole} will modify platform-wide administration capabilities.`
                  : `Marking account as ${actionModal.newStatus} will toggle the user's ability to login and send outreach.`}
              </p>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                  Reason for Audit Trail
                </label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Policy review, organizer request, promotion..."
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 bg-[#FAF4E6] text-[#0C382E] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    if (actionModal.type === "status" && actionModal.newStatus) {
                      handleUpdateStatus(actionModal.user, actionModal.newStatus);
                    } else if (actionModal.type === "role" && actionModal.newRole) {
                      handleUpdateRole(actionModal.user, actionModal.newRole);
                    } else if (actionModal.type === "delete") {
                      handleDeleteUser(actionModal.user);
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-all ${
                    actionModal.type === "delete"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-[#0C382E] hover:bg-[#0C382E]/90"
                  }`}
                >
                  {actionLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Confirm Action"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
