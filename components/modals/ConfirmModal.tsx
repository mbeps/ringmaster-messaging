"use client";

import { DialogTitle } from "@headlessui/react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FiAlertTriangle } from "react-icons/fi";
import Button from "@/components/Button";
import Modal from "@/components/modals/Modal";
import useConversation from "@/hooks/useConversation";
import { API_ROUTES, ROUTES } from "@/libs/routes";

interface ConfirmModalProps {
  isOpen?: boolean; // when the modal is open
  onClose: () => void; // when the modal is closed
}

/**
 * Modal to confirm the deletion of a conversation.
 * It asks the user whether they are certain they want to delete the conversation.
 * If the user confirms, the conversation is deleted.
 * If the user cancels, the modal is closed.
 *
 * @param param0 { isOpen, onClose}: when the modal is open, when the modal is closed
 * @returns (JSX.Element): confirmation modal component
 */
function ConfirmModal({ isOpen, onClose }: ConfirmModalProps) {
  const router = useRouter();
  // conversation to be deleted
  const { conversationId } = useConversation();
  // loading the deletion of the conversation
  const [isLoading, setIsLoading] = useState(false);

  // Deletes the desired conversation
  const onDelete = () => {
    setIsLoading(true); // start loading

    axios
      .delete(API_ROUTES.CONVERSATION_ID(conversationId)) // delete the conversation
      .then(() => {
        onClose(); // close the modal
        router.push(ROUTES.CONVERSATIONS); // redirect to the conversations page
        router.refresh(); // refresh the page
      })
      .catch(() => toast.error("Something went wrong!")) // if there is an error, display an error message
      .finally(() => setIsLoading(false)); // stop loading
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          <FiAlertTriangle
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
          <DialogTitle
            as="h3"
            className="font-semibold text-base text-gray-900 leading-6"
          >
            Delete conversation
          </DialogTitle>
          <div className="mt-2">
            <p className="text-gray-500 text-sm">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <Button disabled={isLoading} danger onClick={onDelete}>
          Delete
        </Button>
        <Button disabled={isLoading} secondary onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
