import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Inbox,
  Lock,
  Eye,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Why Us | SponFy - Deliverability & Outreach Intelligence",
  description: "Learn how SponFy eliminates cold email bounce risks, protects your sender reputation with 2-tier verification, and crafts high-converting pitches.",
};

export default function WhyUsPage() {
  const securityFeatures = [
    {
      icon: ShieldCheck,
      title: "2-Tier Verification & Zero Bounce Guarantee",
      subtitle: "Multi-layer MX, SMTP, and mailbox existence auditing",
      description:
        "Every corporate sponsor contact passes through deep mailbox handshakes before dispatch. Catch-all domains, invalid mailboxes, and disposable inboxes are quarantined immediately to safeguard your domain from hard bounces.",
      bullets: [
        "Real-time SMTP mailbox handshake verification",
        "Automatic exclusion of dead or toxic domains",
        "Deliverability confidence rating attached to every lead",
      ],
    },
    {
      icon: Inbox,
      title: "Spam Penalty & Inbox Placement Defense",
      subtitle: "Never land in the sponsor's spam or promotional folder",
      description:
        "Corporate firewalls and email gateways (Google Workspace & Microsoft 365) trigger filters when aggressive cold sequences or spam keywords are used. Our algorithms remove triggering phrases and enforce natural send spacing.",
      bullets: [
        "Dynamic spam keyword suppression across all draft subjects",
        "Adaptive daily rate caps that mimic natural human sending behavior",
        "Automatic stop-sequences when an inbound reply is received",
      ],
    },
    {
      icon: Sparkles,
      title: "Hyper-Personalized Pitch Synthesis",
      subtitle: "Every company receives a tailored, context-aware proposal",
      description:
        "Mass generic mail-merges destroy response rates. SponFy extracts verified developer initiatives, hiring goals, and past corporate sponsorships to write custom emails citing real alignment with your campaign.",
      bullets: [
        "Unique customized value proposition for every company in mass outreach",
        "Cites real company products, student developer tracks, and CSR initiatives",
        "Adapts to your desired tone: Professional, Enthusiastic, Value-First, or Short",
      ],
    },
    {
      icon: FileCheck2,
      title: "Comprehensive AI Quality Evaluation",
      subtitle: "Rigorous 6-factor quality score before you approve",
      description:
        "Every drafted email receives an objective, multi-point evaluation across Personalization, Industry Relevance, Structural Clarity, CTA Strength, and Tone Professionalism.",
      bullets: [
        "0-100 real-time quality grading per draft",
        "Actionable improvement suggestions prior to human approval",
        "Guarantees that only elite pitches leave your organizer inbox",
      ],
    },
  ];

  const comparisonItems = [
    {
      feature: "Email Verification",
      sponfy: "2-Tier Deep Mailbox & SMTP Handshake",
      traditional: "Basic regex syntax check or guessed emails",
    },
    {
      feature: "Outreach Personalization",
      sponfy: "Unique individualized pitch citing company initiatives",
      traditional: "Generic mail merge: 'Hey {{Company}}, sponsor us'",
    },
    {
      feature: "Sending Safety & Approvals",
      sponfy: "Human-in-the-loop review with deliverability alerts",
      traditional: "Unattended spam bots that burn your domain",
    },
    {
      feature: "Reply Handling",
      sponfy: "Automated intent classification & sequence pause",
      traditional: "Manual sorting & continued spamming after 'No'",
    },
    {
      feature: "Quality Control",
      sponfy: "Built-in 6-point evaluation scorecard with feedback",
      traditional: "Zero quality feedback; organizer guesswork",
    },
  ];

  return (
    <div className="flex flex-col pt-16 md:pt-20 bg-butter-bg min-h-screen">
      {/* Hero Section */}
      <section className="py-20 sm:py-28 px-6 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-butter-warm border border-green-dark/15 text-xs font-bold text-green-dark shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Deliverability & Safety Architecture
        </div>

        <h1 className="font-heading font-black text-4xl sm:text-6xl text-green-dark tracking-tight leading-tight">
          Engineered for 0% Spam Penalty & Maximum Sponsor Responses.
        </h1>

        <p className="text-base sm:text-lg text-text-dim max-w-2xl mx-auto leading-relaxed">
          Traditional cold emails burn your domain reputation with high bounces and generic templates. SponFy pairs rigorous email verification with context-rich AI personalization.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/app">
            <Button variant="green" size="lg" className="font-bold shadow-md gap-2 w-full sm:w-auto">
              Launch SponFy Workspace <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/workflow">
            <Button variant="outline" size="lg" className="font-bold border-green-dark/20 text-green-dark w-full sm:w-auto">
              Explore 5-Step Workflow
            </Button>
          </Link>
        </div>
      </section>

      {/* Security & Intelligence Grid */}
      <section className="py-16 bg-white border-y border-green-dark/10">
        <div className="max-w-[1240px] mx-auto px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-green-dark">
              Built-in Protection at Every Step
            </h2>
            <p className="text-sm sm:text-base text-text-dim">
              How our proprietary safety gates and AI synthesis guarantee high conversion without risking your organizer inbox.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {securityFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-butter-panel/60 border border-green-dark/12 shadow-sm space-y-5 hover:bg-butter-panel transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white border border-green-dark/12 flex items-center justify-center text-green-dark shadow-xs">
                    <Icon className="w-6 h-6 text-green-mid" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-heading font-black text-xl text-green-dark">
                      {feat.title}
                    </h3>
                    <p className="text-xs font-semibold text-green-mid uppercase tracking-wide">
                      {feat.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-text-dim leading-relaxed">
                    {feat.description}
                  </p>

                  <ul className="space-y-2 pt-2 border-t border-green-dark/8">
                    {feat.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-medium text-green-dark/90">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-butter-bg">
        <div className="max-w-[1040px] mx-auto px-6 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-heading font-black text-3xl text-green-dark">
              How SponFy Compares
            </h2>
            <p className="text-sm text-text-dim">
              The contrast between modern sponsorship intelligence and legacy cold email approaches.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-green-dark/12 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-butter-panel border-b border-green-dark/10">
                    <th className="p-4 sm:p-5 font-heading font-black text-xs uppercase tracking-wider text-green-dark">
                      Capability
                    </th>
                    <th className="p-4 sm:p-5 font-heading font-black text-xs uppercase tracking-wider text-emerald-800 bg-emerald-50/60">
                      SponFy Intelligent Platform
                    </th>
                    <th className="p-4 sm:p-5 font-heading font-black text-xs uppercase tracking-wider text-text-muted">
                      Generic Cold Bots & Spreadsheets
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-dark/8">
                  {comparisonItems.map((item, i) => (
                    <tr key={i} className="hover:bg-butter-panel/20 transition-colors">
                      <td className="p-4 sm:p-5 font-bold text-green-dark">
                        {item.feature}
                      </td>
                      <td className="p-4 sm:p-5 font-semibold text-emerald-900 bg-emerald-50/30">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item.sponfy}</span>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 text-text-dim">
                        {item.traditional}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="py-16 bg-green-dark text-white text-center px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="font-heading font-black text-3xl sm:text-4xl text-butter-cream">
            Protect your sender score and secure high-value sponsors.
          </h2>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed">
            Start reaching verified decision makers today with personalized pitches and full deliverability safeguards.
          </p>
          <div className="pt-2">
            <Link href="/app">
              <Button variant="butter" size="lg" className="font-bold shadow-lg gap-2 text-green-dark cursor-pointer">
                Enter App Workspace <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
