"use client";

import { useRouter } from "next/navigation";
import { HiArrowLeft } from "react-icons/hi2";
import { ROUTES } from "@/libs/routes";

/**
 * Header component for profile pages.
 * Displays a back button to return to conversations.
 */
function ProfileHeader() {
  const router = useRouter();

  return (
    <header className="h-16 bg-white border-b flex items-center px-6">
      <button
        onClick={() => router.push(ROUTES.CONVERSATIONS)}
        className="
          flex items-center gap-2 text-gray-600 hover:text-gray-900 
          transition rounded-lg px-3 py-2 hover:bg-gray-100
        "
      >
        <HiArrowLeft className="h-5 w-5" />
        <span className="font-medium">Back to Conversations</span>
      </button>
    </header>
  );
}

export default ProfileHeader;
