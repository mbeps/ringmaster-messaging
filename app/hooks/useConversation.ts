import { useParams } from "next/navigation";
import { useMemo } from "react";

/**
 * Retrieves and manages the conversation ID from the URL parameters.
 * It uses Next.js's `useParams` hook to retrieve the URL parameters and returns an object containing `isOpen` and `conversationId` properties.
 * The `isOpen` property indicates whether a conversation is open (based on the existence of a conversation ID),
 * and the conversationId property holds the retrieved conversation ID.
 * @returns {object} - An object containing the `conversationId` and `isOpen`
 */
const useConversation = () => {
  const params = useParams(); // retrieve the URL parameters

  /**
   * Retrieves the conversation ID from the URL parameters.
   */
  const conversationId = useMemo(() => {
    // if there is no conversation ID, return an empty string
    if (!params?.conversationId) {
      return "";
    }

    // return conversation ID
    return params.conversationId as string;
  }, [params?.conversationId]);

  /**
   * Indicates whether a conversation is open (based on the existence of a conversation ID).
   * If there is a conversation ID, the conversation is open.
   * If there is no conversation ID, the conversation is not open.
   * @type {boolean}
   */
  const isOpen: boolean = useMemo(() => !!conversationId, [conversationId]);

  return useMemo(
    () => ({
      isOpen,
      conversationId,
    }),
    [isOpen, conversationId]
  );
};

export default useConversation;
