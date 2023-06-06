"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Conversation, Message, User } from "@prisma/client";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import clsx from "clsx";

import Avatar from "@/components/Avatar";
import useOtherUser from "@/hooks/useOtherUser";
import { FullConversationType } from "@/types";
import AvatarGroup from "@/components/AvatarGroup";

interface ConversationBoxProps {
  data: FullConversationType;
  selected?: boolean;
}

/**
 * Conversation Box Component which displays the conversation that can be selected.
 * It displays:
 *  - the name of the conversation
 *  - the last message sent
 *  - the time the last message was sent
 *  - the avatar of the other user or the group chat
 * This component is updated in real time.
 *
 * @param {data, selected}: required props for tbe button
 * @returns (JSX.Element): returns the button for the each conversation
 */
const ConversationBox: React.FC<ConversationBoxProps> = ({
  data,
  selected,
}) => {
  // get the other user in the conversation
  const otherUser = useOtherUser(data);
  // gets the current session
  const session = useSession();
  const router = useRouter();

  /**
   * Redirects to the conversation page when the conversation box is clicked.
   */
  const handleClick = useCallback(() => {
    router.push(`/conversations/${data.id}`); // redirects to the conversation page
  }, [data, router]);

  /**
   * Gets the last message in the conversation.
   */
  const lastMessage = useMemo(() => {
    const messages = data.messages || []; // gets a list of all the messages in the conversation

    return messages[messages.length - 1]; // from the list it gets the last message
  }, [data.messages]);

  /**
   * Gets the email of the current user who is logged in.
   */
  const userEmail = useMemo(
    () => session.data?.user?.email,
    [session.data?.user?.email]
  );

  /**
   * Marks the last message as seen if the current user has seen it.
   * The user must be logged in to mark the message as seen.
   */
  const hasSeen = useMemo(() => {
    if (!lastMessage) {
      // if message does not exist then it cannot be seen
      return false;
    }

    const seenArray = lastMessage.seen || [];

    if (!userEmail) {
      return false;
    }

    return seenArray.filter((user) => user.email === userEmail).length !== 0; // checks if the current user has seen the message
  }, [userEmail, lastMessage]);

  /**
   * Gets the text of the last message to be displayed in the conversation box.
   * If the last message is an image, it will display "Image sent".
   * If the last message is a text, it will display the text.
   * If there is no conversation yet, it will display "No Conversation Yet".
   */
  const lastMessageText = useMemo(() => {
    if (lastMessage?.image) {
      // if the last message is an image
      return "Image sent";
    }

    if (lastMessage?.body) {
      // show the text in the body
      return lastMessage?.body;
    }

    return "No Conversation Yet";
  }, [lastMessage]);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        `
        w-full 
        relative 
        flex 
        items-center 
        space-x-3 
        p-3 
        hover:bg-neutral-100
        rounded-lg
        transition
        cursor-pointer
        `,
        selected ? "bg-neutral-100" : "bg-white"
      )}
    >
      {data.isGroup ? (
        <AvatarGroup users={data.users} />
      ) : (
        <Avatar user={otherUser} />
      )}

      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          <div className="flex justify-between items-center mb-1">
            <p className="text-md font-medium text-gray-900">
              {/* Use group chat name or name of the user (if single user conversation) */}
              {data.name || otherUser.name}
            </p>
            {lastMessage?.createdAt && (
              <p
                className="
                  text-xs 
                  text-gray-400 
                  font-light
                "
              >
                {format(new Date(lastMessage.createdAt), "p")}
              </p>
            )}
          </div>
          <p
            className={clsx(
              `
              truncate 
              text-sm
              `,
              hasSeen ? "text-gray-500" : "text-black font-medium"
            )}
          >
            {lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
