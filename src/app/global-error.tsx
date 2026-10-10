"use client";

import React, { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Root layout critical failure:", {
      message: error?.message,
      digest: error?.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAF4E6] text-[#0C382E] font-sans flex flex-col items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#0C382E] text-[#FFF0B3] flex items-center justify-center mx-auto shadow-xl text-3xl font-black">
            SF
          </div>

          <div className="space-y-2">
            <h1 className="font-serif font-black text-3xl text-[#0C382E]">
              Critical Application Error
            </h1>
            <p className="text-sm text-[#244D3F] leading-relaxed">
              An unexpected failure occurred while initializing the application layout.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#FFF0B3] text-[#0C382E] font-bold text-sm shadow-md hover:bg-[#FEE790] transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Application
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-[#0C382E]/20 text-[#0C382E] font-semibold text-sm hover:bg-[#FFF0B3]/30 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
