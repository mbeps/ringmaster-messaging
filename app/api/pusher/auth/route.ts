import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLogger } from "@/lib/logger";
import { pusherServer } from "@/libs/pusher";

const log = getLogger(["app", "api", "pusher"]);

/**
 * Handles the authentication process for Pusher.
 * Ensures only authenticated users can subscribe to specific channels.
 * Uses Better Auth authentication.
 *
 * @param request - The request object containing socket_id and channel_name
 * @returns Authorization response for Pusher
 */
export async function POST(request: NextRequest) {
  try {
    // Get the user's session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If the user doesn't have a session, return a 401 error
    if (!session?.user?.email) {
      log.warn("Unauthorized Pusher authentication attempt");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse the request body
    const body = await request.text();
    const params = new URLSearchParams(body);

    // Get the socket ID and channel name from the request body
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");

    if (!socketId || !channelName) {
      log.warn("Pusher authentication failed: missing socketId or channelName");
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    // Assign the user's email as the user_id
    const data = {
      user_id: session.user.email,
    };

    // Generate an authorization response based on the provided channel and user data
    const authResponse = pusherServer.authorizeChannel(
      socketId,
      channelName,
      data,
    );

    log.debug("Pusher channel authorized (channel: {channelName})", {
      channelName,
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    log.error("Pusher authentication failed: {error}", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
