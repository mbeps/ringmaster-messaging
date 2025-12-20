import { usePathname } from "next/navigation";
import { HiChat } from "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2";
import { signOut } from "next-auth/react";
import useConversation from "./useConversation";
import { ROUTES } from "@/libs/routes";

/**
 * Defines the routes displayed in the sidebar, including the label, href, icon, and active state.
 * @returns {Array} An array of objects containing the route's label, href, icon, and active state.
 */
const useRoutes = () => {
  // retrieve the current URL pathname
  const pathname = usePathname();
  // retrieve the conversation ID
  const { conversationId } = useConversation();

  const routes = [
    {
      label: "Chat",
      href: ROUTES.CONVERSATIONS,
      icon: HiChat,
      active: pathname === ROUTES.CONVERSATIONS || !!conversationId,
    },
    {
      label: "Users",
      href: ROUTES.USERS,
      icon: HiUsers,
      active: pathname === ROUTES.USERS,
    },
    {
      label: "Logout",
      onClick: () => signOut(),
      href: "#", // automatically redirected to login page due to middleware protection
      icon: HiArrowLeftOnRectangle,
    },
  ];

  return routes;
};

export default useRoutes;
