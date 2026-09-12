"use client";

import type { User } from "@prisma/client";
import MobileItem from "@/components/sidebar/mobile-item";
import ProfileDropdown from "@/components/sidebar/profile-dropdown";
import useConversation from "@/hooks/use-conversation";
import useRoutes from "@/hooks/use-routes";

interface MobileFooterProps {
  currentUser: User;
}

/**
 * A footer component displayed at the bottom allowing the user to navigate through the app.
 * It displays:
 *  - User's conversations
 *  - All the contacts
 *  - Log out button
 * The footer is displayed on mobile.
 * @returns mobile footer component
 */
export default function MobileFooter({ currentUser }: MobileFooterProps) {
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
}
