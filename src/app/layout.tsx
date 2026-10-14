import type { Metadata } from "next";
import { Fraunces, Outfit, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["700"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "600", "700"],
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["700"],
});

export const metadata: Metadata = {
  title: {
    default: "SponFy — AI Sponsorship Operating System",
    template: "%s | SponFy",
  },
  description:
    "Find, research and win sponsors for campaigns, conferences, summits, and organizations — with AI that asks before it sends.",
  keywords: ["sponsorship", "campaign", "events", "conferences", "AI outreach", "brand partnerships", "sponsor research", "SponFy"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "SponFy — AI Sponsorship Operating System",
    description: "Find, research and win event sponsors with explainable AI and human-approved outreach.",
    type: "website",
    siteName: "SponFy",
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} ${jakarta.variable} ${space.variable}`}
    >
      <body className="min-h-screen bg-butter-bg text-text-main selection:bg-butter-cream selection:text-green-dark">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
