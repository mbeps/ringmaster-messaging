import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { env } from "@/config/env";
import { db, mongoClient } from "@/utils/db/client";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS
    ? env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : [],
  database: mongodbAdapter(db, {
    client: mongoClient,
    usePlural: false,
    transaction: true,
  }),
  user: {
    modelName: "User",
    deleteUser: {
      enabled: true,
    },
  },
  session: {
    modelName: "Session",
    cookieCache: {
      enabled: false,
    },
  },
  account: {
    modelName: "Account",
  },
  verification: {
    modelName: "Verification",
  },
  advanced: {
    database: {
      generateId: false,
      joins: true,
      validateSchema: false,
    },
  },
  logger: {
    disabled: false,
    level: "debug",
    log: (level: unknown, message: unknown, ...args: unknown[]) => {
      if (level === "error") {
        const isRedirect = args.some(
          (arg: unknown) =>
            arg &&
            typeof arg === "object" &&
            (("status" in arg &&
              (arg as { status?: unknown }).status === "FOUND") ||
              ("statusCode" in arg &&
                (arg as { statusCode?: unknown }).statusCode === 302)),
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
  emailAndPassword: {
    enabled: true,
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
