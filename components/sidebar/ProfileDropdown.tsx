"use client";

import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import { HiUser, HiArrowLeftOnRectangle } from "react-icons/hi2";
import Avatar from "../Avatar";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/libs/routes";

interface ProfileDropdownProps {
  currentUser: User;
}

/**
 * Profile dropdown menu displayed when clicking the user's avatar.
 * Provides options to navigate to profile settings and logout.
 *
 * @param currentUser - The current authenticated user
 * @returns Profile dropdown component
 */
function ProfileDropdown({ currentUser }: ProfileDropdownProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push(ROUTES.AUTH);
  };

  const handleProfileClick = () => {
    router.push(ROUTES.PROFILE);
  };

  return (
    <Menu as="div" className="relative">
      <MenuButton className="cursor-pointer hover:opacity-75 transition focus:outline-none">
        <Avatar user={currentUser} />
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className="
            absolute 
            left-0 
            bottom-full
            mb-2
            w-48 
            origin-bottom-left 
            rounded-lg 
            bg-white 
            shadow-lg 
            ring-1 
            ring-black/5 
            focus:outline-none
            z-50
          "
        >
          <div className="py-1">
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={handleProfileClick}
                  className={`
                    ${focus ? "bg-gray-100" : ""}
                    flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700
                  `}
                >
                  <HiUser className="h-5 w-5 text-gray-500" />
                  Profile
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <button
                  onClick={handleLogout}
                  className={`
                    ${focus ? "bg-gray-100" : ""}
                    flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600
                  `}
                >
                  <HiArrowLeftOnRectangle className="h-5 w-5 text-red-500" />
                  Logout
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

export default ProfileDropdown;
