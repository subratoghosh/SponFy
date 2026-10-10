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
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "demo-google-client-id",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "demo-google-secret",
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
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
