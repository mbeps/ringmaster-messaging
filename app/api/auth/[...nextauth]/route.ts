import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/libs/prismadb";

/**
 * Object providing the configuration options for NextAuth, including the
 *  - Authentication adapter
 *  - Authentication providers (such as GitHub, Google, and custom credentials)
 *  - Session strategy
 *  - Secret
 *  - Debug mode
 * These options define how the authentication process will be handled and which authentication methods are supported.
 * The third party providers will sign the user in if the account exists, otherwise they will create a new account.
 * The credentials provider will sign the user in if the credentials are valid, otherwise it will throw an error.
 */
export const authOptions: AuthOptions = {
  // specifies the adapter to be used by NextAuth for session management and authentication state persistence
  adapter: PrismaAdapter(prisma),
  // specifies the providers to be used by NextAuth for authentication
  providers: [
    GithubProvider({
      clientId: process.env.CLIENT_ID_GITHUB as string,
      clientSecret: process.env.CLIENT_SECRET_GITHUB as string,
    }),
    GoogleProvider({
      clientId: process.env.CLIENT_ID_GOOGLE as string,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE as string,
    }),
    // email and password authentication
    CredentialsProvider({
      name: "credentials", // name of the provider
      credentials: {
        // defines the fields that will be taken from the sign in form
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },

      /**
       * Callback function provided by the CredentialsProvider in NextAuth.
       * Responsible for authorizing and authenticating a user.
       *
       * @param credentials (credentials.email, credentials.password): the credentials provided by the user
       * @returns (User): the user if the credentials are valid, otherwise throws an error
       */
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        // credentials must be provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // find the user with the provided email
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // if the user is not found or the user does not have a hashed password, throw an error
        if (!user || !user?.hashedPassword) {
          throw new Error("Invalid credentials");
        }

        // compare the provided password with the password stored in the database
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        // if the password is incorrect, throw an error
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
