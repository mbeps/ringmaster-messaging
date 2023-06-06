import { PrismaClient } from "@prisma/client";

/**
 * This file contains the Prisma client instance that is used to connect to the database.
 * Allows accessing the prisma client from anywhere in the application
 */
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Constant is defined by assigning the value of `globalThis.prisma` or a new `PrismaClient()` instance to it.
 * `globalThis.prisma` refers to the global prisma variable,
 *  which may already have a value if it was set previously.
 */
const client = globalThis.prisma || new PrismaClient();
/**
 * If the `NODE_ENV` environment variable is not set to "production",
 *  the `globalThis.prisma` variable is set to the client instance.
 * This ensures that the prisma variable is globally available for subsequent usage and avoids creating multiple instances of `PrismaClient` during development.
 */
if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

export default client;
