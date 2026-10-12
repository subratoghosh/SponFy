import React from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  FileCheck2, 
  Database, 
  KeyRound, 
  Mail, 
  UserX,
  Server,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | SponFy",
  description: "Learn how SponFy collects, uses, and safeguards data for organizers, campaign teams, and sponsor outreach.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "October 11, 2026";

  return (
    <div className="flex flex-col pt-24 sm:pt-28 pb-16">
      {/* Hero Header */}
      <section className="relative px-6 pb-14 border-b border-green-dark/10">
        <div className="max-w-[1040px] mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-green-accent" />
            LEGAL & DATA PROTECTION
          </div>
          <h1 className="display-font text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-dark tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-text-dim text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            At SponFy, we are committed to transparent, secure, and privacy-respecting operations for campaigns, events, and organizations. Here is how your data is handled.
          </p>
          <div className="text-xs text-text-dim/80 pt-1 font-mono">
            Last Updated: <span className="font-semibold text-green-dark">{lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Highlights Grid */}
      <section className="px-6 py-12 bg-white/60 border-b border-green-dark/10">
        <div className="max-w-[1040px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Zero LLM Training</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Your private emails, pitches, and organizer decks are never used to train public AI models.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">AES-256 Encryption</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                OAuth access tokens and sensitive credentials are encrypted with AES-256 at rest and in transit.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Limited Gmail Scope</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                We adhere strictly to Google API User Data Policy & Limited Use requirements for Gmail operations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <UserX className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Never Sold or Rented</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                Contact lists, campaign databases, and sponsor intelligence are never commercialized to third parties.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <section className="px-6 py-12">
        <div className="max-w-[840px] mx-auto space-y-12 text-text-main">

          {/* Section 1 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">1</span>
              Information We Collect
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                When you create an organizer workspace or execute sponsor campaigns on SponFy, we collect specific categories of information necessary to deliver our services:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-green-dark">Account & Organizer Profile:</strong> Your name, official college email address, institution name, organization or campaign title, and contact details.
                </li>
                <li>
                  <strong className="text-green-dark">Campaign & Pitch Inputs:</strong> Campaign deliverables, expected attendee numbers, tier pricing (Title, Associate, Gift Partner), brochures, and custom value propositions.
                </li>
                <li>
                  <strong className="text-green-dark">Public Sponsor Intelligence:</strong> Corporate domain names, public brand press releases, job postings, CSR focus areas, and publicly accessible corporate contact information discovered via live web search.
                </li>
                <li>
                  <strong className="text-green-dark">Communication Telemetry:</strong> Timestamp of approved outreach emails, delivery states, reply sentiment tags (e.g. Interested, Budget Exhausted, Follow-Up), and organizer approvals.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">2</span>
              How We Use Your Information
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                We use the information we process strictly for the following purposes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Providing automated research dossiers matching your campaign type with relevant corporate sponsors.</li>
                <li>Drafting tailored sponsor proposals and value proposition emails for your review and approval.</li>
                <li>Delivering approved messages through your connected Gmail account and parsing inbound responses for sponsorship status updates.</li>
                <li>Maintaining audit trails and telemetry on your organizer campaign dashboard.</li>
                <li>Preventing abuse, duplicate cold pitching, spam, or terms violations.</li>
              </ul>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">3</span>
              Google API Services & Gmail Scopes Disclosure
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-green-dark">
                <p className="font-semibold text-xs uppercase tracking-wider mb-1">
                  Google API Limited Use Compliance
                </p>
                <p className="text-xs leading-relaxed text-text-dim">
                  SponFy’s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
                  <a 
                    href="https://developers.google.com/terms/api-services-user-data-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline text-green-dark font-medium"
                  >
                    Google API Services User Data Policy
                  </a>, including the Limited Use requirements.
                </p>
              </div>
              <p>
                When you connect your Gmail account to SponFy via Google OAuth:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-green-dark">Send Scope:</strong> We only transmit outbound emails that have been explicitly confirmed and initiated by you via the Human Approval Gate.
                </li>
                <li>
                  <strong className="text-green-dark">Read Scope:</strong> We only scan inbound email threads linked directly to active SponFy outreach campaigns to classify sponsor replies. We do not read, process, or archive unrelated personal or academic emails.
                </li>
                <li>
                  <strong className="text-green-dark">Zero Human Surveillance:</strong> Our personnel do not read your private email messages unless explicitly requested for debugging with written consent.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">4</span>
              Security & Data Storage
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                We implement industry-standard cryptographic and administrative safeguards:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>All network traffic is encrypted in transit using Transport Layer Security (TLS 1.3).</li>
                <li>OAuth refresh tokens and sensitive tokens are encrypted at rest using AES-256 encryption.</li>
                <li>Databases are hosted in SOC 2-compliant cloud facilities with continuous automated backups and role-restricted query access.</li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">5</span>
              Subprocessors & Third-Party Services
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                To provide research intelligence and infrastructure, SponFy utilizes vetted subprocessors:
              </p>
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs text-left border border-green-dark/10 rounded-xl overflow-hidden">
                  <thead className="bg-green-dark/5 text-green-dark font-bold">
                    <tr>
                      <th className="p-3">Partner / Service</th>
                      <th className="p-3">Function</th>
                      <th className="p-3">Data Handled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-dark/10 bg-white">
                    <tr>
                      <td className="p-3 font-medium text-green-dark">Neon PostgreSQL</td>
                      <td className="p-3">Serverless Database</td>
                      <td className="p-3">Encrypted account data & telemetry</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-green-dark">Google Gemini API</td>
                      <td className="p-3">AI Synthesis Engine</td>
                      <td className="p-3">Campaign prompts & sponsor dossiers (No training)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-green-dark">Tavily AI</td>
                      <td className="p-3">Live Search API</td>
                      <td className="p-3">Public brand domains and company news queries</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">6</span>
              Your Rights & Data Portability
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                You retain complete control over your campaign records and organizer data:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-green-dark">Right to Revoke:</strong> You can disconnect your Google OAuth credentials anytime directly from your dashboard or via Google Account Security settings.
                </li>
                <li>
                  <strong className="text-green-dark">Right to Deletion:</strong> You may request complete erasure of your workspace, outreach logs, and account records upon campaign conclusion.
                </li>
                <li>
                  <strong className="text-green-dark">Right to Export:</strong> Download all generated company dossiers, verified contact emails, and response logs in standard formats.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 7 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">7</span>
              Contact Us & Data Privacy Officer
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                If you have questions regarding this Privacy Policy or wish to exercise your data rights, contact our privacy team:
              </p>
              <div className="p-5 rounded-2xl bg-white border border-green-dark/10 space-y-1">
                <div className="font-bold text-green-dark">SponFy Data Governance & Grievance Cell</div>
                <div className="text-xs text-text-dim">Email: <a href="mailto:privacy@sponfy.com" className="text-green-dark underline font-medium">privacy@sponfy.com</a></div>
                <div className="text-xs text-text-dim">Headquarters: Bengaluru, Karnataka, India</div>
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
              Ready to automate sponsorships securely?
            </h4>
            <p className="text-xs text-text-onDarkSub/80 max-w-md">
              Start building targeted sponsor pipelines with student-first privacy protections.
            </p>
          </div>
          <Link href="/app">
            <Button variant="butter" size="md" className="font-bold shrink-0">
              Launch Workspace
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
