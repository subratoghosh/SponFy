import React from "react";
import Link from "next/link";
import { Hero } from "@/components/landing/Hero";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { WhySponfy } from "@/components/landing/WhySponfy";
import {
  Workflow,
  Target,
  Brain,
  BarChart3,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "SponFy — AI Sponsorship OS for College Fests & Hackathons",
  description:
    "Find, research and win event sponsors with AI that asks before it sends. Built for student organizers and campus conveners across India.",
};

const FEATURE_MODULES = [
  {
    title: "Workflow Engine",
    href: "/workflow",
    icon: Workflow,
    tag: "5 Disciplined Steps",
    description:
      "Structured pipeline from event prospectus ingestion to approved outreach, meeting bookings, and realized sponsorship checks.",
  },
  {
    title: "Sponsor Dossiers",
    href: "/showcase",
    icon: Target,
    tag: "Fit Score Algorithm",
    description:
      "Cross-references CSR programs, tech stacks, and campus hiring to calculate an objective 0-100 fit score backed by cited web sources.",
  },
  {
    title: "Reply Intelligence",
    href: "/intelligence",
    icon: Brain,
    tag: "Human Approval Gate",
    description:
      "Classifies incoming brand replies by intent and objections while guaranteeing zero emails leave without explicit organizer approval.",
  },
  {
    title: "Funnel Analytics",
    href: "/analytics",
    icon: BarChart3,
    tag: "Realtime Telemetry",
    description:
      "Track conversion rates, reply speeds, tier progress, and fund realization metrics against collegiate sponsorship benchmarks.",
  },
  {
    title: "Knowledge Base & FAQ",
    href: "/faq",
    icon: HelpCircle,
    tag: "Safety & Privacy",
    description:
      "Answers about official Google OAuth, Do Not Contact lists, spam protection, and institutional campus reputational safety.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero with Organic Blobs & Product Preview (100vh) */}
      <Hero />

      {/* 2. Trust Strip */}
      <TrustStrip />

      {/* 3. Dedicated Platform Feature Modules Hub */}
      <section className="py-20 bg-butter-bg border-b border-green-dark/10">
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="heading-font text-3xl sm:text-4xl font-extrabold text-green-dark tracking-tight mb-3">
              Everything student conveners need to fund their festival
            </h2>
            <p className="text-text-dim text-sm sm:text-base leading-relaxed">
              Dive into our dedicated platform modules to see how SponFy automates research, drafting, and reply tracking with institutional rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_MODULES.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={idx}
                  href={mod.href}
                  className="p-7 bg-white rounded-3xl border border-green-dark/12 shadow-xs hover:shadow-md hover:-translate-y-1.5 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-butter-warm flex items-center justify-center text-green-dark group-hover:bg-green-dark group-hover:text-butter-cream transition-colors duration-200">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-dark/5 text-green-dark border border-green-dark/10">
                        {mod.tag}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-xl text-green-dark mb-2 group-hover:text-green-mid transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-text-dim text-xs sm:text-sm leading-relaxed mb-6">
                      {mod.description}
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-dark group-hover:text-green-mid pt-3 border-t border-green-dark/8">
                    <span>Explore {mod.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Why SponFy (4 Honest Differentiators) */}
      <WhySponfy />
    </div>
  );
}
