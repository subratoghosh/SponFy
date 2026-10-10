"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Database, ExternalLink, User } from "lucide-react";
import { AdminUser } from "@/types";

interface AdminHeaderProps {
  adminUser?: Partial<AdminUser> | null;
  title?: string;
  subtitle?: string;
}

export function AdminHeader({ adminUser, title, subtitle }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-[#0C382E]/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sticky top-0 z-30 shadow-xs">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0C382E]/60">
            Platform Administration
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0C382E]/30" />
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Live Cluster
          </span>
        </div>
        {title && (
          <h1 className="text-2xl font-black text-[#0C382E] tracking-tight mt-0.5">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Workspace Quick Link */}
        <Link
          href="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#0C382E]/15 text-[#0C382E] hover:bg-[#FAF4E6] transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>User View</span>
        </Link>

        {/* Administrator Profile Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#FAF4E6] border border-[#0C382E]/15 rounded-xl">
          <div className="w-7 h-7 rounded-lg bg-[#0C382E] text-white flex items-center justify-center font-bold text-xs">
            {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : <ShieldCheck className="w-4 h-4 text-[#FFF0B3]" />}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-[#0C382E] flex items-center gap-1">
              <span>{adminUser?.name || "Platform Admin"}</span>
              <span className="text-[10px] bg-[#0C382E] text-[#FFF0B3] px-1.5 py-0.2 rounded font-mono font-semibold">
                ADMIN
              </span>
            </div>
            <div className="text-[10px] text-neutral-500 font-mono truncate max-w-[150px]">
              {adminUser?.email || "admin@sponfy.dev"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
