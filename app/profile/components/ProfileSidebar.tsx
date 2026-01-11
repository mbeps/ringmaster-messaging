"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiUser, HiShieldCheck, HiDevicePhoneMobile, HiLink, HiExclamationTriangle } from "react-icons/hi2";
import clsx from "clsx";
import { ROUTES } from "@/libs/routes";

export const profileNavItems = [
  {
    label: "Account",
    href: ROUTES.PROFILE_ACCOUNT,
    icon: HiUser,
    description: "Update your profile information",
  },
  {
    label: "Security",
    href: ROUTES.PROFILE_SECURITY,
    icon: HiShieldCheck,
    description: "Change your password",
  },
  {
    label: "Sessions",
    href: ROUTES.PROFILE_SESSIONS,
    icon: HiDevicePhoneMobile,
    description: "Manage active sessions",
  },
  {
    label: "Linked Accounts",
    href: ROUTES.PROFILE_ACCOUNTS,
    icon: HiLink,
    description: "Manage connected accounts",
  },
  {
    label: "Danger Zone",
    href: ROUTES.PROFILE_DANGER,
    icon: HiExclamationTriangle,
    description: "Delete your account",
    danger: true,
  },
];

/**
 * Sidebar navigation for profile pages.
 * Displays links to different profile sections: Account, Security, and Sessions.
 */
function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:block w-64 bg-white border-r min-h-full py-6 px-4 flex-col">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 px-3">
        Settings
      </h2>
      <ul className="space-y-1">
        {profileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const isDanger = "danger" in item && item.danger;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                  isActive && !isDanger && "bg-red-50 text-red-600",
                  isActive && isDanger && "bg-rose-50 text-rose-600",
                  !isActive && isDanger && "text-rose-600 hover:bg-rose-50",
                  !isActive && !isDanger && "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={clsx(
                    "h-5 w-5",
                    isActive && !isDanger && "text-red-500",
                    isDanger && "text-rose-500",
                    !isActive && !isDanger && "text-gray-400"
                  )}
                />
                <div>
                  <span className="font-medium">{item.label}</span>
                  <p
                    className={clsx(
                      "text-xs",
                      isActive && !isDanger && "text-red-500",
                      isDanger && "text-rose-500",
                      !isActive && !isDanger && "text-gray-500"
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default ProfileSidebar;
