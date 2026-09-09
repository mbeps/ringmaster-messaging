"use client";

import type { User } from "@prisma/client";

import UserBox from "./UserBox";

interface UserListProps {
  items: User[];
}

/**
 * Displays a list of users who exist in the platform.
 * When a user is clicked, a conversation is created with that user.
 * @param {items}: a list of users that need to be displayed
 * @returns (JSX.Element): list of users
 */
function UserList({ items }: UserListProps) {
  return (
    <aside className="fixed inset-y-0 left-0 block w-full overflow-y-auto border-gray-200 border-r pb-20 lg:left-20 lg:block lg:w-80 lg:pb-0">
      <div className="px-5">
        <div className="flex-col">
          <div className="py-4 font-bold text-2xl text-neutral-800">Clowns</div>
        </div>
        {/* For each user it maps a clickable box */}
        <div className="space-y-1">
          {items.map((contact) => (
            <UserBox key={contact.id} data={contact} />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default UserList;
