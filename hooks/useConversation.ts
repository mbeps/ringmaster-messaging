import { useParams } from "next/navigation";

/**
 * Retrieves and manages the conversation ID from the URL parameters.
 * It uses Next.js's `useParams` hook to retrieve the URL parameters and returns an object containing `isOpen` and `conversationId` properties.
 * The `isOpen` property indicates whether a conversation is open (based on the existence of a conversation ID),
 * and the conversationId property holds the retrieved conversation ID.
 * @returns {object} - An object containing the `conversationId` and `isOpen`
 */
const useConversation = () => {
  const params = useParams();

  // Retrieve the conversation ID from the URL parameters
  const conversationId = !params?.conversationId 
    ? "" 
    : params.conversationId as string;

  // Indicates whether a conversation is open (based on the existence of a conversation ID)
  const isOpen = !!conversationId;

  return {
    isOpen,
    conversationId,
  };
};

export default useConversation;
