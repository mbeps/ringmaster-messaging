"use client";

import { useRouter } from "next/navigation";
import { HiArrowLeft, HiBars3 } from "react-icons/hi2";
import { ROUTES } from "@/config/routes";

interface ProfileHeaderProps {
  onMenuClick?: () => void;
}

/**
 * Header component for profile pages.
 * Displays a back button to return to conversations.
 */
export default function ProfileHeader({ onMenuClick }: ProfileHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="-ml-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
        >
          <span className="sr-only">Open menu</span>
          <HiBars3 className="h-6 w-6" />
        </button>
        <button
          onClick={() => router.push(ROUTES.CONVERSATIONS.path)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
        >
          <HiArrowLeft className="h-5 w-5" />
          <span className="hidden font-medium sm:inline">
            Back to Conversations
          </span>
          <span className="font-medium sm:hidden">Back</span>
        </button>
      </div>
    </header>
  );
}
