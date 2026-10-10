import React from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { MarketingMobileNav } from "@/components/landing/MarketingMobileNav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-butter-bg text-text-main flex flex-col pb-20 md:pb-0">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MarketingMobileNav />
    </div>
  );
}
