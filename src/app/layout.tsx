import type { Metadata } from "next";
import { Fraunces, Outfit, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["700", "800", "900"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "SponFy — AI Sponsorship Operating System",
    template: "%s | SponFy",
  },
  description:
    "Find, research and win event sponsors for college fests, hackathons, and student communities — with AI that asks before it sends.",
  keywords: ["sponsorship", "hackathon", "college fest", "AI outreach", "student community", "sponsor research", "SponFy"],
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
        {children}
      </body>
    </html>
  );
}
