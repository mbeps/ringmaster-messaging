import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/libs/prismadb";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : [],
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  advanced: {
      database: {
          generateId: false,
      },
  },
  logger: {
    disabled: false,
    level: "debug",
    log: (level: any, message: any, ...args: any[]) => {
      if (level === "error") {
        const isRedirect = args.some(
          (arg: any) =>
            arg &&
            typeof arg === "object" &&
            (arg.status === "FOUND" || arg.statusCode === 302)
        );
        if (isRedirect) {
          return;
        }
      }
      if (level === "error") {
        console.error(message, ...args);
      } else if (level === "warn") {
        console.warn(message, ...args);
      } else if (level === "info") {
        console.info(message, ...args);
      } else {
        console.log(message, ...args);
      }
    },
  },
  session: {
    cookieCache: {
      enabled: false,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.CLIENT_ID_GITHUB as string,
      clientSecret: process.env.CLIENT_SECRET_GITHUB as string,
    },
    google: {
      clientId: process.env.CLIENT_ID_GOOGLE as string,
      clientSecret: process.env.CLIENT_SECRET_GOOGLE as string,
    },
  },
});

