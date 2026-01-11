"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { HiXMark } from "react-icons/hi2";
import clsx from "clsx";
import { profileNavItems } from "./ProfileSidebar";

interface MobileProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileProfileSidebar({
  isOpen,
  onClose,
}: MobileProfileSidebarProps) {
  const pathname = usePathname();

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 md:hidden" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </TransitionChild>

        <div className="fixed inset-0 flex">
          <TransitionChild
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
              <TransitionChild
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-200 hover:text-white"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <HiXMark className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
              </TransitionChild>
              
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {profileNavItems.map((item) => {
                          const isActive = pathname === item.href;
                          const isDanger = "danger" in item && item.danger;
                          
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className={clsx(
                                  "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
                                  isActive && !isDanger && "bg-gray-50 text-red-600",
                                  isActive && isDanger && "bg-rose-50 text-rose-600",
                                  !isActive && isDanger && "text-rose-600 hover:bg-rose-50",
                                  !isActive && !isDanger && "text-gray-700 hover:text-red-600 hover:bg-gray-50"
                                )}
                              >
                                <item.icon
                                  className={clsx(
                                    "h-6 w-6 shrink-0",
                                    isActive && !isDanger && "text-red-600",
                                    isDanger && "text-rose-600",
                                    !isActive && !isDanger && "text-gray-400 group-hover:text-red-600"
                                  )}
                                  aria-hidden="true"
                                />
                                {item.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
