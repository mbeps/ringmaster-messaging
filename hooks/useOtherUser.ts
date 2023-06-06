import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { FullConversationType } from "../app/types";
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
  const session = useSession();

  const otherUser = useMemo(() => {
    // gets the current user's email
    const currentUserEmail = session.data?.user?.email;

    // using the current user's email, filter the conversation's users to get the other user
    const otherUser = conversation.users.filter(
      (user) => user.email !== currentUserEmail
    );

    return otherUser[0];
  }, [session.data?.user?.email, conversation.users]);

  return otherUser;
};

export default useOtherUser;
