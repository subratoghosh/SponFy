"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { SponfyBrand } from "@/components/ui/SponfyBrand";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      router.push("/app");
    }, 400);
  };

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMagicSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-butter-bg flex flex-col justify-center items-center p-6 text-green-dark selection:bg-butter-cream">
      {/* Brand Header */}
      <div className="mb-8">
        <SponfyBrand href="/" size="lg" theme="light" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-green-dark/12 shadow-xl space-y-6">
        <div className="text-center">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-green-dark mb-2">
            Welcome to SponFy
          </h2>
          <p className="text-xs sm:text-sm text-text-dim">
            Log in to manage your sponsorship pipeline, research, and outreach.
          </p>
        </div>

        {/* 1-Click Fast Demo Login */}
        <div className="p-4 bg-butter-panel rounded-2xl border border-butter-gold/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-green-dark uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-green-mid" /> Instant Demo Access
          </div>
          <p className="text-xs text-text-dim leading-relaxed">
            Experience the full SponFy OS preloaded with 24 Indian hackathon sponsor leads ("SponFy Hackathon 2026").
          </p>
          <Button
            variant="butter"
            onClick={handleDemoLogin}
            loading={loading}
            className="w-full font-bold shadow-md"
          >
            Enter Demo Workspace <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-green-dark/10 w-full" />
          <span className="bg-white px-3 text-[11px] font-bold text-text-muted uppercase tracking-widest absolute">
            Or Sign in with Email
          </span>
        </div>

        {magicSent ? (
          <div className="p-4 bg-green-50 rounded-2xl border border-green-200 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-green-600 mx-auto" />
            <h3 className="font-bold text-sm text-green-900">Check your inbox</h3>
            <p className="text-xs text-green-800">
              We sent a secure magic link to <strong>{email}</strong>. Click it to log in.
            </p>
            <Button
              variant="glass"
              size="sm"
              onClick={() => router.push("/app")}
              className="mt-2 text-xs font-bold"
            >
              Continue to Dashboard anyway
            </Button>
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <Input
              label="Organizer Email"
              type="email"
              placeholder="organizer@yourcollege.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              variant="green"
              loading={loading}
              className="w-full font-bold shadow-sm"
            >
              Send Magic Link
            </Button>
          </form>
        )}

        <div className="pt-4 border-t border-green-dark/10 text-center text-xs text-text-muted">
          By signing in, you agree to SponFy's{" "}
          <Link href="/" className="underline hover:text-green-dark">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/" className="underline hover:text-green-dark">
            Privacy Policy
          </Link>.
        </div>
      </div>
    </div>
  );
}
