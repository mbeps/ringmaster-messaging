"use client";

import clsx from "clsx";
import EmptyState from "@/components/EmptyState";
import useConversation from "../../hooks/useConversation";

/**
 * Renders the conversations page component.
 * Displays all the conversations the current user is having.
 *
 * @returns (JSX.Element): conversions page
 */
const Home = () => {
  const { isOpen } = useConversation();

  return (
    <div
      className={clsx("h-full lg:block lg:pl-80", isOpen ? "block" : "hidden")}
    >
      <EmptyState />
    </div>
  );
};

export default Home;
