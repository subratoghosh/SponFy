import React from "react";
import Link from "next/link";
import { 
  FileText, 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  ShieldAlert, 
  HelpCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Terms of Service | SponFy",
  description: "Terms and conditions governing the use of SponFy for campaigns, events, and sponsorship operations.",
};

export default function TermsOfServicePage() {
  const effectiveDate = "October 11, 2026";

  return (
    <div className="flex flex-col pt-24 sm:pt-28 pb-16">
      {/* Hero Header */}
      <section className="relative px-6 pb-14 border-b border-green-dark/10">
        <div className="max-w-[1040px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider">
            <Scale className="w-4 h-4 text-green-accent" />
            TERMS OF USE & SERVICE AGREEMENT
          </div>
          <h1 className="display-font text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-dark tracking-tight">
            Terms of Service
          </h1>
          <p className="text-text-dim text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Welcome to SponFy. These terms govern your access to and use of our AI sponsorship intelligence engine, campaign dashboards, and outreach workflows.
          </p>
          <div className="text-xs text-text-dim/80 pt-1 font-mono">
            Effective Date: <span className="font-semibold text-green-dark">{effectiveDate}</span>
          </div>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="px-6 py-12 bg-white/60 border-b border-green-dark/10">
        <div className="max-w-[1040px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Human-in-the-Loop</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                All outreach emails must be explicitly reviewed and initiated by a human organizer.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Student Representation</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                You represent a genuine organization, event, or initiative.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Anti-Spam Mandate</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                No spray-and-pray spamming. Outreach must be personalized, relevant, and respect opt-outs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Fair Use Engine</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                AI research and drafting tokens are provided under fair-use guidelines to ensure community availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Body */}
      <section className="px-6 py-12">
        <div className="max-w-[840px] mx-auto space-y-12 text-text-main">

          {/* Section 1 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">1</span>
              Acceptance & Eligibility
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                By signing in to SponFy, connecting a Google account, or using our campaign tools, you agree to these Terms of Service and our{" "}
                <Link href="/privacy" className="text-green-dark underline font-medium">Privacy Policy</Link>.
              </p>
              <p>
                To be eligible to use SponFy, you must be at least 18 years old or an enrolled student acting with authorization from your academic institution, organization or event committee.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">2</span>
              Platform Description & AI Drafting Role
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                SponFy provides intelligent discovery, live company dossier research, and assistive outreach drafting.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-green-dark">Assistive Intelligence:</strong> SponFy leverages automated web intelligence and LLMs to assist in finding suitable brand sponsors and composing pitch emails.
                </li>
                <li>
                  <strong className="text-green-dark">Human Oversight Obligation:</strong> You acknowledge that AI output may occasionally contain inaccuracies. As an organizer, you are solely responsible for reviewing pitch contents, sponsor names, deliverable details, and pricing before sending.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">3</span>
              Acceptable Use & Anti-Spam Policy
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                To protect student community reputation and corporate partner relationships, you agree NOT to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Send unsolicited bulk emails, deceptive claims, or phishing attempts.</li>
                <li>Misrepresent your event attendance, participant metrics, or institutional affiliation.</li>
                <li>Contact recipients who have previously opted out, requested unsubscribe, or asked not to be contacted.</li>
                <li>Attempt to reverse engineer, scrape at scale, or bypass rate limits on SponFy’s AI APIs or search services.</li>
                <li>Promote illegal activities, hate speech, or defamatory statements in sponsor correspondence.</li>
              </ul>
              <p className="text-xs bg-red-50 text-red-900 p-3 rounded-xl border border-red-200">
                Violation of this Acceptable Use Policy will result in immediate workspace suspension and revocation of API access.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">4</span>
              Intellectual Property Rights
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-green-dark">Your Content:</strong> You retain full ownership of your campaign brochures, decks, institution logos, custom pitch text, and organizer materials uploaded to SponFy.
                </li>
                <li>
                  <strong className="text-green-dark">SponFy Property:</strong> SponFy, our design tokens, branding, algorithm workflows, intelligence extractors, and software code remain the exclusive property of SponFy.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">5</span>
              No Guarantee of Sponsorship Funding
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                While SponFy significantly accelerates research, personalization, and pipeline management, we do NOT guarantee that any specific corporate brand will sponsor your event or provide monetary grants. Sponsorship agreements are entirely at the discretion of prospective corporate sponsors.
              </p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">6</span>
              Limitation of Liability
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                To the maximum extent permitted by applicable law, SponFy and its contributors shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from your use of the platform, email deliverability issues, or third-party sponsor disputes.
              </p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">7</span>
              Termination & Suspension
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                You may terminate your account at any time by stopping platform usage or requesting account deletion. We reserve the right to suspend or terminate accounts that breach these terms or engage in spam behavior without prior notice.
              </p>
            </div>
          </div>

          {/* Section 8 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">8</span>
              Governing Law & Dispute Resolution
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                These terms are governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any legal proceedings shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, India.
              </p>
            </div>
          </div>

          {/* Section 9 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">9</span>
              Contact Information
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                For questions regarding these Terms of Service or corporate partner inquiries:
              </p>
              <div className="p-5 rounded-2xl bg-white border border-green-dark/10 space-y-1">
                <div className="font-bold text-green-dark">SponFy Legal Operations</div>
                <div className="text-xs text-text-dim">Email: <a href="mailto:legal@sponfy.com" className="text-green-dark underline font-medium">legal@sponfy.com</a></div>
                <div className="text-xs text-text-dim">Location: Bengaluru, Karnataka, India</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pt-12 border-t border-green-dark/10">
        <div className="max-w-[840px] mx-auto p-8 rounded-3xl bg-green-dark text-butter-cream flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="display-font text-xl font-bold text-butter-cream">
              Questions about sponsorships?
            </h4>
            <p className="text-xs text-text-onDarkSub/80 max-w-md">
              Check our FAQ for deep dives on Gmail OAuth safety and ethical AI drafting.
            </p>
          </div>
          <Link href="/faq">
            <Button variant="butter" size="md" className="font-bold shrink-0">
              Explore FAQ
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
