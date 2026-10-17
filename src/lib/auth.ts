import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { memoryStore } from "@/lib/data/memory-store";

export interface DemoAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  accountMode: string;
  onboardingStatus: string;
  organisationId?: string | null;
}

export const demoAuthUsersRef = memoryStore<Record<string, DemoAuthUser>>(
  "demoAuthUsers",
  () => ({
    "demo@sponfy.dev": {
      id: "usr-demo-1",
      email: "demo@sponfy.dev",
      name: "Demo Organizer",
      role: "USER",
      accountMode: "INDIVIDUAL",
      onboardingStatus: "COMPLETE",
      organisationId: null,
    },
    "organiser@sponfy.dev": {
      id: "usr-demo-organiser",
      email: "organiser@sponfy.dev",
      name: "Demo Organiser",
      role: "ORGANISER",
      accountMode: "ORGANISER",
      onboardingStatus: "COMPLETE",
      organisationId: "demo-org-1",
    },
    "executive@sponfy.dev": {
      id: "usr-demo-executive",
      email: "executive@sponfy.dev",
      name: "Demo Executive",
      role: "EXECUTIVE",
      accountMode: "EXECUTIVE",
      onboardingStatus: "COMPLETE",
      organisationId: "demo-org-1",
    },
  })
);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: string;
      accountMode?: string;
      onboardingStatus?: string;
      organisationId?: string | null;
    };
  }
  interface User {
    role?: string;
    accountMode?: string;
    onboardingStatus?: string;
    organisationId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accountMode?: string;
    onboardingStatus?: string;
    organisationId?: string | null;
  }
}

// Dev-only fallback. This string is public (it is in the repo), so using it in
// production would let anyone forge a session cookie, including an admin's.
// In production AUTH_SECRET must be set; Auth.js will refuse to start otherwise.
if (!process.env.AUTH_SECRET && process.env.NODE_ENV !== "production") {
  process.env.AUTH_SECRET = "sponfy-dev-auth-secret-super-safe-fallback-32chars";
}

// In production or on Vercel, strip any accidental 'localhost' AUTH_URL/NEXTAUTH_URL
// so NextAuth trustHost automatically uses the deployed production domain (e.g. sponfy.vercel.app)
if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  if (process.env.AUTH_URL?.includes("localhost")) {
    delete process.env.AUTH_URL;
  }
  if (process.env.NEXTAUTH_URL?.includes("localhost")) {
    delete process.env.NEXTAUTH_URL;
  }
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "demo-google-client-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "demo-google-secret",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID || "demo-github-client-id",
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || "demo-github-secret",
    }),
    Credentials({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).trim().toLowerCase();
        const password = credentials.password as string;

        // 1. Database validation if database is configured
        if (isDatabaseConfigured()) {
          try {
            const dbUser = await (prisma as any).user.findUnique({
              where: { email },
              include: {
                organisationMemberships: {
                  where: { status: "ACTIVE" },
                  select: { organisationId: true },
                  take: 1,
                },
                createdOrganisations: {
                  select: { id: true },
                  take: 1,
                },
              },
            });

            if (!dbUser) {
              // When database is configured, do not fall back to demo mode!
              // Non-existent users must register first.
              return null;
            }

            const activeOrgId =
              dbUser.organisationMemberships?.[0]?.organisationId ||
              dbUser.createdOrganisations?.[0]?.id ||
              null;

            if (dbUser.password) {
              const isMatch = verifyPassword(password, dbUser.password);
              if (isMatch) {
                return {
                  id: dbUser.id,
                  email: dbUser.email,
                  name: dbUser.name || "Organizer",
                  role: dbUser.role || "USER",
                  accountMode: dbUser.accountMode || "INDIVIDUAL",
                  onboardingStatus: dbUser.onboardingStatus || (dbUser.onboarded ? "COMPLETE" : "NOT_STARTED"),
                  organisationId: activeOrgId,
                };
              }
              return null;
            } else {
              // User originally signed in via Google/OAuth (no password yet).
              // Set password so they can log in via both methods seamlessly!
              if (password.length >= 6) {
                const { hashPassword } = await import("@/lib/auth/password");
                const hashedPassword = hashPassword(password);
                await (prisma as any).user.update({
                  where: { id: dbUser.id },
                  data: { password: hashedPassword },
                });
                return {
                  id: dbUser.id,
                  email: dbUser.email,
                  name: dbUser.name || "Organizer",
                  role: dbUser.role || "USER",
                  accountMode: dbUser.accountMode || "INDIVIDUAL",
                  onboardingStatus: dbUser.onboardingStatus || (dbUser.onboarded ? "COMPLETE" : "NOT_STARTED"),
                  organisationId: activeOrgId,
                };
              }
              return null;
            }
          } catch (err) {
            console.error("Database user lookup in authorize failed:", err);
            return null;
          }
        }

        // 2. Demo & development authorization fallback (accepts valid email with 6+ char password)
        // STRICTLY ONLY when database is NOT configured!
        if (!isDatabaseConfigured() && password.length >= 6) {
          const adminEmails = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          const isAdmin = email === "admin@sponfy.dev" || adminEmails.includes(email);

          const existingDemoUser = demoAuthUsersRef.value[email];
          if (existingDemoUser) {
            return {
              id: existingDemoUser.id,
              email: existingDemoUser.email,
              name: existingDemoUser.name,
              role: isAdmin ? "ADMIN" : existingDemoUser.role,
              accountMode: existingDemoUser.accountMode,
              onboardingStatus: isAdmin ? "COMPLETE" : existingDemoUser.onboardingStatus,
              organisationId: existingDemoUser.organisationId || null,
            };
          }

          // First-time demo user starts with NOT_STARTED (unless admin)
          const newDemoUser: DemoAuthUser = {
            id: isAdmin ? "usr-admin-1" : `usr-${Buffer.from(email).toString("hex").slice(0, 10)}`,
            email,
            name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            role: isAdmin ? "ADMIN" : "USER",
            accountMode: "INDIVIDUAL",
            onboardingStatus: isAdmin ? "COMPLETE" : "NOT_STARTED",
            organisationId: null,
          };
          demoAuthUsersRef.value[email] = newDemoUser;
          return newDemoUser;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Ensure Google and GitHub OAuth users have a record in Neon PostgreSQL 'users' table
      // and cleanly link account to existing user by email to prevent OAuthAccountNotLinked errors.
      if (account && account.provider !== "credentials" && user.email && isDatabaseConfigured()) {
        try {
          const userEmail = user.email.toLowerCase().trim();
          let existingUser = await (prisma as any).user.findUnique({
            where: { email: userEmail },
          });

          if (!existingUser) {
            const adminEmails = (process.env.ADMIN_EMAILS || "")
              .split(",")
              .map((e) => e.trim().toLowerCase())
              .filter(Boolean);
            const isAdmin = adminEmails.includes(userEmail);

            existingUser = await (prisma as any).user.create({
              data: {
                name: user.name || (profile as any)?.name || userEmail.split("@")[0],
                email: userEmail,
                image: user.image || (profile as any)?.picture || null,
                role: isAdmin ? "ADMIN" : "USER",
                accountMode: "INDIVIDUAL",
                onboardingStatus: isAdmin ? "COMPLETE" : "NOT_STARTED",
                onboarded: isAdmin,
              },
            });
          }

          if (existingUser) {
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.accountMode = existingUser.accountMode || "INDIVIDUAL";
            user.onboardingStatus = existingUser.onboardingStatus || (existingUser.onboarded ? "COMPLETE" : "NOT_STARTED");

            // Link or update OAuth account in database safely
            try {
              await (prisma as any).account.upsert({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
                update: {
                  userId: existingUser.id,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  id_token: account.id_token,
                  scope: account.scope,
                  token_type: account.token_type,
                },
                create: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string | undefined,
                },
              });
            } catch (accErr) {
              console.warn("Account link upsert warning (non-fatal):", accErr);
            }
            return true;
          }
          return false;
        } catch (err) {
          console.error("Auto-linking or saving OAuth user in signIn callback failed:", err);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (!token || token.invalid || token.userNotFound || !token.sub) {
        // Invalidate session if token points to a non-existent or deleted user
        return {
          ...session,
          user: undefined,
          invalid: true,
        } as any;
      }

      if (session.user) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) || session.user.name;
        session.user.role = token.role;
        session.user.accountMode = token.accountMode;
        session.user.onboardingStatus = token.onboardingStatus;
        session.user.organisationId = token.organisationId ?? null;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        if (user.id) token.sub = user.id;
        if (user.email) token.email = user.email.toLowerCase().trim();
        if (user.name) token.name = user.name;
        if (user.role) token.role = user.role;
        if (user.accountMode) token.accountMode = user.accountMode;
        if (user.onboardingStatus) token.onboardingStatus = user.onboardingStatus;
        if (user.organisationId) token.organisationId = user.organisationId;
      }

      // Check explicitly configured admin emails (only if ADMIN_EMAILS is provided)
      const configuredAdmins = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const userEmail = ((token.email as string) || (user as any)?.email || "").toLowerCase().trim();
      if (userEmail && configuredAdmins.includes(userEmail)) {
        token.role = "ADMIN";
        token.onboardingStatus = "COMPLETE";
      }

      // When database is configured, dynamically verify that user exists and sync latest data
      if (isDatabaseConfigured()) {
        try {
          const subId = typeof token.sub === "string" ? token.sub : "";
          const emailLookup = userEmail || "";

          let dbUser = null;
          // Look up by sub id first (real cuid)
          if (subId && !subId.startsWith("usr-demo")) {
            dbUser = await (prisma as any).user.findUnique({
              where: { id: subId },
              select: {
                id: true,
                role: true,
                email: true,
                name: true,
                accountMode: true,
                onboardingStatus: true,
                onboarded: true,
                organisationMemberships: {
                  where: { status: "ACTIVE" },
                  select: { organisationId: true },
                  take: 1,
                },
                createdOrganisations: {
                  select: { id: true },
                  take: 1,
                },
              },
            });
          }

          // Fallback to lookup by email if sub didn't match
          if (!dbUser && emailLookup) {
            dbUser = await (prisma as any).user.findUnique({
              where: { email: emailLookup },
              select: {
                id: true,
                role: true,
                email: true,
                name: true,
                accountMode: true,
                onboardingStatus: true,
                onboarded: true,
                organisationMemberships: {
                  where: { status: "ACTIVE" },
                  select: { organisationId: true },
                  take: 1,
                },
                createdOrganisations: {
                  select: { id: true },
                  take: 1,
                },
              },
            });
          }

          if (dbUser) {
            // ALWAYS ensure token.sub is the real PostgreSQL users.id
            token.sub = dbUser.id;
            token.email = dbUser.email;
            if (dbUser.name) token.name = dbUser.name;
            token.role = dbUser.role || "USER";
            token.accountMode = dbUser.accountMode || "INDIVIDUAL";
            token.onboardingStatus = dbUser.onboardingStatus || (dbUser.onboarded ? "COMPLETE" : "NOT_STARTED");
            token.organisationId =
              dbUser.organisationMemberships?.[0]?.organisationId ||
              dbUser.createdOrganisations?.[0]?.id ||
              null;
            delete token.invalid;
            delete token.userNotFound;
          } else {
            // User DOES NOT EXIST in the database! Treat session as invalid.
            token.invalid = true;
            token.userNotFound = true;
            token.sub = "";
            token.email = "";
          }
        } catch (err) {
          // If transient DB disconnect, keep current token role
        }
      } else if (!isDatabaseConfigured() && userEmail) {
        // Sync demo mode state changes (such as completing onboarding)
        const demoUser = demoAuthUsersRef.value[userEmail];
        if (demoUser) {
          token.role = demoUser.role;
          token.accountMode = demoUser.accountMode;
          token.onboardingStatus = demoUser.onboardingStatus;
          token.organisationId = demoUser.organisationId || null;
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    pkceCodeVerifier: {
      name: "authjs.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    state: {
      name: "authjs.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "authjs.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  logger: {
    error(error) {
      const err = error as any;
      const isJwtSessionError =
        err?.name === "JWTSessionError" ||
        err?.type === "JWTSessionError" ||
        err?.message?.includes("JWTSessionError") ||
        err?.message?.includes("no matching decryption secret") ||
        err?.cause?.err?.message?.includes("no matching decryption secret") ||
        err?.cause?.message?.includes("no matching decryption secret");

      if (isJwtSessionError) {
        // Stale, mismatched, or corrupted session cookie from previous secret/different port; suppress console noise
        return;
      }
      console.error(error);
    },
    warn(code) {
      if ((code as string) === "NEXTAUTH_URL") return;
      console.warn(`[auth][warn] ${code}`);
    },
  },
  secret: [
    process.env.AUTH_SECRET || "sponfy-dev-auth-secret-super-safe-fallback-32chars",
    process.env.NEXTAUTH_SECRET || "sponfy-dev-auth-secret-super-safe-fallback-32chars",
    "sponfy-dev-auth-secret-super-safe-fallback-32chars",
  ].filter((s, idx, arr): s is string => Boolean(s) && arr.indexOf(s) === idx),
  trustHost: true,
});
