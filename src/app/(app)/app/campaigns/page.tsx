"use client";

import React, { useState, useEffect } from "react";
import { CampaignCard } from "@/components/campaigns/CampaignCard";
import { CreateCampaignModal } from "@/components/campaigns/CreateCampaignModal";
import { getCampaigns } from "@/lib/data/repositories/campaigns";
import { Campaign } from "@/types";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = () => {
    getCampaigns().then(setCampaigns);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-green-dark">
            Campaigns
          </h1>
          <p className="text-xs sm:text-sm text-text-dim mt-0.5">
            Manage your campus fest, hackathon, and student club sponsorship initiatives.
          </p>
        </div>
        <Button
          variant="butter"
          size="sm"
          onClick={() => setModalOpen(true)}
          className="font-bold shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 mr-1" /> New Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <CampaignCard key={camp.id} campaign={camp} />
        ))}
      </div>

      {/* Creation Wizard Dialog */}
      <CreateCampaignModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={loadData}
      />
    </div>
  );
}
