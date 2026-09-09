"use client";

import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import type { Conversation, User } from "@prisma/client";
import { format } from "date-fns";
import { Fragment, useState } from "react";
import { IoClose, IoTrash } from "react-icons/io5";
import Avatar from "@/components/Avatar";
import AvatarGroup from "@/components/AvatarGroup";
import ConfirmModal from "@/components/modals/ConfirmModal";
import useActiveList from "@/hooks/useActiveList";
import useOtherUser from "@/hooks/useOtherUser";

interface ProfileDrawerProps {
  isOpen: boolean; // whether the drawer is open
  onClose: () => void; // function to close the drawer
  data: Conversation & {
    users: User[];
  }; // the conversation data and list of users
}

/**
 * The profile drawer component which opens from the side of the screen.
 * This component is used to display the profile of the other user or group.
 * For single user conversations, it displays :
 *  - the user's avatar
 *  - the user's name
 *  - the user's email
 *  - the date the user joined
 * For group conversations, it displays:
 *  - the group's avatar
 *  - the group's name
 *  - the number of members
 *  - the list of members
 * There is also a delete button which opens a confirmation modal.
 * @param {isOpen, onClose, data}: required props for the component
 * @returns (JSX.Element): the profile drawer component
 */
function ProfileDrawer({ isOpen, onClose, data }: ProfileDrawerProps) {
  const otherUser = useOtherUser(data);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { members } = useActiveList();
  const isActive = members.indexOf(otherUser.email!) !== -1;

  // Gets the date the other user joined
  const joinedDate = format(new Date(otherUser.createdAt), "PP");

  // Gets the title of the conversation
  const title = data.name || otherUser.name;

  // Gets the status text for the user or the number of members for the group
  const statusText = data.isGroup
    ? `${data.users.length} members`
    : isActive
      ? "Online"
      : "Offline";

  return (
    <>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      />
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="modal-backdrop transition-opacity" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full p-4 pl-10">
                <TransitionChild
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <DialogPanel className="pointer-events-auto w-screen max-w-md rounded-xl bg-white shadow-lg">
                    <div className="flex h-full flex-col overflow-y-scroll rounded-xl bg-white py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-end">
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                              onClick={onClose}
                            >
                              <span className="sr-only">Close panel</span>
                              <IoClose size={24} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        <div className="flex flex-col items-center">
                          <div className="mb-2">
                            {data.isGroup ? (
                              <AvatarGroup users={data.users} />
                            ) : (
                              <Avatar user={otherUser} />
                            )}
                          </div>
                          <div>{title}</div>
                          <div className="text-gray-500 text-sm">
                            {statusText}
                          </div>
                          <div className="my-8 flex gap-10">
                            <div
                              onClick={() => setIsConfirmModalOpen(true)}
                              className="flex cursor-pointer flex-col items-center gap-3 hover:opacity-75"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                                <IoTrash size={20} />
                              </div>
                              <div className="font-light text-neutral-600 text-sm">
                                Delete
                              </div>
                            </div>
                          </div>
                          <div className="w-full pt-5 pb-5 sm:px-0 sm:pt-0">
                            <dl className="space-y-8 px-4 sm:space-y-6 sm:px-6">
                              {data.isGroup && (
                                <div>
                                  <dt className="font-medium text-gray-500 text-sm sm:w-40 sm:shrink-0">
                                    Emails
                                  </dt>
                                  <dd className="mt-1 text-gray-900 text-sm sm:col-span-2">
                                    {data.users
                                      .map((user) => user.email)
                                      .join(", ")}
                                  </dd>
                                </div>
                              )}
                              {!data.isGroup && (
                                <div>
                                  <dt className="font-medium text-gray-500 text-sm sm:w-40 sm:shrink-0">
                                    Email
                                  </dt>
                                  <dd className="mt-1 text-gray-900 text-sm sm:col-span-2">
                                    {otherUser.email}
                                  </dd>
                                </div>
                              )}
                              {!data.isGroup && (
                                <>
                                  <hr />
                                  <div>
                                    <dt className="font-medium text-gray-500 text-sm sm:w-40 sm:shrink-0">
                                      Joined
                                    </dt>
                                    <dd className="mt-1 text-gray-900 text-sm sm:col-span-2">
                                      <time dateTime={joinedDate}>
                                        {joinedDate}
                                      </time>
                                    </dd>
                                  </div>
                                </>
                              )}
                            </dl>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
export default ProfileDrawer;
