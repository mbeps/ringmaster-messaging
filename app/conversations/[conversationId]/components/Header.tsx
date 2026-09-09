"use client";

import type { Conversation, User } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import Avatar from "@/components/Avatar";
import AvatarGroup from "@/components/AvatarGroup";
import useActiveList from "@/hooks/useActiveList";
import useOtherUser from "@/hooks/useOtherUser";
import { ROUTES } from "@/libs/routes";
import ProfileDrawer from "./ProfileDrawer";

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
function Header({ conversation }: HeaderProps) {
  const otherUser = useOtherUser(conversation);
  // keep track of whether the drawer is open or not
  const [drawerOpen, setDrawerOpen] = useState(false);
  // list of active members
  const { members } = useActiveList();
  // check if the other user is active
  const isActive: boolean = members.indexOf(otherUser.email!) !== -1;

  // Status text to display in the header
  const statusText = conversation.isGroup
    ? `${conversation.users.length} members`
    : isActive
      ? "Online"
      : "Offline";

  return (
    <>
      <ProfileDrawer
        data={conversation}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <div className="flex w-full items-center justify-between border-b bg-white px-4 py-3 shadow-xs sm:px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.CONVERSATIONS.path}
            className="block cursor-pointer text-red-500 transition hover:text-red-600 lg:hidden"
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

            <div className="font-light text-neutral-500 text-sm">
              {statusText}
            </div>
          </div>
        </div>
        <HiEllipsisHorizontal
          onClick={() => setDrawerOpen(true)}
          size={32}
          className="cursor-pointer text-red-500 transition hover:text-red-600"
        />
      </div>
    </>
  );
}

export default Header;
