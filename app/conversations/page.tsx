"use client";

import clsx from "clsx";
import EmptyState from "@/components/empty-state";
import useConversation from "@/hooks/use-conversation";

/**
 * Renders the conversations page component.
 * Displays all the conversations the current user is having.
 *
 * @returns conversations page
 */
export default function ConversationsPage() {
  const { isOpen } = useConversation();

  return (
    <div
      className={clsx("h-full lg:block lg:pl-80", isOpen ? "block" : "hidden")}
    >
      <EmptyState />
    </div>
  );
}
