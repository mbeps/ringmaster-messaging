//! USED AS NEXT 13 APP ROUTER IS NOT SUPPORTED YET

import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { pusherServer } from "@/libs/pusher";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Handles the authentication process for Pusher, ensuring that only authenticated users can subscribe to specific channels.
 * It verifies the user's session, generates an authorization response based on the provided channel and user data,
 * and sends it back to the client for authentication with Pusher
 * @param request (NextApiRequest): The request object.
 * @param response (NextApiResponse): The response object.
 * @returns (Promise<void>): The response object.
 */
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // Get the user's session based on the request
  const session = await getServerSession(request, response, authOptions);

  // If the user doesn't have a session, return a 401 error
  if (!session?.user?.email) {
    return response.status(401);
  }

  // Get the socket ID from the request
  const socketId = request.body.socket_id;
  // Get the channel name from the request
  const channel = request.body.channel_name;
  // assign the user's email as the user_id
  const data = {
    user_id: session.user.email,
  };

  // Generate an authorization response based on the provided channel and user data
  const authResponse = pusherServer.authorizeChannel(socketId, channel, data);
  return response.send(authResponse);
}
