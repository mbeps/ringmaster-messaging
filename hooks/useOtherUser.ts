import { authClient } from "@/lib/auth-client";
import { FullConversationType } from "../types";
import { User } from "@prisma/client";

/**
 * Returns the other user in a conversation.
 *
 * @param conversation (FullConversationType | { users: User[] })
 * @returns (User): other user in the conversation
 */
const useOtherUser = (
  conversation: FullConversationType | { users: User[] }
) => {
  // retrieve the current user's session
  const session = authClient.useSession();

  // gets the current user's email
  const currentUserEmail = session.data?.user?.email;

  // using the current user's email, filter the conversation's users to get the other user
  const otherUsers = conversation.users.filter(
    (user) => user.email !== currentUserEmail
  );

  return otherUsers[0];
};

export default useOtherUser;
