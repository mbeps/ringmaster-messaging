import type { IconType } from "react-icons";

/**
 * Route item configuration for sidebar and mobile navigation.
 */
export interface RouteItem {
  label: string;
  href: string;
  icon: IconType;
  active: boolean;
  onClick?: () => void;
}

export type SidebarRoute = RouteItem;
