import EmptyState from "@/components/empty-state";

/**
 * Displays empty state for the people page.
 * When a user is clicked, a conversation is created with that user.
 * @returns (JSX.Element): list of users
 */
const People = () => {
  return (
    <div className="hidden h-full lg:block lg:pl-80">
      <EmptyState />
    </div>
  );
};

export default People;
