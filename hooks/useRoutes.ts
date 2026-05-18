import { usePathname } from "next/navigation";
import { HiChat } from "react-icons/hi";
import { HiUsers } from "react-icons/hi2";
import useConversation from "./useConversation";
import { ROUTES } from "@/libs/routes";

export interface SidebarRoute {
  label: string;
  href: string;
  icon: any;
  active: boolean;
  onClick?: () => void;
}

/**
 * Defines the routes displayed in the sidebar, including the label, href, icon, and active state.
 * @returns {SidebarRoute[]} An array of objects containing the route's label, href, icon, and active state.
 */
const useRoutes = (): SidebarRoute[] => {
  // retrieve the current URL pathname
  const pathname = usePathname();
  // retrieve the conversation ID
  const { conversationId } = useConversation();

  const routes: SidebarRoute[] = [
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
  ];

  return routes;
};

export default useRoutes;
