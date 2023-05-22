"use client";

import useConversation from "@/app/hooks/useConversation";
import { FullConversationType } from "@/app/types";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import ConversationBox from "./ConversationBox";
import { User } from "@prisma/client";
import GroupChatModal from "@/app/components/modals/GroupChatModal";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/app/libs/pusher";
import { find } from "lodash";

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
const ConversationList: React.FC<ConversationListProps> = ({
  initialItems,
  users,
}) => {
  // gets the current session
  const session = useSession();
  const [items, setItems] = useState(initialItems);
  const router = useRouter();
  const { conversationId, isOpen } = useConversation();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  /**
   * The pusher key is the user's email.
   * This is used to subscribe to the user's channel.
   * When a new message is received, the pusher key is used to determine if the message is for the current user.
   * If the message is for the current user, the message will be displayed in real time.
   */
  const pusherKey = useMemo(() => {
    return session.data?.user?.email;
  }, [session.data?.user?.email]);

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
        })
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
  }, [pusherKey, router]);

  return (
    <>
      <GroupChatModal
        users={users}
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />
      <aside
        className={clsx(
          `
        fixed 
        inset-y-0 
        pb-20
        lg:pb-0
        lg:left-20 
        lg:w-80 
        lg:block
        overflow-y-auto 
        border-r 
        border-gray-200 
      `,
          isOpen ? "hidden" : "block w-full left-0"
        )}
      >
        <div className="px-5">
          <div className="flex justify-between mb-4 pt-4">
            <div className="text-2xl font-bold text-neutral-800">Messages</div>
            <div
              onClick={() => setIsGroupModalOpen(true)}
              className="
                rounded-md 
                p-2 
                bg-gray-100 
                text-gray-600 
                cursor-pointer 
                hover:opacity-75 
                transition
              "
            >
              <MdOutlineGroupAdd size={20} />
            </div>
          </div>
          {items.map((item) => (
            <ConversationBox
              key={item.id}
              data={item}
              selected={conversationId === item.id}
            />
          ))}
        </div>
      </aside>
    </>
  );
};

export default ConversationList;
