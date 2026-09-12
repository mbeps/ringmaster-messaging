import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "@/config/env";
import prisma from "@/utils/prisma/client";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS
    ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
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
            (arg.status === "FOUND" || arg.statusCode === 302),
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
      clientId: env.CLIENT_ID_GITHUB,
      clientSecret: env.CLIENT_SECRET_GITHUB,
    },
    google: {
      clientId: env.CLIENT_ID_GOOGLE,
      clientSecret: env.CLIENT_SECRET_GOOGLE,
    },
  },
});
