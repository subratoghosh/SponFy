import React from "react";
import { FAQ } from "@/components/landing/FAQ";
import { HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Knowledge Base & FAQ | SponFy",
  description: "Frequently asked questions about Gmail safety, Google OAuth, AI drafting, pricing, and student community privacy.",
};

export default function FAQPage() {
  return (
    <div className="flex flex-col pt-16 md:pt-20">
      {/* Main Accordion FAQ Component */}
      <FAQ />

      {/* Trust & Guarantee Banner */}
      <section className="py-20 bg-butter-bg border-t border-green-dark/10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="p-8 md:p-12 bg-white rounded-3xl border border-green-dark/12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider mb-4">
                <HelpCircle className="w-3.5 h-3.5 text-green-accent" />
                STILL HAVE QUESTIONS?
              </div>
              <h3 className="display-font text-2xl sm:text-3xl font-bold text-green-dark mb-3">
                Need a custom setup for your inter-college festival?
              </h3>
              <p className="text-text-dim text-sm sm:text-base leading-relaxed">
                Whether you run an 8,000-attendee cultural extravaganza or a 36-hour flagship hackathon, our campus advisors are ready to walk through your campaign setup.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/app">
                <Button variant="butter" size="md" className="font-bold shadow-md">
                  Launch Free Workspace
                </Button>
              </Link>
              <a href="mailto:support@sponfy.com">
                <Button variant="glass" size="md" className="font-semibold">
                  Talk to Student Support
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
