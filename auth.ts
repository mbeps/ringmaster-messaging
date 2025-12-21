import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import authConfig from "@/auth.config";
import prisma from "@/libs/prismadb";
import { ROUTES } from "@/libs/routes";

/**
 * NextAuth v5 configuration with adapter and callbacks.
 * Exports auth function for server-side usage and handlers for API routes.
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: ROUTES.AUTH,
  },
  callbacks: {
    async session({ token, session }) {
      // Add user ID to session
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      // Add user details to session
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email ?? "";
      }

      return session;
    },
    async jwt({ token, user }) {
      // Add user ID to token on sign in
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  ...authConfig,
});