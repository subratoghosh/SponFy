import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit, Plus_Jakarta_Sans, Space_Grotesk, Roboto_Slab, Inter } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0C382E",
  colorScheme: "light",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
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

import { getSiteUrl, siteConfig } from "@/lib/config/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "SponFy — AI Sponsorship Operating System",
    template: "%s | SponFy",
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "SponFy Team", url: getSiteUrl() }],
  creator: siteConfig.creator,
  publisher: "SponFy",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "SponFy",
    statusBarStyle: "black-translucent",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "SponFy — AI Sponsorship Operating System",
    description: siteConfig.shortDescription,
    url: getSiteUrl(),
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "SponFy — AI Sponsorship Operating System",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "SponFy — AI Sponsorship Operating System",
    description: siteConfig.shortDescription,
    creator: siteConfig.creator,
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { OfflineScreen } from "@/components/ui/OfflineScreen";
import { PwaRegister } from "@/components/ui/PwaRegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${robotoSlab.variable} ${fraunces.variable} ${outfit.variable} ${jakarta.variable} ${space.variable}`}
    >
      <body className="min-h-screen bg-butter-bg text-text-main selection:bg-butter-cream selection:text-green-dark">
        <AuthProvider>
          {children}
          <SplashScreen />
          <OfflineScreen />
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
