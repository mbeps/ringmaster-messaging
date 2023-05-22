"use client";

import { User } from "@prisma/client";

import useActiveList from "../hooks/useActiveList";
import Image from "next/image";

interface AvatarProps {
  user?: User;
}

/**
 * Avatar component for displaying a user's profile picture if it exists or a placeholder image.
 * It also displays a green dot if the user is active.
 *
 * @param { user: User}: user for the avatar
 * @returns (JSX.Element) : Avatar component
 */
const Avatar: React.FC<AvatarProps> = ({ user }) => {
  const { members } = useActiveList();
  const isActive = members.indexOf(user?.email!) !== -1;

  return (
    <div className="relative">
      <div
        className="
        relative 
        inline-block 
        rounded-full 
        overflow-hidden
        h-9 
        w-9 
        md:h-11 
        md:w-11
      "
      >
        <Image
          fill
          src={user?.image || "/images/placeholder.jpg"}
          alt="Avatar"
        />
      </div>
      {isActive && (
        <span
          className="
            absolute 
            block 
            rounded-full 
            bg-green-500 
            ring-2 
            ring-white 
            top-0 
            right-0
            h-2 
            w-2 
            md:h-3 
            md:w-3
          "
        />
      )}
    </div>
  );
};

export default Avatar;
