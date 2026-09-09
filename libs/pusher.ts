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

/**
 * Sets up Pusher for client-side use.
 * @see https://pusher.com/docs/channels/client_api/reference
 */
export const pusherClient = new PusherClient(env.NEXT_PUBLIC_PUSHER_APP_KEY, {
  channelAuthorization: {
    endpoint: API_ROUTES.PUSHER.auth,
    transport: "ajax",
  },
  cluster: "eu",
});
