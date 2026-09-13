import Link from "next/link";
import Button from "@/components/button";
import { ROUTES } from "@/config/routes";

/**
 * Contextual 404 page when a specific conversation ID is not found.
 * @returns conversation not-found component
 */
export default function ConversationNotFound() {
  return (
    <div className="h-full lg:pl-80">
      <div className="flex h-full flex-col items-center justify-center bg-gray-100 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="font-semibold text-red-500 text-sm uppercase tracking-wide">
            404
          </p>
          <h2 className="mt-2 font-bold text-2xl text-gray-900 tracking-tight sm:text-3xl">
            Conversation not found
          </h2>
          <p className="mt-2 max-w-md text-gray-600 text-sm">
            This conversation does not exist, may have been deleted, or you
            don&apos;t have access to it.
          </p>
          <div className="mt-6">
            <Link href={ROUTES.CONVERSATIONS.path}>
              <Button>Back to conversations</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
