"use client";

import clsx from "clsx";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Avatar from "@/components/avatar";
import AvatarGroup from "@/components/avatar-group";
import { ROUTES } from "@/config/routes";
import useOtherUser from "@/hooks/use-other-user";
import { authClient } from "@/lib/auth-client";
import type { FullConversationType } from "@/types/conversation/full-conversation";

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
 * @param param0: ConversationBoxProps
 * @returns ConversationBox component
 */
export default function ConversationBox({
  data,
  selected,
}: ConversationBoxProps) {
  // get the other user in the conversation
  const otherUser = useOtherUser(data);
  // gets the current session
  const session = authClient.useSession();
  const router = useRouter();

  // Redirects to the conversation page when the conversation box is clicked
  const handleClick = () => {
    router.push(ROUTES.CONVERSATIONS.detail(data.id));
  };

  // Gets the last message in the conversation
  const messages = data.messages || [];
  const lastMessage = messages[messages.length - 1];

  // Gets the email of the current user who is logged in
  const userEmail = session.data?.user?.email;

  // Marks the last message as seen if the current user has seen it
  const seenArray = lastMessage?.seen || [];
  const hasSeen =
    lastMessage && userEmail
      ? seenArray.filter((user) => user.email === userEmail).length !== 0
      : false;

  // Gets the text of the last message to be displayed in the conversation box
  let lastMessageText = "No Conversation Yet";
  if (lastMessage?.image) {
    lastMessageText = "Image sent";
  } else if (lastMessage?.body) {
    lastMessageText = lastMessage.body;
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        `relative flex w-full cursor-pointer items-center space-x-3 rounded-lg p-3 transition hover:bg-neutral-100`,
        selected ? "bg-neutral-100" : "bg-white",
      )}
    >
      {data.isGroup ? (
        <AvatarGroup users={data.users} />
      ) : (
        <Avatar user={otherUser} />
      )}

      <div className="min-w-0 flex-1">
        <div className="focus:outline-hidden">
          <span className="absolute inset-0" aria-hidden="true" />
          <div className="mb-1 flex items-center justify-between">
            <p className="font-medium text-gray-900 text-md">
              {/* Use group chat name or name of the user (if single user conversation) */}
              {data.name || otherUser.name}
            </p>
            {lastMessage?.createdAt && (
              <p className="font-light text-gray-400 text-xs">
                {format(new Date(lastMessage.createdAt), "p")}
              </p>
            )}
          </div>
          <p
            className={clsx(
              `truncate text-sm`,
              hasSeen ? "text-gray-500" : "font-medium text-black",
            )}
          >
            {lastMessageText}
          </p>
        </div>
      </div>
    </div>
  );
}
