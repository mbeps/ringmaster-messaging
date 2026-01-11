"use client";

import useRoutes from "@/hooks/useRoutes";
import { User } from "@prisma/client";
import DesktopItem from "./DesktopItem";
import ProfileDropdown from "./ProfileDropdown";

interface DesktopSidebarProps {
  currentUser: User;
}

/**
 * A sidebar component displayed on the side allowing the user to navigate through the app.
 * It displays:
 *  - User's conversations
 *  - All the contacts
 *  - Log out button
 *  - User's avatar (opens a dropdown menu with profile and logout options)
 * The sidebar is displayed on desktop.
 *
 * @param {User} currentUser: current user
 * @returns (JSX.Element): desktop sidebar component
 */
function DesktopSidebar({ currentUser }: DesktopSidebarProps) {
  const routes = useRoutes();

  return (
    <div
      className="
        hidden 
        lg:fixed 
        lg:inset-y-0 
        lg:left-0 
        lg:z-40 
        lg:w-20 
        xl:px-6
        lg:bg-white 
        lg:border-r
        lg:pb-4
        lg:flex
        lg:flex-col
        justify-between
      "
    >
      <nav className="mt-4 flex flex-col justify-between">
        <ul role="list" className="flex flex-col items-center space-y-1">
          {routes.map((item) => (
            <DesktopItem
              key={item.label}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={item.active}
              onClick={item.onClick}
            />
          ))}
        </ul>
      </nav>
      <nav className="mt-4 flex flex-col justify-between items-center overflow-visible">
        <ProfileDropdown currentUser={currentUser} />
      </nav>
    </div>
  );
}

export default DesktopSidebar;

