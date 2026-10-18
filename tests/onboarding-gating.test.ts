import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/security/auth-guard", () => ({
  requireAuth: vi.fn(),
}));

import { getHomeRouteForUser } from "@/lib/auth/roles";

describe("Onboarding Gating and Routing Rules", () => {
  it("redirects unauthenticated users to /login", () => {
    expect(getHomeRouteForUser(null)).toBe("/login");
    expect(getHomeRouteForUser({})).toBe("/login");
    expect(getHomeRouteForUser({ user: null })).toBe("/login");
  });

  it("routes ADMIN users directly to /admin", () => {
    expect(getHomeRouteForUser({ user: { role: "ADMIN", onboardingStatus: "NOT_STARTED" } })).toBe("/admin");
    expect(getHomeRouteForUser({ user: { role: "ADMIN", onboardingStatus: "COMPLETE" } })).toBe("/admin");
  });

  it("gates newly registered users with NOT_STARTED into /onboarding", () => {
    const session = {
      user: {
        id: "usr-new",
        email: "newuser@example.com",
        role: "USER",
        accountMode: "INDIVIDUAL",
        onboardingStatus: "NOT_STARTED",
      },
    };
    expect(getHomeRouteForUser(session)).toBe("/onboarding");
  });

  it("gates users with DETAILS_DONE into /onboarding (Step 2: Workspace Mode)", () => {
    const session = {
      user: {
        id: "usr-step2",
        email: "step2@example.com",
        role: "USER",
        accountMode: "INDIVIDUAL",
        onboardingStatus: "DETAILS_DONE",
      },
    };
    expect(getHomeRouteForUser(session)).toBe("/onboarding");
  });

  it("gates users with PENDING_APPROVAL into /onboarding/pending", () => {
    const session = {
      user: {
        id: "usr-pending",
        email: "pending@example.com",
        role: "USER",
        accountMode: "EXECUTIVE",
        onboardingStatus: "PENDING_APPROVAL",
      },
    };
    expect(getHomeRouteForUser(session)).toBe("/onboarding/pending");
  });

  it("allows fully onboarded COMPLETE users into /app", () => {
    const sessionUser = {
      user: {
        id: "usr-complete",
        email: "complete@example.com",
        role: "USER",
        accountMode: "INDIVIDUAL",
        onboardingStatus: "COMPLETE",
      },
    };
    expect(getHomeRouteForUser(sessionUser)).toBe("/app");

    const sessionOrg = {
      user: {
        id: "usr-org",
        email: "org@example.com",
        role: "ORGANISER",
        accountMode: "ORGANISER",
        onboardingStatus: "COMPLETE",
      },
    };
    expect(getHomeRouteForUser(sessionOrg)).toBe("/app");

    const sessionExec = {
      user: {
        id: "usr-exec",
        email: "exec@example.com",
        role: "EXECUTIVE",
        accountMode: "EXECUTIVE",
        onboardingStatus: "COMPLETE",
      },
    };
    expect(getHomeRouteForUser(sessionExec)).toBe("/app");
  });

  describe("Middleware Simulation Rules", () => {
    function simulateMiddleware(pathname: string, token: any, sessionToken: any) {
      if (token?.invalid || token?.userNotFound || (token && !token.sub)) {
        return { action: "redirect", dest: "/login?error=SessionExpired" };
      }

      if (!token && sessionToken) {
        return { action: "redirect", dest: "/login?error=SessionExpired" };
      }

      if (!token && !sessionToken) {
        return { action: "redirect", dest: `/login?callbackUrl=${pathname}` };
      }

      if (token && token.role !== "ADMIN") {
        const status = (token.onboardingStatus as string) || "NOT_STARTED";

        if (pathname.startsWith("/onboarding") && status === "COMPLETE") {
          return { action: "redirect", dest: "/app" };
        }

        if (pathname.startsWith("/app") && status !== "COMPLETE") {
          const dest = status === "PENDING_APPROVAL" ? "/onboarding/pending" : "/onboarding";
          return { action: "redirect", dest };
        }

        if (pathname.startsWith("/onboarding") && pathname !== "/onboarding/pending" && status === "PENDING_APPROVAL") {
          return { action: "redirect", dest: "/onboarding/pending" };
        }
      }

      return { action: "next" };
    }

    it("redirects NOT_STARTED user visiting /app to /onboarding", () => {
      const res = simulateMiddleware("/app", { sub: "1", role: "USER", onboardingStatus: "NOT_STARTED" }, "valid-cookie");
      expect(res).toEqual({ action: "redirect", dest: "/onboarding" });
    });

    it("redirects NOT_STARTED user visiting /app/sponsors to /onboarding", () => {
      const res = simulateMiddleware("/app/sponsors", { sub: "1", role: "USER", onboardingStatus: "NOT_STARTED" }, "valid-cookie");
      expect(res).toEqual({ action: "redirect", dest: "/onboarding" });
    });

    it("redirects DETAILS_DONE user visiting /app to /onboarding", () => {
      const res = simulateMiddleware("/app", { sub: "1", role: "USER", onboardingStatus: "DETAILS_DONE" }, "valid-cookie");
      expect(res).toEqual({ action: "redirect", dest: "/onboarding" });
    });

    it("redirects PENDING_APPROVAL user visiting /app to /onboarding/pending", () => {
      const res = simulateMiddleware("/app", { sub: "1", role: "USER", onboardingStatus: "PENDING_APPROVAL" }, "valid-cookie");
      expect(res).toEqual({ action: "redirect", dest: "/onboarding/pending" });
    });

    it("redirects PENDING_APPROVAL user visiting /onboarding to /onboarding/pending", () => {
      const res = simulateMiddleware("/onboarding", { sub: "1", role: "USER", onboardingStatus: "PENDING_APPROVAL" }, "valid-cookie");
      expect(res).toEqual({ action: "redirect", dest: "/onboarding/pending" });
    });

    it("redirects COMPLETE user visiting /onboarding back to /app", () => {
      const res = simulateMiddleware("/onboarding", { sub: "1", role: "USER", onboardingStatus: "COMPLETE" }, "valid-cookie");
      expect(res).toEqual({ action: "redirect", dest: "/app" });
    });

    it("allows COMPLETE user into /app", () => {
      const res = simulateMiddleware("/app", { sub: "1", role: "USER", onboardingStatus: "COMPLETE" }, "valid-cookie");
      expect(res).toEqual({ action: "next" });
    });

    it("allows ADMIN user into /app without onboarding", () => {
      const res = simulateMiddleware("/app", { sub: "1", role: "ADMIN", onboardingStatus: "NOT_STARTED" }, "valid-cookie");
      expect(res).toEqual({ action: "next" });
    });

    it("redirects un-decryptable session cookie to /login?error=SessionExpired", () => {
      const res = simulateMiddleware("/app", null, "corrupt-cookie");
      expect(res).toEqual({ action: "redirect", dest: "/login?error=SessionExpired" });
    });
  });
});
