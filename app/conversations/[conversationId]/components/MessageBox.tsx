"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { FullMessageType } from "@/app/types";

import Avatar from "@/components/Avatar";
import ImageModal from "./ImageModal";

interface MessageBoxProps {
  data: FullMessageType;
  isLast?: boolean;
}

/**
 * Message box component which displays the message and avatar.
 * If the message is an image, it will display the image instead.
 * If the message is text, it will display the text inside the bubble.
 * If the message is the last message and is owned by the user, it will display the seen list.
 * If the sender is the user, it will display the message on the right side and the color will be red.
 * If the receiver is the user, it will display the message on the left side and the color will be gray.
 * @param {data, isLast}: message box props
 * @returns (JSX.Element): message box component
 */
const MessageBox: React.FC<MessageBoxProps> = ({ data, isLast }) => {
  // gets the current session
  const session = useSession();
  // keeps track of whether the image modal is open or not
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // checks if the message was sent by the current user
  const isOwn = session.data?.user?.email === data?.sender?.email;
  // creates a string for the people who have seen the message
  const seenList = (data.seen || [])
    .filter((user) => user.email !== data?.sender?.email)
    .map((user) => user.name)
    .join(", ");

  const container = clsx("flex gap-3 p-4", isOwn && "justify-end");
  const avatar = clsx(isOwn && "order-2");
  const body = clsx("flex flex-col gap-2", isOwn && "items-end");
  const message = clsx(
    "text-sm w-fit overflow-hidden",
    isOwn ? "bg-red-700 text-white" : "bg-gray-100",
    data.image ? "rounded-md p-0" : "rounded-lg py-2 px-3"
  );

  return (
    <div className={container}>
      <div className={avatar}>
        <Avatar user={data.sender} />
      </div>
      <div className={body}>
        <div className="flex items-center gap-1">
          <div className="text-sm text-gray-500">{data.sender.name}</div>
          <div className="text-xs text-gray-400">
            {format(new Date(data.createdAt), "p")}
          </div>
        </div>
        <div className={message}>
          <ImageModal
            src={data.image}
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
          />
          {data.image ? (
            <Image
              alt="Image"
              height="288"
              width="288"
              onClick={() => setImageModalOpen(true)}
              src={data.image}
              className="
                object-cover 
                cursor-pointer 
                hover:scale-110 
                transition 
                translate
              "
            />
          ) : (
            <div>{data.body}</div>
          )}
        </div>
        {isLast && isOwn && seenList.length > 0 && (
          <div
            className="
            text-xs 
            font-light 
            text-gray-500
            "
          >
            {`Seen by ${seenList}`}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBox;
