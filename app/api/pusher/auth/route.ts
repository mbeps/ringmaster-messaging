import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/libs/pusher";

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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse the request body
    const body = await request.text();
    const params = new URLSearchParams(body);
    
    // Get the socket ID and channel name from the request body
    const socketId = params.get("socket_id");
    const channelName = params.get("channel_name");

    if (!socketId || !channelName) {
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
      data
    );

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("PUSHER_AUTH_ERROR:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}