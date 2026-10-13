import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import { SponfyBrand } from "@/components/ui/SponfyBrand";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-green-dark border-t border-green-mid/40 pt-16 pb-12 text-text-onDarkSub">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-green-mid/40">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="footer-link inline-block">
              <SponfyBrand href="/" size="md" theme="dark" />
            </div>
            <p className="text-xs sm:text-sm text-text-onDarkSub/80 leading-relaxed">
              The AI sponsorship operating system for campaigns, conferences, and organizations.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="footer-social-btn group"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:scale-105"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <radialGradient id="footerIgGrad" cx="20%" cy="110%" r="120%">
                      <stop offset="0%" stopColor="#fdf497" />
                      <stop offset="15%" stopColor="#fdf497" />
                      <stop offset="45%" stopColor="#fd5949" />
                      <stop offset="60%" stopColor="#d6249f" />
                      <stop offset="90%" stopColor="#285AEB" />
                    </radialGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#footerIgGrad)" />
                  <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.5" stroke="#ffffff" strokeWidth="1.8" />
                  <circle cx="12" cy="12" r="3.7" stroke="#ffffff" strokeWidth="1.8" />
                  <circle cx="17.2" cy="6.8" r="1.1" fill="#ffffff" />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="footer-social-btn group"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:scale-105"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="24" height="24" rx="5.5" fill="#0A66C2" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7 5.5C7 6.33 6.33 7 5.5 7C4.67 7 4 6.33 4 5.5C4 4.67 4.67 4 5.5 4C6.33 4 7 4.67 7 5.5ZM4.2 8.7H6.8V19H4.2V8.7ZM10.5 8.7H12.9V10.1H12.93C13.26 9.48 14.07 8.5 15.7 8.5C18.7 8.5 19.2 10.4 19.2 13V19H16.7V13.6C16.7 12.3 16.7 10.6 14.9 10.6C13.1 10.6 12.8 12 12.8 13.5V19H10.5V8.7Z"
                    fill="white"
                  />
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="footer-social-btn group"
              >
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:scale-105"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="1.5" y="3.5" width="21" height="17" rx="5" fill="#FF0000" />
                  <path d="M10 8.2L15.5 12L10 15.8V8.2Z" fill="white" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-butter-cream uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/workflow" className="footer-link">
                  Workflow Engine
                </Link>
              </li>
              <li>
                <Link href="/showcase" className="footer-link">
                  Sponsor Dossiers
                </Link>
              </li>
              <li>
                <Link href="/intelligence" className="footer-link">
                  Reply Intelligence
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="footer-link">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Event Formats */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-butter-cream uppercase tracking-wider">
              Event Types
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/app" className="footer-link">
                  College Hackathons
                </Link>
              </li>
              <li>
                <Link href="/app" className="footer-link">
                  Conferences & Events
                </Link>
              </li>
              <li>
                <Link href="/app" className="footer-link">
                  Student Clubs & Chapters
                </Link>
              </li>
              <li>
                <Link href="/app" className="footer-link">
                  Entrepreneurship Summits
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-butter-cream uppercase tracking-wider">
              Safety & Ethics
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="footer-link">
                  Human Approval Gate
                </Link>
              </li>
              <li>
                <Link href="/faq" className="footer-link">
                  Gmail OAuth Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-onDarkSub/70">
          <p>© 2026 SponFy. Built for student organizers and campus teams.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/privacy" className="footer-link text-xs">
              Privacy Policy
            </Link>
            <span className="text-butter-cream/30 select-none">•</span>
            <Link href="/terms" className="footer-link text-xs">
              Terms of Service
            </Link>
            <span className="text-butter-cream/30 select-none">•</span>
            <p className="flex items-center gap-1">
              Crafted with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 hover:scale-125 transition-transform duration-200 cursor-pointer" /> for campus communities.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
