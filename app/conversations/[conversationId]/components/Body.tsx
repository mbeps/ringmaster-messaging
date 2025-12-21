"use client";

import axios from "axios";
import { useEffect, useRef, useState } from "react";
import useConversation from "@/hooks/useConversation";
import { FullMessageType } from "@/types";
import MessageBox from "./MessageBox";
import { pusherClient } from "@/libs/pusher";
import { find } from "lodash";
import { API_ROUTES } from "@/libs/routes";

interface BodyProps {
  initialMessages: FullMessageType[];
}

/**
 * Body component for conversation page which displays an initial list of messages.
 * These messages are updated in real time as they are sent and received.
 * User can see who views the message which is also updated in real time.
 * @param {initialMessages}: messages in conversation
 * @returns (JSX.Element): Body component with messages
 */
function Body({ initialMessages }: BodyProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);
  const { conversationId } = useConversation();

  /**
   * Marks the message as seen when the conversation is opened.
   */
  useEffect(() => {
    axios.post(API_ROUTES.CONVERSATION_SEEN(conversationId)); // mark as seen
  }, [conversationId]);

  /**
   * Updates the messages when new messages are received in real time.
   * Automatically marks a message as seen when it is received if the conversation is open.
   */
  useEffect(() => {
    pusherClient.subscribe(conversationId); // subscribe to conversation channel
    bottomRef?.current?.scrollIntoView(); // scroll to bottom when conversation is opened

    const messageHandler = (message: FullMessageType) => {
      axios.post(API_ROUTES.CONVERSATION_SEEN(conversationId)); // mark as seen when new message is received while conversation is open

      setMessages((current) => {
        // if message already exists, update it
        if (find(current, { id: message.id })) {
          return current; // prevent duplicates
        }

        return [...current, message];
      });

      bottomRef?.current?.scrollIntoView(); // scroll to bottom when new message is received
    };

    // adds the message to the list of messages so that it can be displayed in real time
    const updateMessageHandler = (newMessage: FullMessageType) => {
      setMessages((current) =>
        current.map((currentMessage) => {
          if (currentMessage.id === newMessage.id) {
            return newMessage;
          }

          return currentMessage;
        })
      );
    };

    pusherClient.bind("messages:new", messageHandler); // listen for new messages
    pusherClient.bind("message:update", updateMessageHandler); // listen for message updates

    return () => {
      pusherClient.unsubscribe(conversationId); // unsubscribe from conversation channel
      pusherClient.unbind("messages:new", messageHandler); // unbind event listener
      pusherClient.unbind("message:update", updateMessageHandler); // unbind event listener
    };
  }, [conversationId]);

  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message, i) => (
        <MessageBox
          isLast={i === messages.length - 1}
          key={message.id}
          data={message}
        />
      ))}
      <div className="pt-24" ref={bottomRef} />
    </div>
  );
};

export default Body;
