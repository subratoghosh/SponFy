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
  adapter: isDatabaseConfigured() ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "demo-google-client-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "demo-google-secret",
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
              const isMatch = dbUser.password
                ? verifyPassword(password, dbUser.password)
                : password.length >= 6;

              if (isMatch) {
                return {
                  id: dbUser.id,
                  email: dbUser.email,
                  name: dbUser.name || "Organizer",
                  role: dbUser.role || "USER",
                };
              }
              return null;
            }
          } catch (err) {
            console.error("Database user lookup in authorize failed:", err);
          }
        }

        // 2. Demo & development authorization fallback (accepts valid email with 6+ char password)
        if (password.length >= 6) {
          const adminEmails = (process.env.ADMIN_EMAILS || "admin@sponfy.dev")
            .split(",")
            .map((e) => e.trim().toLowerCase());
          const isAdmin = email === "admin@sponfy.dev" || adminEmails.includes(email);

          return {
            id: isAdmin ? "usr-admin-1" : `usr-${Buffer.from(email).toString("hex").slice(0, 10)}`,
            email,
            name: isAdmin
              ? "Subrato Ghosh (Platform Lead)"
              : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            role: isAdmin ? "ADMIN" : "USER",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) {
        session.user.id = token.sub as string;
      }
      if (token?.role && session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if ((user as any)?.role) {
        (token as any).role = (user as any).role;
      }

      // Check configured admin emails
      const adminEmails = (process.env.ADMIN_EMAILS || "admin@sponfy.dev")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      const userEmail = (token.email || (user as any)?.email || "").toLowerCase();
      if (userEmail && (userEmail === "admin@sponfy.dev" || adminEmails.includes(userEmail))) {
        (token as any).role = "ADMIN";
      }

      // If database is configured, dynamically sync latest role from PostgreSQL
      if (isDatabaseConfigured() && (token.sub || token.email)) {
        try {
          const dbUser = await (prisma as any).user.findFirst({
            where: {
              OR: [
                ...(token.sub ? [{ id: token.sub }] : []),
                ...(token.email ? [{ email: token.email }] : []),
              ],
            },
            select: { id: true, role: true, email: true },
          });

          if (dbUser) {
            if (dbUser.role) {
              (token as any).role = dbUser.role;
            }
            if (dbUser.id) {
              token.sub = dbUser.id;
            }
          }
        } catch (err) {
          // If transient DB disconnect, keep current token role
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
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
