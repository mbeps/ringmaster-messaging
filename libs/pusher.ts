// Sets up the Pusher client and server libraries
import PusherServer from "pusher";
import PusherClient from "pusher-js";

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
      endpoint: "/api/pusher/auth", //! only supports Next.JS 12
      transport: "ajax",
    },
    cluster: "eu",
  }
);
