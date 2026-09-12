import { usePathname } from "next/navigation";
import { HiChat } from "react-icons/hi";
import { HiUsers } from "react-icons/hi2";
import { ROUTES } from "@/config/routes";
import useConversation from "@/hooks/use-conversation";
import type { RouteItem } from "@/types/route/route-item";

/**
 * Defines the routes displayed in the sidebar, including the label, href, icon, and active state.
 * @returns {RouteItem[]} An array of objects containing the route's label, href, icon, and active state.
 */
const useRoutes = (): RouteItem[] => {
  // retrieve the current URL pathname
  const pathname = usePathname();
  // retrieve the conversation ID
  const { conversationId } = useConversation();

  const routes: RouteItem[] = [
    {
      label: "Chat",
      href: ROUTES.CONVERSATIONS.path,
      icon: HiChat,
      active: pathname === ROUTES.CONVERSATIONS.path || !!conversationId,
    },
    {
      label: "Users",
      href: ROUTES.USERS.path,
      icon: HiUsers,
      active: pathname === ROUTES.USERS.path,
    },
  ];

  return routes;
};

export default useRoutes;
