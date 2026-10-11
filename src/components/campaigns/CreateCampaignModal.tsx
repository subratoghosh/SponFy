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
import { ArrowRight, ArrowLeft } from "lucide-react";

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    eventType: "Hackathon",
    audienceSize: 500,
    location: "Bengaluru, India",
    targetAmount: 300000,
    preferredIndustries: ["Developer Tools", "Cloud & DevOps"],
    deckUrl: "",
    description: "",
  });

  const toggleIndustry = (ind: string) => {
    setFormData((prev) => {
      const exists = prev.preferredIndustries.includes(ind);
      if (exists) {
        return {
          ...prev,
          preferredIndustries: prev.preferredIndustries.filter((i) => i !== ind),
        };
      } else {
        return {
          ...prev,
          preferredIndustries: [...prev.preferredIndustries, ind],
        };
      }
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCampaign({
        name: formData.name || "New Fest 2026",
        eventType: formData.eventType,
        audienceSize: Number(formData.audienceSize),
        location: formData.location,
        targetAmount: Number(formData.targetAmount),
        preferredIndustries: formData.preferredIndustries,
        deckUrl: formData.deckUrl,
        description: formData.description || "Student-led fest and hackathon.",
        status: "active",
        tiers: [
          { name: "Title Partner", amount: 150000, slots: 1, deliverables: ["Keynote", "Top branding"] },
          { name: "Gold Partner", amount: 75000, slots: 3, deliverables: ["Challenge Track", "Booth"] },
          { name: "Silver Partner", amount: 40000, slots: 5, deliverables: ["Swags", "Website logo"] },
        ],
      });
      toast("Campaign created successfully!", "success");
      onCreated();
      onClose();
      setStep(1);
    } catch (err) {
      toast("Failed to create campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create New Sponsorship Campaign"
      description="Define your fest details, target audience, and sponsorship tier goals."
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Stepper Header */}
        <div className="flex items-center justify-between pb-3 border-b border-green-dark/10 text-xs font-bold text-green-dark">
          <span className={step === 1 ? "text-green-700 underline" : "text-text-muted"}>
            1. Basic Info
          </span>
          <span className={step === 2 ? "text-green-700 underline" : "text-text-muted"}>
            2. Audience & Goals
          </span>
          <span className={step === 3 ? "text-green-700 underline" : "text-text-muted"}>
            3. Target Industries
          </span>
        </div>

        {/* Step 1: Basics */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Input
              label="Campaign / Event Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Select
              label="Event Type"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            >
              <option value="Hackathon">Collegiate Hackathon</option>
              <option value="Cultural Fest">Cultural & Arts Fest</option>
              <option value="Tech Symposium">Technical Symposium</option>
              <option value="Student Club">Student Chapter / Club</option>
              <option value="Summit">E-Cell / Startup Summit</option>
            </Select>
            <Textarea
              label="Event Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        )}

        {/* Step 2: Audience & Goal */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Expected Audience Size"
                type="number"
                value={formData.audienceSize}
                onChange={(e) => setFormData({ ...formData, audienceSize: Number(e.target.value) })}
              />
              <Input
                label="Location (City, State)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <Input
              label="Total Target Sponsorship Goal (₹ INR)"
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
            />
            <Input
              label="Sponsorship Deck / Brochure PDF Link"
              value={formData.deckUrl}
              onChange={(e) => setFormData({ ...formData, deckUrl: e.target.value })}
            />
          </div>
        )}

        {/* Step 3: Industries */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-wider text-text-dim block">
              Select Preferred Sponsor Sectors:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TARGET_INDUSTRIES.map((ind) => {
                const selected = formData.preferredIndustries.includes(ind);
                return (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleIndustry(ind)}
                    className={`p-3 rounded-xl text-xs font-bold text-left border transition-all ${
                      selected
                        ? "bg-green-dark text-butter-cream border-green-mid shadow-sm"
                        : "bg-white text-green-dark border-green-dark/15 hover:bg-butter-warm/40"
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-green-dark/10 flex items-center justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="glass"
              size="sm"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button
              type="button"
              variant="green"
              size="sm"
              onClick={() => setStep(step + 1)}
            >
              Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="butter"
              size="sm"
              loading={loading}
              onClick={handleSubmit}
              className="font-bold shadow-md"
            >
              Create Campaign
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
