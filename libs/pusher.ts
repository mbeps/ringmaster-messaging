// Sets up the Pusher client and server libraries
import PusherServer from "pusher";
import PusherClient from "pusher-js";
import { API_ROUTES } from "./routes";

/**
 * Sets up Pusher for server-side use.
 * @see https://pusher.com/docs/channels/server_api
 */
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: "eu",
  useTLS: true,
});

/**
 * Sets up Pusher for client-side use.
 * @see https://pusher.com/docs/channels/client_api/reference
 */
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  {
    channelAuthorization: {
      endpoint: API_ROUTES.PUSHER_AUTH,
      transport: "ajax",
    },
    cluster: "eu",
  }
);
