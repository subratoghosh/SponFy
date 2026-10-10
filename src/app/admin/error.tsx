"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft, ShieldAlert } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Secure diagnostic logging without leaking secrets or tokens
    console.error("[SponFy Admin Error]:", {
      name: error.name,
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAF4E6]">
      <div className="max-w-md w-full bg-white rounded-2xl border-2 border-[#0C382E]/10 p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 mb-2">
            Admin System Alert
          </span>
          <h2 className="text-2xl font-bold text-[#0C382E] tracking-tight">
            Failed to Load Admin Data
          </h2>
          <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
            A secure admin query failed to complete. Your session remains authenticated, but the requested administrative dataset encountered an unexpected exception.
          </p>
        </div>

        {error.digest && (
          <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-left font-mono text-xs text-neutral-500 truncate">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0C382E] text-white font-medium hover:bg-[#0C382E]/90 transition-all text-sm cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Action
          </button>
          <Link
            href="/admin"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF0B3] text-[#0C382E] font-medium hover:bg-[#FFF0B3]/80 transition-all text-sm border border-[#0C382E]/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin Home
          </Link>
        </div>
      </div>
    </div>
  );
}
