import React from "react";
import Link from "next/link";
import { 
  Cookie, 
  ShieldCheck, 
  Lock, 
  Settings2, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  Sliders,
  Database
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Cookie Policy | SponFy",
  description: "Understand how SponFy uses cookies and local browser storage to secure organizer accounts and deliver sponsorship intelligence.",
};

export default function CookiePolicyPage() {
  const lastUpdated = "October 11, 2026";

  return (
    <div className="flex flex-col pt-24 sm:pt-28 pb-16">
      {/* Hero Header */}
      <section className="relative px-6 pb-14 border-b border-green-dark/10">
        <div className="max-w-[1040px] mx-auto text-center space-y-4">
          <h1 className="display-font text-3xl sm:text-4xl md:text-5xl font-extrabold text-green-dark tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-text-dim text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            We believe in honest, privacy-first technology. This policy details what cookies and browser storage technologies SponFy uses, why they are needed, and how you can manage them.
          </p>
          <div className="text-xs text-text-dim/80 pt-1 font-mono">
            Last Updated: <span className="font-semibold text-green-dark">{lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Key Principles Grid */}
      <section className="px-6 py-12 bg-white/60 border-b border-green-dark/10">
        <div className="max-w-[1040px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Strictly Essential Auth</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                We use secure, HTTP-only session tokens to keep your fest workspace authenticated and prevent CSRF attacks.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">Zero Ad Trackers</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                SponFy does not embed third-party advertising cookies, retargeting pixels, or data broker trackers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-green-dark/10 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-xl bg-green-dark/5 flex items-center justify-center text-green-accent">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-green-dark">User Consent Controls</h3>
              <p className="text-xs text-text-dim leading-relaxed">
                You can inspect and update your cookie choices anytime through our dedicated Consent Center.
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
              What Are Cookies & Browser Storage?
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work properly, ensure secure sessions, and preserve user preferences.
              </p>
              <p>
                In addition to cookies, SponFy utilizes modern browser storage mechanisms such as <code className="bg-green-dark/5 px-1.5 py-0.5 rounded text-green-dark font-mono text-xs">localStorage</code> and <code className="bg-green-dark/5 px-1.5 py-0.5 rounded text-green-dark font-mono text-xs">sessionStorage</code> to store user UI preferences (e.g. your customized campaign target amounts, dark/light theme options, and filter configurations) locally on your device without transmitting them across tracking networks.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">2</span>
              Categories of Cookies We Use
            </h2>
            <div className="text-sm text-text-dim space-y-4 leading-relaxed pl-10">
              <p>
                SponFy categorizes all cookies into the following functional classifications:
              </p>

              {/* Table */}
              <div className="overflow-x-auto pt-2">
                <table className="w-full text-xs text-left border border-green-dark/10 rounded-xl overflow-hidden">
                  <thead className="bg-green-dark/5 text-green-dark font-bold">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3">Lifespan</th>
                      <th className="p-3">Optional?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-dark/10 bg-white">
                    <tr>
                      <td className="p-3 font-semibold text-green-dark">Strictly Necessary</td>
                      <td className="p-3">Auth.js session tokens, CSRF protection, and OAuth verification tokens. Essential for login and workspace safety.</td>
                      <td className="p-3">Session to 30 days</td>
                      <td className="p-3 font-bold text-amber-700">Required</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-green-dark">Functionality & Preferences</td>
                      <td className="p-3">Remembers your chosen fest campaign goals, collapsed sidebar states, and table pagination settings.</td>
                      <td className="p-3">Up to 1 year</td>
                      <td className="p-3 font-bold text-green-700">Optional</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-green-dark">Telemetry & Performance</td>
                      <td className="p-3">Aggregated conversion metrics, API error reporting, and system load diagnostics to prevent downtime.</td>
                      <td className="p-3">Up to 90 days</td>
                      <td className="p-3 font-bold text-green-700">Optional</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">3</span>
              Third-Party Services & Integrations
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                When you connect third-party platforms to SponFy (such as Google OAuth for Gmail integration), those providers may set their own authentication cookies according to their policies:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-green-dark">Google OAuth:</strong> Facilitates secure single sign-on and Gmail sending permissions. Governed by Google's Privacy Policy.
                </li>
                <li>
                  <strong className="text-green-dark">Neon PostgreSQL:</strong> Encrypted backend persistence for fest campaigns and sponsor dossiers.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">4</span>
              How Can You Manage & Revoke Consent?
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                You have full control over non-essential cookies and local data storage. You can:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Visit our interactive <Link href="/consent" className="text-green-dark underline font-bold">Consent Preferences Center</Link> to toggle non-essential cookies on or off at any time.
                </li>
                <li>
                  Clear cookies and local storage directly from your browser settings (Chrome, Safari, Firefox, Edge).
                </li>
                <li>
                  Enable Global Privacy Control (GPC) or Do Not Track (DNT) in your browser, which our consent engine honors automatically.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 5 */}
          <div className="space-y-4">
            <h2 className="display-font text-xl sm:text-2xl font-bold text-green-dark flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-green-dark text-butter-cream text-xs flex items-center justify-center font-mono">5</span>
              Contact Information
            </h2>
            <div className="text-sm text-text-dim space-y-3 leading-relaxed pl-10">
              <p>
                If you have questions regarding this Cookie Policy or our data storage practices, please contact our team:
              </p>
              <div className="p-5 rounded-2xl bg-white border border-green-dark/10 space-y-1">
                <div className="font-bold text-green-dark">SponFy Privacy & Data Protection Desk</div>
                <div className="text-xs text-text-dim">Email: <a href="mailto:privacy@sponfy.com" className="text-green-dark underline font-medium">privacy@sponfy.com</a></div>
                <div className="text-xs text-text-dim">Location: Bengaluru, Karnataka, India</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Bottom CTA / Action Strip */}
      <section className="px-6 pt-12 border-t border-green-dark/10">
        <div className="max-w-[840px] mx-auto p-8 rounded-3xl bg-green-dark text-butter-cream flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="display-font text-xl font-bold text-butter-cream">
              Manage your cookie preferences
            </h4>
            <p className="text-xs text-text-onDarkSub/80 max-w-md">
              Review active consent categories, customize your privacy choices, or reset stored tokens.
            </p>
          </div>
          <Link href="/consent">
            <Button variant="butter" size="md" className="font-bold shrink-0">
              Open Consent Center
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
