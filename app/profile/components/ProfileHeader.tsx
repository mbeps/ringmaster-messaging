"use client";

import { useRouter } from "next/navigation";
import { HiArrowLeft, HiBars3 } from "react-icons/hi2";
import { ROUTES } from "@/libs/routes";

interface ProfileHeaderProps {
  onMenuClick?: () => void;
}

/**
 * Header component for profile pages.
 * Displays a back button to return to conversations.
 */
function ProfileHeader({ onMenuClick }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden -ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <span className="sr-only">Open menu</span>
          <HiBars3 className="w-6 h-6" />
        </button>
        <button
          onClick={() => router.push(ROUTES.CONVERSATIONS)}
          className="
            flex items-center gap-2 text-gray-600 hover:text-gray-900 
            transition rounded-lg px-3 py-2 hover:bg-gray-100
          "
        >
          <HiArrowLeft className="h-5 w-5" />
          <span className="font-medium hidden sm:inline">Back to Conversations</span>
          <span className="font-medium sm:hidden">Back</span>
        </button>
      </div>
    </header>
  );
}

export default ProfileHeader;
