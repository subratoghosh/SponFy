import "server-only";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma, isDatabaseConfigured } from "@/lib/prisma";

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
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
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

      // Only query DB if role is not already attached (avoiding redundant DB calls on login)
      if (!token.role && isDatabaseConfigured() && (token.sub || token.email)) {
        try {
          const dbPromise = (prisma as any).user.findFirst({
            where: {
              OR: [
                ...(token.sub ? [{ id: token.sub }] : []),
                ...(token.email ? [{ email: token.email }] : []),
              ],
            },
            select: { id: true, role: true, email: true },
          });
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("DB_TIMEOUT")), 3000)
          );
          const dbUser = (await Promise.race([dbPromise, timeoutPromise])) as any;

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
  secret:
    process.env.NODE_ENV === "production"
      ? (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
      : (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "sponfy-dev-auth-secret-super-safe-fallback-32chars"),
  trustHost: true,
});
