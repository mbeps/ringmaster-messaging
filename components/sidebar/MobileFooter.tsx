"use client";

import type { User } from "@prisma/client";
import useConversation from "@/hooks/useConversation";
import useRoutes from "@/hooks/useRoutes";
import MobileItem from "./MobileItem";
import ProfileDropdown from "./ProfileDropdown";

interface MobileFooterProps {
  currentUser: User;
}

/**
 * A footer component displayed at the button allowing the user to navigate through the app.
 * It displays:
 *  - User's conversations
 *  - All the contacts
 *  - Log out button
 * The footer is displayed on mobile.
 * @returns (JSX.Element): mobile footer component
 */
const MobileFooter = ({ currentUser }: MobileFooterProps) => {
  const routes = useRoutes();
  const { isOpen } = useConversation();

  if (isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 z-40 flex w-full items-center justify-between border-t bg-white lg:hidden">
      {routes.map((route) => (
        <MobileItem
          key={route.href}
          href={route.href}
          active={route.active}
          icon={route.icon}
          onClick={route.onClick}
        />
      ))}
      <div className="m-1 flex w-full items-center justify-center py-2.5">
        <ProfileDropdown currentUser={currentUser} align="right" />
      </div>
    </div>
  );
};

export default MobileFooter;
