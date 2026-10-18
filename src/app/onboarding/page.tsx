"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User as UserIcon,
  Building2,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Phone,
  Briefcase,
  GraduationCap,
  Layers,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<"USER" | "ORGANISER" | "EXECUTIVE">("USER");

  // Step 1 Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [collegeOrCompany, setCollegeOrCompany] = useState("");
  const [department, setDepartment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/onboarding/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.profile) {
          if (data.profile.name) setName((prev) => prev || data.profile.name);
          if (data.profile.phone) setPhone((prev) => prev || data.profile.phone);
          if (data.profile.designation) setDesignation((prev) => prev || data.profile.designation);
          if (data.profile.collegeOrCompany) setCollegeOrCompany((prev) => prev || data.profile.collegeOrCompany);
          if (data.profile.department) setDepartment((prev) => prev || data.profile.department);
          if (data.profile.onboardingStatus === "DETAILS_DONE") {
            setStep(2);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session?.user) {
      if (session.user.role !== "ADMIN") {
        if (session.user.onboardingStatus === "COMPLETE") {
          router.replace("/app");
          return;
        }
        if (session.user.onboardingStatus === "PENDING_APPROVAL") {
          router.replace("/onboarding/pending");
          return;
        }
      }

      if (session.user.name && !name) {
        setName(session.user.name);
      }

      if (session.user.onboardingStatus === "DETAILS_DONE") {
        setStep(2);
      }
    }
  }, [session, name, router]);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!phone.trim() || phone.trim().length < 5) errs.phone = "Valid phone number is required";
    if (!designation.trim()) errs.designation = "Designation/title is required";
    if (!collegeOrCompany.trim()) errs.collegeOrCompany = "College or company name is required";
    if (!department.trim()) errs.department = "Department is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateStep1()) {
      toast("Please fill in all profile fields before continuing.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          designation: designation.trim(),
          collegeOrCompany: collegeOrCompany.trim(),
          department: department.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile details.");
      }

      toast("Your basic profile has been updated.", "success");
      try {
        await update?.();
      } catch {}
      setStep(2);
    } catch (err: any) {
      const msg = err.message || "Failed to save details. Please try again.";
      setServerError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModeAndProceed = async (mode: "USER" | "ORGANISER" | "EXECUTIVE") => {
    setServerError(null);

    if (mode === "ORGANISER") {
      router.push("/onboarding/organiser");
      return;
    }

    if (mode === "EXECUTIVE") {
      router.push("/onboarding/executive");
      return;
    }

    // mode === "USER"
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "USER" }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to set workspace mode.");
      }

      toast("Your individual workspace is ready.", "success");
      try {
        await update?.();
      } catch {}
      window.location.href = data.redirectUrl || "/app";
    } catch (err: any) {
      const msg = err.message || "Failed to complete onboarding.";
      setServerError(msg);
      toast(msg, "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-butter-bg flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 text-green-dark selection:bg-butter-cream">
      {/* Brand Header */}
      <div className="w-full max-w-3xl mb-6 flex items-center justify-between">
        <SponfyBrand href="/" size="md" theme="light" />

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 1
                  ? "bg-green-dark text-butter-cream ring-4 ring-green-dark/10"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
            </span>
            <span className="text-xs font-bold text-green-dark hidden sm:inline">Details</span>
          </div>
          <div className="w-8 h-0.5 bg-green-dark/15" />
          <div className="flex items-center gap-1.5">
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 2
                  ? "bg-green-dark text-butter-cream ring-4 ring-green-dark/10"
                  : "bg-white text-text-muted border border-green-dark/20"
              }`}
            >
              2
            </span>
            <span className="text-xs font-bold text-green-dark hidden sm:inline">Workspace Mode</span>
          </div>
        </div>
      </div>

      {/* Main Centered Card */}
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-green-dark/15 shadow-2xl overflow-hidden p-6 sm:p-10 transition-all duration-300">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-butter-cream/60 border border-green-dark/10 text-xs font-bold text-green-dark mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Step 1 of 2: Profile Setup
              </div>
              <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark tracking-tight">
                Let's set up your profile
              </h1>
              <p className="text-xs sm:text-sm text-text-dim mt-1.5">
                We'll use these details on your official sponsor pitches, verification credentials, and outreach emails.
              </p>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Full Name"
                    placeholder="e.g. Sneha Roy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Input
                    label="Phone Number"
                    placeholder="+91 98765 43210"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Designation / Role"
                    placeholder="e.g. Sponsorship Lead / Convenor"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    required
                  />
                  {errors.designation && (
                    <p className="text-xs text-red-600 mt-1">{errors.designation}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="College / Company Name"
                    placeholder="e.g. IIT Bombay / Acme Corp"
                    value={collegeOrCompany}
                    onChange={(e) => setCollegeOrCompany(e.target.value)}
                    required
                  />
                  {errors.collegeOrCompany && (
                    <p className="text-xs text-red-600 mt-1">{errors.collegeOrCompany}</p>
                  )}
                </div>
              </div>

              <div>
                <Input
                  label="Department / Vertical"
                  placeholder="e.g. Corporate Relations / Marketing / Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
                {errors.department && (
                  <p className="text-xs text-red-600 mt-1">{errors.department}</p>
                )}
              </div>

              <div className="pt-4 flex flex-col items-end gap-3">
                <Button
                  type="submit"
                  variant="green"
                  loading={loading}
                  disabled={loading}
                  className="px-6 py-2.5 font-black uppercase tracking-wider text-xs sm:text-sm"
                >
                  Continue to Workspace Mode
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                {serverError && (
                  <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2.5 animate-fade-in shadow-sm">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-red-800">Unable to save profile</p>
                      <p className="mt-0.5 text-red-600 leading-relaxed">{serverError}</p>
                      {serverError.toLowerCase().includes("sign in") && (
                        <a
                          href="/login"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-red-800 underline hover:text-red-950"
                        >
                          Go to Sign In &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Top Back Button */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-green-dark transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Details
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-butter-cream/60 border border-green-dark/10 text-xs font-bold text-green-dark">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                Step 2 of 2: Role & Mode
              </div>
            </div>

            <div>
              <h1 className="heading-font font-black text-2xl sm:text-3xl text-green-dark tracking-tight">
                Choose your workspace mode
              </h1>
              <p className="text-xs sm:text-sm text-text-dim mt-1.5">
                Pick the mode that best fits your workflow. You can run individual campaigns or collaborate with an organisation team.
              </p>
            </div>

            {/* 3 Large Selectable Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Option 1: User (Individual) */}
              <div
                onClick={() => setSelectedMode("USER")}
                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedMode === "USER"
                    ? "border-green-dark bg-butter-cream/30 shadow-md ring-2 ring-green-dark/10"
                    : "border-green-dark/15 hover:border-green-dark/40 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Individual
                    </span>
                  </div>

                  <h3 className="font-black text-base text-green-dark">User</h3>
                  <p className="text-xs font-semibold text-green-dark/90 mt-1">
                    Run your own sponsorship workspace.
                  </p>
                  <p className="text-[11px] text-text-dim mt-2 leading-relaxed">
                    Own personal campaigns, discover companies, and execute private outreach independently.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-green-dark/10">
                  <Button
                    type="button"
                    variant={selectedMode === "USER" ? "green" : "secondary"}
                    loading={loading && selectedMode === "USER"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectModeAndProceed("USER");
                    }}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Enter Workspace
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>

              {/* Option 2: Organiser */}
              <div
                onClick={() => setSelectedMode("ORGANISER")}
                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedMode === "ORGANISER"
                    ? "border-green-dark bg-butter-cream/30 shadow-md ring-2 ring-green-dark/10"
                    : "border-green-dark/15 hover:border-green-dark/40 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      Organisation
                    </span>
                  </div>

                  <h3 className="font-black text-base text-green-dark">Organiser</h3>
                  <p className="text-xs font-semibold text-green-dark/90 mt-1">
                    Own and run campaigns for an organisation.
                  </p>
                  <p className="text-[11px] text-text-dim mt-2 leading-relaxed">
                    Set up your college club or fest organisation, invite team executives, and manage shared targets.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-green-dark/10">
                  <Button
                    type="button"
                    variant={selectedMode === "ORGANISER" ? "green" : "secondary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectModeAndProceed("ORGANISER");
                    }}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Set Up Organisation
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>

              {/* Option 3: Executive */}
              <div
                onClick={() => setSelectedMode("EXECUTIVE")}
                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedMode === "EXECUTIVE"
                    ? "border-green-dark bg-butter-cream/30 shadow-md ring-2 ring-green-dark/10"
                    : "border-green-dark/15 hover:border-green-dark/40 bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Team Member
                    </span>
                  </div>

                  <h3 className="font-black text-base text-green-dark">Executive</h3>
                  <p className="text-xs font-semibold text-green-dark/90 mt-1">
                    Join an organiser's team and help run outreach.
                  </p>
                  <p className="text-[11px] text-text-dim mt-2 leading-relaxed">
                    Request access to your organisation's active campaigns and send approved sponsor drafts.
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-green-dark/10">
                  <Button
                    type="button"
                    variant={selectedMode === "EXECUTIVE" ? "green" : "secondary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectModeAndProceed("EXECUTIVE");
                    }}
                    className="w-full text-xs font-bold justify-center"
                  >
                    Join Team
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </div>
            </div>

            {serverError && (
              <div className="w-full p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-start gap-2.5 animate-fade-in shadow-sm">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-red-800">Unable to enter workspace</p>
                  <p className="mt-0.5 text-red-600 leading-relaxed">{serverError}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
