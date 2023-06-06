"use client";

import { User } from "@prisma/client";

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
const UserList: React.FC<UserListProps> = ({ items }) => {
  return (
    <aside
      className="
        fixed 
        inset-y-0 
        pb-20
        lg:pb-0
        lg:left-20 
        lg:w-80 
        lg:block
        overflow-y-auto 
        border-r 
        border-gray-200
        block w-full left-0
      "
    >
      <div className="px-5">
        <div className="flex-col">
          <div
            className="
              text-2xl 
              font-bold 
              text-neutral-800 
              py-4
            "
          >
            Clowns
          </div>
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
};

export default UserList;
