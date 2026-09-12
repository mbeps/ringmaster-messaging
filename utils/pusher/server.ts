import PusherServer from "pusher";
import { env } from "@/config/env";

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

export default pusherServer;
