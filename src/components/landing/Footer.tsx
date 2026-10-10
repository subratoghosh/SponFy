import React from "react";
import Link from "next/link";
import { Sparkles, Heart } from "lucide-react";

import { SponfyBrand } from "@/components/ui/SponfyBrand";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-butter-bg border-t border-green-dark/12 pt-16 pb-12 text-text-dim">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-green-dark/10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <SponfyBrand href="/" size="md" theme="light" />
            <p className="text-xs sm:text-sm text-text-dim leading-relaxed">
              The AI sponsorship operating system for college fests, hackathons, and student communities.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-green-dark uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#workflow" className="hover:text-green-dark transition-colors">
                  Workflow Engine
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-green-dark transition-colors">
                  Sponsor Dossiers
                </a>
              </li>
              <li>
                <a href="#intelligence" className="hover:text-green-dark transition-colors">
                  Reply Intelligence
                </a>
              </li>
              <li>
                <a href="#analytics" className="hover:text-green-dark transition-colors">
                  Funnel Analytics
                </a>
              </li>
            </ul>
          </div>

          {/* Event Formats */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-green-dark uppercase tracking-wider">
              Event Types
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/app" className="hover:text-green-dark transition-colors">
                  College Hackathons
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-green-dark transition-colors">
                  Cultural & Tech Fests
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-green-dark transition-colors">
                  Student Clubs & Chapters
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-green-dark transition-colors">
                  Entrepreneurship Summits
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-green-dark uppercase tracking-wider">
              Safety & Ethics
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#faq" className="hover:text-green-dark transition-colors">
                  Human Approval Gate
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-green-dark transition-colors">
                  No Email Hallucinations
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-green-dark transition-colors">
                  Gmail OAuth Security
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-green-dark transition-colors">
                  Do Not Contact List
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© 2026 SponFy. Built for student organizers across India.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for campus communities.
          </p>
        </div>
      </div>
    </footer>
  );
};
