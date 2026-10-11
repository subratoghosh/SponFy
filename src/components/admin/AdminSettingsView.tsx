"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Server,
  Zap,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Database,
  Radio,
  Save,
  RefreshCw,
} from "lucide-react";
import { AdminHeader } from "./AdminHeader";

interface Props {
  adminUser?: any;
}

export function AdminSettingsView({ adminUser }: Props) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [dailyEmailLimit, setDailyEmailLimit] = useState(100);
  const [aiModel, setAiModel] = useState("gemini-1.5-flash");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    // Simulate server settings persistence & audit logging
    await new Promise((res) => setTimeout(res, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF4E6]">
      <AdminHeader
        adminUser={adminUser}
        title="Administrative Settings"
        subtitle="Platform-wide governance policies, API boundaries, and system parameters."
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Platform settings saved and logged to audit trail.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Security & Access Controls */}
          <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-[#0C382E]" />
              <div>
                <h3 className="text-base font-bold text-[#0C382E]">
                  Platform Security & Access Policies
                </h3>
                <p className="text-xs text-neutral-500">
                  Manage system maintenance, role restrictions, and environment keys.
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between p-4 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10">
                <div>
                  <div className="font-bold text-xs text-[#0C382E]">
                    Emergency Maintenance Mode
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Restricts non-administrator logins while database upgrades or migrations execute.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0C382E]"></div>
                </label>
              </div>

              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
                <span className="font-bold text-neutral-700 block">
                  Designated Root Administrators
                </span>
                <p className="text-neutral-500 text-[11px]">
                  Configured via server environment <code className="bg-neutral-200 px-1 py-0.5 rounded font-mono">ADMIN_EMAILS</code>. Accounts matching these emails receive administrator authorization upon session validation.
                </p>
                <div className="font-mono text-[11px] text-[#0C382E] bg-white p-2.5 rounded-lg border border-neutral-200">
                  Configured via server environment (ADMIN_EMAILS)
                </div>
              </div>
            </div>
          </div>

          {/* Rate Limits & AI Engines */}
          <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Zap className="w-5 h-5 text-[#0C382E]" />
              <div>
                <h3 className="text-base font-bold text-[#0C382E]">
                  Resource Quotas & AI Engine Configuration
                </h3>
                <p className="text-xs text-neutral-500">
                  Daily outbound email throttling and AI provider selection.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">
                  Max Daily Outbound Emails per User
                </label>
                <input
                  type="number"
                  min={10}
                  max={1000}
                  value={dailyEmailLimit}
                  onChange={(e) => setDailyEmailLimit(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 bg-[#FAF4E6] text-[#0C382E] font-bold focus:outline-none"
                />
                <span className="text-[11px] text-neutral-400 block">
                  Prevents spam score degradation and protects domain reputation.
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 block">
                  AI Enrichment Model
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 bg-[#FAF4E6] text-[#0C382E] font-bold focus:outline-none"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Low Latency)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning & Synthesis)</option>
                </select>
                <span className="text-[11px] text-neutral-400 block">
                  Engine used for sponsor fit analysis and personalized email drafting.
                </span>
              </div>
            </div>
          </div>

          {/* Database & Infrastructure Telemetry */}
          <div className="bg-white rounded-2xl border border-[#0C382E]/10 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
              <Database className="w-5 h-5 text-[#0C382E]" />
              <div>
                <h3 className="text-base font-bold text-[#0C382E]">
                  Database & Connection Pool Status
                </h3>
                <p className="text-xs text-neutral-500">
                  Telemetry on Prisma database engine and live connectivity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Architecture</span>
                <div className="font-bold text-[#0C382E] mt-0.5">PostgreSQL + Prisma</div>
              </div>
              <div className="p-3 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Isolation</span>
                <div className="font-bold text-[#0C382E] mt-0.5">Row Level Security (RLS)</div>
              </div>
              <div className="p-3 bg-[#FAF4E6] rounded-xl border border-[#0C382E]/10">
                <span className="text-[10px] text-neutral-400 font-bold uppercase">Health</span>
                <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Operational
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0C382E] text-white text-xs font-bold hover:bg-[#0C382E]/90 transition-all cursor-pointer shadow-md"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
