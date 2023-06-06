"use client";

import { Conversation, User } from "@prisma/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { HiChevronLeft } from "react-icons/hi";

import useOtherUser from "@/hooks/useOtherUser";
import Avatar from "@/components/Avatar";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import ProfileDrawer from "./ProfileDrawer";
import AvatarGroup from "@/components/AvatarGroup";
import useActiveList from "@/hooks/useActiveList";

interface HeaderProps {
  conversation: Conversation & {
    users: User[];
  };
}

/**
 * Header component which displays:
 *  - Other users avatar, name and status
 *  - Name of the group, its avatar and number of members
 * Also contains an button to open the profile drawer which displays additional information about the conversation.
 * @param { conversation }: conversation data
 * @returns (JSX.Element): header component
 */
const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const otherUser = useOtherUser(conversation);
  // keep track of whether the drawer is open or not
  const [drawerOpen, setDrawerOpen] = useState(false);
  // list of active members
  const { members } = useActiveList();
  // check if the other user is active
  const isActive: boolean = members.indexOf(otherUser.email!) !== -1;

  /**
   * Status text to display in the header.
   * If the conversation is a group, then display the number of members in the group.
   * If the conversation is a one-to-one chat, then display the status of the other user.
   */
  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`;
    }

    return isActive ? "Online" : "Offline";
  }, [conversation.isGroup, conversation.users.length, isActive]);

  return (
    <>
      <ProfileDrawer
        data={conversation}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div
        className="
        bg-white 
        w-full 
        flex 
        border-b-[1px] 
        sm:px-4 
        py-3 
        px-4 
        lg:px-6 
        justify-between 
        items-center 
        shadow-sm
      "
      >
        <div className="flex gap-3 items-center">
          <Link
            href="/conversations"
            className="
            lg:hidden 
            block 
            text-red-500 
            hover:text-red-600 
            transition 
            cursor-pointer
          "
          >
            <HiChevronLeft size={32} />
          </Link>
          {conversation.isGroup ? (
            <AvatarGroup users={conversation.users} />
          ) : (
            <Avatar user={otherUser} />
          )}
          <div className="flex flex-col">
            <div className="font-bold">
              {conversation.name || otherUser.name}
            </div>

            <div className="text-sm font-light text-neutral-500">
              {statusText}
            </div>
          </div>
        </div>
        <HiEllipsisHorizontal
          onClick={() => setDrawerOpen(true)}
          size={32}
          className="
          text-red-500
          cursor-pointer
          hover:text-red-600
          transition
        "
        />
      </div>
    </>
  );
};

export default Header;
