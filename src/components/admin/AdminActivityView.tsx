"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Info,
  CheckCircle2,
  FileText,
  RefreshCw,
  Database,
  ArrowRight,
} from "lucide-react";
import { AuditLogEntry } from "@/types";
import { AdminHeader } from "./AdminHeader";

interface Props {
  initialLogs: AuditLogEntry[];
  total: number;
  adminUser?: any;
}

const ACTION_FILTERS = [
  { id: "all", label: "All Audit Actions" },
  { id: "user_suspended", label: "User Suspensions" },
  { id: "user_restored", label: "User Restorations" },
  { id: "role_changed", label: "Role Changes" },
  { id: "user_deleted", label: "User Deletions" },
  { id: "campaign_archived", label: "Campaign Archives" },
  { id: "campaign_restored", label: "Campaign Restorations" },
];

export function AdminActivityView({ initialLogs, total, adminUser }: Props) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      log.action.toLowerCase().includes(q) ||
      (log.adminName && log.adminName.toLowerCase().includes(q)) ||
      (log.adminEmail && log.adminEmail.toLowerCase().includes(q)) ||
      (log.targetId && log.targetId.toLowerCase().includes(q)) ||
      log.targetType.toLowerCase().includes(q);

    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  return (
    <div className="min-h-screen bg-[#FAF4E6]">
      <AdminHeader
        adminUser={adminUser}
        title="Security & Audit Logs"
        subtitle="Immutable security trail of administrative interventions, role modifications, and account moderations."
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admin, action, target..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10 focus:outline-none focus:ring-2 focus:ring-[#0C382E]/20 text-[#0C382E]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="text-xs bg-[#FAF4E6] border border-[#0C382E]/10 px-3 py-2 rounded-xl text-[#0C382E] font-medium focus:outline-none"
            >
              {ACTION_FILTERS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-white rounded-2xl border border-[#0C382E]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF4E6]/60 border-b border-[#0C382E]/10 text-neutral-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Acting Administrator</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Context / Metadata</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-neutral-400">
                      No audit log events match the query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-[#FAF4E6]/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#0C382E] text-[#FFF0B3]">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-[#0C382E]">
                          {log.adminName || "System Admin"}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {log.adminEmail || log.adminId}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-700 capitalize">
                          {log.targetType}
                        </span>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {log.targetId || "global"}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                        {log.details.reason ? (
                          <span>{log.details.reason}</span>
                        ) : (
                          <span className="font-mono text-[11px] text-neutral-400">
                            {JSON.stringify(log.details)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-[11px] font-bold text-[#0C382E] hover:underline"
                        >
                          Inspect JSON
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal JSON Inspector */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-neutral-200">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#0C382E]" />
                  <h3 className="font-bold text-[#0C382E] text-base">
                    Audit Event Details
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-400"
                >
                  ✕
                </button>
              </div>

              <div className="p-3 bg-[#FAF4E6] rounded-xl text-xs space-y-1 font-mono">
                <div><strong>Event ID:</strong> {selectedLog.id}</div>
                <div><strong>Action:</strong> {selectedLog.action}</div>
                <div><strong>Admin:</strong> {selectedLog.adminEmail || selectedLog.adminId}</div>
                <div><strong>Target:</strong> {selectedLog.targetType} : {selectedLog.targetId}</div>
                <div><strong>Timestamp:</strong> {selectedLog.createdAt}</div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                  Raw Event Context Metadata
                </span>
                <pre className="p-3 bg-neutral-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-[#0C382E] text-white text-xs font-bold hover:bg-[#0C382E]/90"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
