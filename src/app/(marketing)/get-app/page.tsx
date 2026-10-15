import React from "react";
import { Monitor, Smartphone, Apple, Globe } from "lucide-react";
import { InstallAppButton } from "@/components/ui/InstallAppButton";

export const metadata = {
  title: "Get the App | SponFy",
  description:
    "Install SponFy on your computer or phone. It opens in its own window, works offline, and always stays up to date.",
};

const PLATFORMS = [
  {
    icon: Monitor,
    title: "Windows or Mac (Edge / Chrome)",
    steps: [
      "Open sponfy.vercel.app in Edge or Chrome.",
      "Click the install icon at the right end of the address bar, or open the browser menu.",
      "Choose Install SponFy (Edge: Apps, then Install this site as an app).",
    ],
  },
  {
    icon: Smartphone,
    title: "Android (Chrome)",
    steps: [
      "Open sponfy.vercel.app in Chrome.",
      "Tap the three-dot menu.",
      "Tap Install app (or Add to Home screen).",
    ],
  },
  {
    icon: Apple,
    title: "iPhone or iPad (Safari)",
    steps: [
      "Open sponfy.vercel.app in Safari.",
      "Tap the Share button.",
      "Tap Add to Home Screen, then Add.",
    ],
  },
];

export default function GetAppPage() {
  return (
    <div className="flex flex-col pt-16 md:pt-20">
      <section className="py-16 sm:py-20 bg-butter-bg">
        <div className="max-w-[1000px] mx-auto px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-dark/5 text-green-dark text-xs font-bold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            Install SponFy
          </div>
          <h1 className="display-font text-3xl sm:text-5xl font-bold text-green-dark">
            Get the SponFy app
          </h1>
          <p className="text-text-dim text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Opens in its own window, launches from your home screen or Start menu,
            shows an offline screen when you lose connection, and updates itself
            whenever we ship something new.
          </p>
          <div className="flex justify-center">
            <InstallAppButton
              alwaysShow
              label="Install SponFy"
              fallbackHref="#how-to-install"
              className="!bg-green-dark !text-butter-cream !px-6 !py-3 !text-sm sm:!text-base"
            />
          </div>
          <p className="text-xs text-text-muted">
            If nothing pops up, SponFy may already be installed on this device (check your Start menu or home screen), or your browser needs the manual steps below.
          </p>
        </div>
      </section>

      <section
        id="how-to-install"
        className="pb-20 bg-butter-bg scroll-mt-24"
      >
        <div className="max-w-[1000px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLATFORMS.map(({ icon: Icon, title, steps }) => (
            <div
              key={title}
              className="p-6 bg-white rounded-3xl border border-green-dark/12 shadow-sm space-y-4"
            >
              <div className="w-10 h-10 rounded-full bg-butter-cream flex items-center justify-center text-green-dark">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="font-heading font-extrabold text-base text-green-dark">
                {title}
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-text-dim leading-relaxed">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
