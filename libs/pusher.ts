// Sets up the Pusher client and server libraries
import PusherServer from "pusher";
import PusherClient from "pusher-js";
import { env } from "@/lib/env";
import { API_ROUTES } from "./routes";

/**
 * Sets up Pusher for server-side use.
 * @see https://pusher.com/docs/channels/server_api
 */
export const pusherServer = new PusherServer({
  appId: env.PUSHER_APP_ID,
  key: env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: env.PUSHER_SECRET,
  cluster: "eu",
  useTLS: true,
});

let clientInstance: PusherClient | null = null;

/**
 * Lazily retrieves or instantiates the singleton Pusher client.
 * Guards against server-side instantiation to prevent Node.js DEP0169 url.parse warnings.
 */
export const getPusherClient = (): PusherClient => {
  if (typeof window === "undefined") {
    throw new Error("PusherClient cannot be instantiated on the server.");
  }
  if (!clientInstance) {
    clientInstance = new PusherClient(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      channelAuthorization: {
        endpoint: API_ROUTES.PUSHER.auth,
        transport: "ajax",
      },
      cluster: "eu",
    });
  }
  return clientInstance;
};

/**
 * Sets up Pusher for client-side use.
 * Lazily instantiates the underlying PusherClient on first property access in the browser.
 * Ensures new PusherClient(...) is NEVER executed on the server or during SSR / next build.
 * @see https://pusher.com/docs/channels/client_api/reference
 */
export const pusherClient: PusherClient = new Proxy({} as PusherClient, {
  get(_target, prop: string | symbol) {
    const instance = getPusherClient();
    const value = Reflect.get(instance, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});
