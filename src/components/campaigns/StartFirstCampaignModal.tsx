"use client";

import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { TARGET_INDUSTRIES } from "@/lib/config/constants";
import { createCampaign } from "@/lib/data/repositories/campaigns";
import { useToast } from "@/components/ui/toast";
import { Sparkles, Rocket, Target, Users, MapPin, IndianRupee, Layers, Check } from "lucide-react";
import { Campaign } from "@/types";

interface StartFirstCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (campaign: Campaign) => void;
}

export const StartFirstCampaignModal: React.FC<StartFirstCampaignModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    eventType: "Hackathon / Competition",
    audienceSize: 500,
    location: "India / Hybrid",
    targetAmount: 250000,
    preferredIndustries: ["Developer Tools", "AI & Machine Learning", "Fintech & Payments"] as string[],
    description: "",
  });

  const toggleIndustry = (ind: string) => {
    setFormData((prev) => {
      const exists = prev.preferredIndustries.includes(ind);
      return {
        ...prev,
        preferredIndustries: exists
          ? prev.preferredIndustries.filter((i) => i !== ind)
          : [...prev.preferredIndustries, ind],
      };
    });
  };

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    if (!cleanName) {
      toast("Please enter a campaign name.", "error");
      return;
    }

    setLoading(true);
    try {
      const created = await createCampaign({
        name: cleanName,
        eventType: formData.eventType,
        audienceSize: Number(formData.audienceSize) || 500,
        location: formData.location.trim() || "Virtual / India",
        targetAmount: Number(formData.targetAmount) || 200000,
        preferredIndustries:
          formData.preferredIndustries.length > 0
            ? formData.preferredIndustries
            : ["Developer Tools", "AI & Machine Learning"],
        description:
          formData.description.trim() ||
          `Official ${cleanName} flagship initiative seeking strategic brand and developer partnerships.`,
        status: "active",
        tiers: [
          {
            name: "Title Partner",
            amount: Math.round(Number(formData.targetAmount || 200000) * 0.5),
            slots: 1,
            deliverables: ["Keynote Address", "Top Branding", "Exclusive Recruitment Track"],
          },
          {
            name: "Gold Partner",
            amount: Math.round(Number(formData.targetAmount || 200000) * 0.25),
            slots: 2,
            deliverables: ["Workshop / Booth", "Branded Challenge Track", "Attendee Database"],
          },
          {
            name: "Silver Partner",
            amount: Math.round(Number(formData.targetAmount || 200000) * 0.12),
            slots: 4,
            deliverables: ["Logo on Collateral", "Digital Swag Kit", "Social Announcements"],
          },
        ],
      });

      toast(`Campaign "${created.name}" launched successfully!`, "success");
      if (onCreated) {
        onCreated(created);
      }
      onClose();
    } catch (err: any) {
      toast(err?.message || "Failed to launch campaign. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg">
      <form onSubmit={handleLaunch} className="space-y-6">
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-dark to-green-mid p-6 text-white shadow-lg">
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-butter-cream text-[11px] font-bold tracking-wide uppercase mb-2">
                <Sparkles className="w-3.5 h-3.5 text-butter-sunshine animate-pulse" />
                <span>Welcome to SponFy</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-butter-cream tracking-tight">
                Start Your First Campaign
              </h2>
              <p className="text-xs sm:text-sm text-butter-cream/80 mt-1 max-w-md">
                Set up your event or initiative to immediately begin discovering high-fit sponsors, automating email pitches, and securing partnerships.
              </p>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shrink-0 hidden sm:flex items-center justify-center">
              <Rocket className="w-8 h-8 text-butter-sunshine" />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Campaign Name */}
          <div>
            <label className="text-xs font-bold text-green-dark flex items-center gap-1.5 mb-1.5">
              <Target className="w-3.5 h-3.5 text-green-mid" />
              Campaign / Event Name <span className="text-rose-600">*</span>
            </label>
            <Input
              required
              autoFocus
              placeholder="e.g. SponFy Hackathon 2026, TechX Summit, AI Days"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white border-green-dark/20 text-green-dark font-medium placeholder:text-text-muted/60"
            />
          </div>

          {/* Grid: Event Type & Target Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-green-dark flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-green-mid" />
                Event / Initiative Type
              </label>
              <Select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="bg-white border-green-dark/20 text-green-dark"
              >
                <option value="Hackathon / Competition">Hackathon / Competition</option>
                <option value="Tech Conference & Summit">Tech Conference & Summit</option>
                <option value="College & University Fest">College & University Fest</option>
                <option value="Developer Meetup / Community">Developer Meetup / Community</option>
                <option value="Webinar / Online Series">Webinar / Online Series</option>
                <option value="Sports & Esports Tournament">Sports & Esports Tournament</option>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-green-dark flex items-center gap-1.5 mb-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-green-mid" />
                Target Sponsorship Goal (₹)
              </label>
              <Input
                type="number"
                min={10000}
                step={5000}
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                className="bg-white border-green-dark/20 text-green-dark font-mono font-semibold"
              />
            </div>
          </div>

          {/* Grid: Audience Size & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-green-dark flex items-center gap-1.5 mb-1.5">
                <Users className="w-3.5 h-3.5 text-green-mid" />
                Expected Attendees / Reach
              </label>
              <Input
                type="number"
                min={50}
                step={50}
                value={formData.audienceSize}
                onChange={(e) => setFormData({ ...formData, audienceSize: Number(e.target.value) })}
                className="bg-white border-green-dark/20 text-green-dark font-mono font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-green-dark flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-green-mid" />
                Location / Format
              </label>
              <Input
                placeholder="e.g. Surat, Gujarat / Virtual"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-white border-green-dark/20 text-green-dark"
              />
            </div>
          </div>

          {/* Target Industries */}
          <div>
            <label className="text-xs font-bold text-green-dark block mb-1.5">
              Target Sponsor Sectors (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_INDUSTRIES.map((ind) => {
                const isSelected = formData.preferredIndustries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-green-dark text-butter-cream border-green-dark shadow-sm"
                        : "bg-white text-text-dim border-green-dark/15 hover:border-green-dark/40"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-butter-sunshine shrink-0" />}
                    <span>{ind}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Brief Description */}
          <div>
            <label className="text-xs font-bold text-green-dark block mb-1.5">
              Short Description / Value Proposition (Optional)
            </label>
            <Textarea
              rows={2}
              placeholder="e.g. 36-hour premier national hackathon bringing together 800 top student engineers across Western India..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-white border-green-dark/20 text-green-dark text-xs"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-green-dark/10 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer"
          >
            Decide Later
          </Button>
          <Button
            type="submit"
            variant="butter"
            size="sm"
            loading={loading}
            className="font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Rocket className="w-3.5 h-3.5 mr-1" />
            Launch Campaign & Open Workspace
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
