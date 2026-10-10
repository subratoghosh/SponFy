"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Building2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SponfyBrand } from "@/components/ui/SponfyBrand";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg("Please enter both your email address and password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg("Invalid credentials. Please verify your email and password.");
        setLoading(false);
      } else {
        router.push("/app");
        router.refresh();
      }
    } catch {
      setErrorMsg("Sign in attempt failed. Please try again or use Demo Mode.");
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setErrorMsg(null);
    setSocialLoading(provider);
    try {
      await signIn(provider, { callbackUrl: "/app" });
    } catch {
      setErrorMsg(`Failed to connect with ${provider}. Please try email login.`);
      setSocialLoading(null);
    }
  };

  const handleDemoBypass = async () => {
    setLoading(true);
    try {
      await signIn("credentials", {
        email: "demo@sponfy.dev",
        password: "demo-password-123",
        redirect: false,
      });
      router.push("/app");
      router.refresh();
    } catch {
      router.push("/app");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-butter-bg flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 text-green-dark selection:bg-butter-cream">
      {/* Landscape Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-green-dark/15 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Brand Narrative & Fest Highlights (Landscape Accent Pane) */}
        <div className="md:col-span-5 bg-green-dark text-butter-cream p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glow Blobs */}
          <div className="absolute top-[-20%] left-[-20%] w-[260px] h-[260px] rounded-full bg-butter-cream/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[260px] h-[260px] rounded-full bg-green-light/20 blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-6">
            <SponfyBrand href="/" size="md" theme="dark" />

            <div className="space-y-3 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-butter-cream/15 text-butter-cream text-[11px] font-bold tracking-wider uppercase border border-butter-cream/25">
                <Sparkles className="w-3.5 h-3.5 text-butter-gold" />
                Campus Sponsorship OS
              </div>
              <h1 className="display-font text-2xl sm:text-3xl font-extrabold text-butter-cream leading-tight">
                Land high-value sponsors for your fest.
              </h1>
              <p className="text-xs sm:text-sm text-text-onDarkSub/80 leading-relaxed">
                Automate brand discovery, verify CSR grants, and dispatch human-approved pitches via your official college Gmail.
              </p>
            </div>

            {/* Feature Checkpoints */}
            <div className="space-y-2.5 pt-2 text-xs text-text-onDarkSub/90">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero hallucinated company contact emails</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strict Human Approval Gate before every send</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Realtime thread reply sentiment parser</span>
              </div>
            </div>
          </div>

          {/* Bottom Demo Tip Banner */}
          <div className="relative z-10 pt-8 mt-6 border-t border-green-mid/40">
            <div className="p-3.5 rounded-2xl bg-green-deep/70 border border-green-mid/50 text-[11px] text-text-onDarkSub/80 space-y-1">
              <div className="font-bold text-butter-cream flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-butter-gold" />
                Organizer Test Credentials:
              </div>
              <div>Email: <code className="text-butter-cream font-mono">admin@sponfy.dev</code></div>
              <div>Password: <code className="text-butter-cream font-mono">admin123</code></div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form Card */}
        <div className="md:col-span-7 bg-white p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="heading-font font-black text-2xl sm:text-3xl text-green-dark">
              Sign In to SponFy
            </h2>
            <p className="text-xs sm:text-sm text-text-dim mt-1">
              Access your college festival workspace, dossiers, and outreach queues.
            </p>
          </div>

          {/* Registration Success Banner */}
          {registered && !errorMsg && (
            <div className="p-3.5 rounded-xl bg-green-50 border border-green-300 text-green-900 text-xs flex items-center gap-2.5 animate-fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
              <div>
                <span className="font-bold block">Account created successfully!</span>
                <span className="text-[11px] text-green-800">Please enter your password below to sign in to your festival workspace.</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* OAuth Social Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Google Login */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("google")}
              disabled={Boolean(socialLoading) || loading}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-green-dark/15 hover:border-green-dark/30 hover:bg-butter-panel text-xs font-bold text-green-dark transition-all duration-150 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{socialLoading === "google" ? "Connecting..." : "Google Account"}</span>
            </button>

            {/* GitHub Login */}
            <button
              type="button"
              onClick={() => handleOAuthLogin("github")}
              disabled={Boolean(socialLoading) || loading}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-green-dark/15 hover:border-green-dark/30 hover:bg-butter-panel text-xs font-bold text-green-dark transition-all duration-150 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>{socialLoading === "github" ? "Connecting..." : "GitHub Account"}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-green-dark/10 w-full" />
            <span className="bg-white px-3 text-[10px] font-bold text-text-muted uppercase tracking-widest absolute">
              Or Sign In with Email
            </span>
          </div>

          {/* Credentials Email & Password Form (No Placeholders) */}
          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <Input
              label="Organizer Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-dim tracking-wide uppercase">
                  Password
                </label>
                <Link
                  href="/faq"
                  className="text-[11px] text-green-accent font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white text-green-dark text-sm rounded-xl border border-green-dark/20 focus:border-green-dark focus:ring-2 focus:ring-butter-cream/60 outline-none transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-green-dark"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="green"
              loading={loading}
              className="w-full font-bold shadow-sm justify-center text-sm py-2.5"
            >
              Sign In to Workspace
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* 1-Click Fast Instant Demo Mode */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoBypass}
              className="w-full py-2.5 px-4 rounded-xl bg-butter-panel border border-butter-gold/80 hover:bg-butter-warm/80 text-green-dark text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-2xs group cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-green-mid" />
              <span>Instant Demo Mode (Preloaded 24 Sponsors)</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Switch to Signup */}
          <div className="pt-3 border-t border-green-dark/10 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-2">
            <span>Don't have an organizer account?</span>
            <Link
              href="/signup"
              className="font-bold text-green-dark hover:underline flex items-center gap-1"
            >
              Register your Fest Workspace <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-butter-bg flex items-center justify-center text-green-dark font-bold">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
