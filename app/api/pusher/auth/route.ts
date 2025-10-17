import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { pusherServer } from "@/libs/pusher";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Handles the authentication process for Pusher, ensuring that only authenticated users can subscribe to specific channels.
 * It verifies the user's session, generates an authorisation response based on the provided channel and user data,
 * and sends it back to the client for authentication with Pusher.
 * 
 * This is an App Router route handler that replaces the Pages Router version.
 * 
 * @param request (NextRequest): The request object containing socket_id and channel_name in the body
 * @returns (NextResponse): The authorisation response for Pusher
 */
export async function POST(request: NextRequest) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);

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

    // Generate an authorisation response based on the provided channel and user data
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