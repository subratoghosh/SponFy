import React from "react";
import Link from "next/link";
import { Campaign } from "@/types";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";
import { FolderKanban, Users, MapPin, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-green-dark/12 shadow-sm feature-card-interactive flex flex-col justify-between space-y-5">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-butter-warm flex items-center justify-center text-green-dark font-bold border border-green-dark/10">
            <FolderKanban className="w-6 h-6" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-300">
            {campaign.status === "active" ? "Active" : "Archived"}
          </span>
        </div>

        <h3 className="font-heading font-extrabold text-xl text-green-dark mb-1">
          {campaign.name}
        </h3>
        <p className="text-xs text-text-dim mb-4 leading-relaxed line-clamp-2">
          {campaign.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs p-3.5 bg-butter-panel rounded-2xl border border-green-dark/8 mb-4">
          <div>
            <span className="text-text-muted font-medium block">Audience:</span>
            <span className="font-bold text-green-dark flex items-center gap-1 mt-0.5">
              <Users className="w-3.5 h-3.5" /> {formatNumber(campaign.audienceSize)} Students
            </span>
          </div>
          <div>
            <span className="text-text-muted font-medium block">Location:</span>
            <span className="font-bold text-green-dark flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" /> {campaign.location}
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-green-dark/6">
            <span className="text-text-muted font-medium block">Target Goal:</span>
            <span className="stat-font text-base font-extrabold text-green-800">
              {formatCurrencyINR(campaign.targetAmount)}
            </span>
          </div>
        </div>

        {/* Industry Tags */}
        <div className="flex flex-wrap gap-1.5">
          {campaign.preferredIndustries.map((ind) => (
            <span
              key={ind}
              className="text-[11px] font-semibold bg-butter-bg text-green-dark px-2.5 py-0.5 rounded-md border border-green-dark/8"
            >
              {ind}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-green-dark/10 flex items-center justify-between">
        {campaign.deckUrl ? (
          <a
            href={campaign.deckUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-text-dim hover:text-green-dark flex items-center gap-1"
          >
            Brochure Deck <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-xs text-text-muted">No deck uploaded</span>
        )}

        <Link href="/app/sponsors">
          <Button variant="green" size="sm" className="text-xs font-bold shadow-sm">
            View Pipeline <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
