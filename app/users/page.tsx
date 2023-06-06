import EmptyState from "@/components/EmptyState";

/**
 * Displays empty state for the people page.
 * When a user is clicked, a conversation is created with that user.
 * @returns (JSX.Element): list of users
 */
const People = () => {
  return (
    <div className="hidden lg:block lg:pl-80 h-full">
      <EmptyState />
    </div>
  );
};

export default People;
