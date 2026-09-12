"use client";

import type { User } from "@prisma/client";
import Image from "next/image";
import { ASSETS } from "@/config/assets";

interface AvatarGroupProps {
  users?: User[];
}

/**
 * Avatar group component which displays the first 3 users from the list.
 * @param { users = [] }: list of users in the group
 * @returns avatar group component with 3 users from the list
 */
export default function AvatarGroup({ users = [] }: AvatarGroupProps) {
  const slicedUsers = users.slice(0, 3);

  const positionMap = {
    0: "top-0 left-[12px]",
    1: "bottom-0",
    2: "bottom-0 right-0",
  };

  return (
    <div className="relative h-11 w-11">
      {slicedUsers.map((user, index) => (
        <div
          key={user.id}
          className={`absolute inline-block h-[21px] w-[21px] overflow-hidden rounded-full ${positionMap[index as keyof typeof positionMap]}
          `}
        >
          <Image
            fill
            src={user?.image || ASSETS.AVATARS.FALLBACK.path}
            alt={ASSETS.AVATARS.FALLBACK.alt}
          />
        </div>
      ))}
    </div>
  );
}
