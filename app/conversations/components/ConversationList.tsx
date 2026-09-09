"use client";

import type { User } from "@prisma/client";
import clsx from "clsx";
import { find } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import GroupChatModal from "@/components/modals/GroupChatModal";
import useConversation from "@/hooks/useConversation";
import { authClient } from "@/lib/auth-client";
import { pusherClient } from "@/libs/pusher";
import type { FullConversationType } from "@/types";
import ConversationBox from "./ConversationBox";

// the initial data will be updated using pusher in real time
interface ConversationListProps {
  initialItems: FullConversationType[];
  users: User[];
}

/**
 * Displays the list of conversations that a user has.
 *
 * @param {initialItems, users}: ConversationListProps
 * @returns (JSX.Element): list of conversations
 */
function ConversationList({ initialItems, users }: ConversationListProps) {
  // gets the current session
  const session = authClient.useSession();
  const [items, setItems] = useState(initialItems);
  const _router = useRouter();
  const { conversationId, isOpen } = useConversation();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // The pusher key is the user's email
  const pusherKey = session.data?.user?.email;

  /**
   * Handles updates, new conversations, and conversation removals, and cleans up the subscription and event listeners when the component unmounts.
   * When the component unmounts, it unsubscribes from the Pusher channel and removes the event listeners.
   */
  useEffect(() => {
    // checks if there is a pusher key
    if (!pusherKey) {
      return;
    }

    // subscribe to the user's channel
    pusherClient.subscribe(pusherKey);

    /**
     * Called when a conversation is updated.
     * Updates the items state by mapping through the current conversations and replacing the one with the updated conversation.
     *
     * @param conversation (FullConversationType): the conversation that was updated
     */
    const updateHandler = (conversation: FullConversationType) => {
      setItems((current) =>
        current.map((currentConversation) => {
          // loop through the conversations
          if (currentConversation.id === conversation.id) {
            // if the conversation already exists
            return {
              ...currentConversation,
              messages: conversation.messages,
            }; // update the messages
          }

          return currentConversation;
        }),
      );
    };

    /**
     * Called when a new conversation is received. I
     * Updates the items state by adding the new conversation to the beginning of the array if it doesn't already exist.
     *
     * @param conversation (FullConversationType): the conversation that was added
     */
    const newHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        if (find(current, { id: conversation.id })) {
          return current;
        } // if the conversation already exists, do not add it to the list

        return [conversation, ...current];
      });
    };

    /**
     * called when a conversation is removed.
     * Updates the items state by removing the conversation from the array.
     *
     * @param conversation (FullConversationType): the conversation that was removed
     */
    const removeHandler = (conversation: FullConversationType) => {
      setItems((current) => {
        return [...current.filter((convo) => convo.id !== conversation.id)];
      });
    };

    pusherClient.bind("conversation:update", updateHandler);
    pusherClient.bind("conversation:new", newHandler);
    pusherClient.bind("conversation:remove", removeHandler);
  }, [pusherKey]);

  return (
    <>
      <GroupChatModal
        users={users}
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
      <aside
        className={clsx(
          `fixed inset-y-0 overflow-y-auto border-gray-200 border-r pb-20 lg:left-20 lg:block lg:w-80 lg:pb-0`,
          isOpen ? "hidden" : "left-0 block w-full",
        )}
      >
        <div className="px-5">
          <div className="mb-4 flex justify-between pt-4">
            <div className="font-bold text-2xl text-neutral-800">Messages</div>
            <div
              onClick={() => setIsGroupModalOpen(true)}
              className="cursor-pointer rounded-md bg-gray-100 p-2 text-gray-600 transition hover:opacity-75"
            >
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          <div className="space-y-1">
            {items.map((item) => (
              <ConversationBox
                key={item.id}
                data={item}
                selected={conversationId === item.id}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

export default ConversationList;
