import type { IconType } from "react-icons";
import {
  HiDevicePhoneMobile,
  HiExclamationTriangle,
  HiLink,
  HiShieldCheck,
  HiUser,
} from "react-icons/hi2";
import { ROUTES } from "@/config/routes";

export interface ProfileNavItem {
  label: string;
  href: string;
  icon: IconType;
  description: string;
  danger?: boolean;
}

/**
 * Navigation items for profile settings pages.
 */
export const PROFILE_NAV_ITEMS: readonly ProfileNavItem[] = [
  {
    label: "Account",
    href: ROUTES.PROFILE.account,
    icon: HiUser,
    description: "Update your profile information",
  },
  {
    label: "Security",
    href: ROUTES.PROFILE.security,
    icon: HiShieldCheck,
    description: "Change your password",
  },
  {
    label: "Sessions",
    href: ROUTES.PROFILE.sessions,
    icon: HiDevicePhoneMobile,
    description: "Manage active sessions",
  },
  {
    label: "Linked Accounts",
    href: ROUTES.PROFILE.accounts,
    icon: HiLink,
    description: "Manage connected accounts",
  },
  {
    label: "Danger Zone",
    href: ROUTES.PROFILE.danger,
    icon: HiExclamationTriangle,
    description: "Delete your account",
    danger: true,
  },
] as const;
