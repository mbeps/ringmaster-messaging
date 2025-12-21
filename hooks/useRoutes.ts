import { usePathname } from "next/navigation";
import { HiChat } from "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2";
import { signOut } from "next-auth/react";
import useConversation from "./useConversation";

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
      href: "/conversations",
      icon: HiChat,
      active: pathname === "/conversations" || !!conversationId,
    },
    {
      label: "Users",
      href: "/users",
      icon: HiUsers,
      active: pathname === "/users",
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
