"use client";

import type { User } from "@prisma/client";
import Image from "next/image";
import { ASSETS } from "@/config/assets";
import useActiveList from "@/hooks/use-active-list";

interface AvatarProps {
  user?: User;
}

/**
 * Avatar component for displaying a user's profile picture if it exists or a placeholder image.
 * It also displays a green dot if the user is active.
 *
 * @param { user: User}: user for the avatar
 * @returns Avatar component
 */
export default function Avatar({ user }: AvatarProps) {
  const { members } = useActiveList();
  const isActive = user?.email ? members.indexOf(user.email) !== -1 : false;

  return (
    <div className="relative">
      <div className="relative inline-block h-9 w-9 overflow-hidden rounded-full md:h-11 md:w-11">
        <Image
          fill
          src={user?.image || ASSETS.AVATARS.FALLBACK.path}
          alt={ASSETS.AVATARS.FALLBACK.alt}
        />
      </div>
      {isActive && (
        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white md:h-3 md:w-3" />
      )}
    </div>
  );
}
