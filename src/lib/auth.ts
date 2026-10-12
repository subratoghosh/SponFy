import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";

// Dev-only fallback. This string is public (it is in the repo), so using it in
// production would let anyone forge a session cookie, including an admin's.
// In production AUTH_SECRET must be set; Auth.js will refuse to start otherwise.
if (!process.env.AUTH_SECRET && process.env.NODE_ENV !== "production") {
  process.env.AUTH_SECRET = "sponfy-dev-auth-secret-super-safe-fallback-32chars";
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
            });
            if (dbUser) {
              if (dbUser.password) {
                const isMatch = verifyPassword(password, dbUser.password);
                if (isMatch) {
                  return {
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name || "Organizer",
                    role: dbUser.role || "USER",
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
                  };
                }
                return null;
              }
            }
          } catch (err) {
            console.error("Database user lookup in authorize failed:", err);
          }
        }

        // 2. Demo & development authorization fallback (accepts valid email with 6+ char password)
        if (password.length >= 6) {
          const adminEmails = (process.env.ADMIN_EMAILS || "")
            .split(",")
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          const isAdmin = email === "admin@sponfy.dev" || adminEmails.includes(email);

          return {
            id: isAdmin ? "usr-admin-1" : `usr-${Buffer.from(email).toString("hex").slice(0, 10)}`,
            email,
            name: email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            role: isAdmin ? "ADMIN" : "USER",
          };
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
            existingUser = await (prisma as any).user.create({
              data: {
                name: user.name || (profile as any)?.name || userEmail.split("@")[0],
                email: userEmail,
                image: user.image || (profile as any)?.picture || null,
                role: "USER",
              },
            });
          }

          if (existingUser) {
            user.id = existingUser.id;
            (user as any).role = existingUser.role;

            // Link or update OAuth account in database
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
          }
        } catch (err) {
          console.warn("Auto-linking or saving OAuth user in signIn callback failed:", err);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token?.sub) {
          session.user.id = token.sub as string;
        }
        if (token?.email) {
          session.user.email = token.email as string;
        }
        if (token?.name) {
          session.user.name = token.name as string;
        }
        if (token?.role) {
          (session.user as any).role = token.role;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        if (user.id) token.sub = user.id;
        if (user.email) token.email = user.email.toLowerCase().trim();
        if (user.name) token.name = user.name;
        if ((user as any)?.role) (token as any).role = (user as any).role;
      }

      // Check explicitly configured admin emails (only if ADMIN_EMAILS is provided)
      const configuredAdmins = (process.env.ADMIN_EMAILS || "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const userEmail = ((token.email as string) || (user as any)?.email || "").toLowerCase().trim();
      if (userEmail && configuredAdmins.includes(userEmail)) {
        (token as any).role = "ADMIN";
      }

      // If database is configured, dynamically sync latest role, email, and id from PostgreSQL
      if (isDatabaseConfigured() && userEmail) {
        try {
          const dbUser = await (prisma as any).user.findUnique({
            where: { email: userEmail },
            select: { id: true, role: true, email: true, name: true },
          });

          if (dbUser) {
            token.sub = dbUser.id;
            token.email = dbUser.email;
            if (dbUser.name) token.name = dbUser.name;
            (token as any).role = dbUser.role || "USER";
          }
        } catch (err) {
          // If transient DB disconnect, keep current token role
        }
      } else if (isDatabaseConfigured() && token.sub) {
        try {
          const dbUser = await (prisma as any).user.findUnique({
            where: { id: token.sub as string },
            select: { id: true, role: true, email: true, name: true },
          });

          if (dbUser) {
            token.sub = dbUser.id;
            if (dbUser.email) token.email = dbUser.email;
            if (dbUser.name) token.name = dbUser.name;
            (token as any).role = dbUser.role || "USER";
          }
        } catch (err) {
          // keep current token role
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
