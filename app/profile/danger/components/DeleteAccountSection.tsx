"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { HiExclamationTriangle } from "react-icons/hi2";
import axios from "axios";
import Button from "@/components/Button";
import Modal from "@/components/modals/Modal";
import { authClient } from "@/lib/auth-client";
import { API_ROUTES, ROUTES } from "@/libs/routes";

interface DeleteAccountSectionProps {
  userEmail: string;
}

/**
 * Component for deleting the user account with confirmation.
 * Shows a warning and requires email confirmation before deletion.
 */
function DeleteAccountSection({ userEmail }: DeleteAccountSectionProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmEmail !== userEmail) {
      toast.error("Email does not match");
      return;
    }

    setIsLoading(true);

    try {
      // Call our custom API to delete user data
      const response = await axios.delete(API_ROUTES.ACCOUNT_DELETE);

      if (response.data.success) {
        // Sign out the user
        await authClient.signOut();
        toast.success("Account deleted successfully");
        router.push(ROUTES.AUTH);
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <div className="flex items-start gap-3">
            <HiExclamationTriangle className="h-6 w-6 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-rose-800">Delete Account</h3>
              <p className="text-sm text-rose-700 mt-1">
                Once you delete your account, there is no going back. This will permanently delete:
              </p>
              <ul className="text-sm text-rose-700 mt-2 list-disc list-inside space-y-1">
                <li>Your profile and account information</li>
                <li>All messages you have sent</li>
                <li>Your participation in conversations</li>
                <li>Any linked social accounts</li>
              </ul>
            </div>
          </div>
        </div>

        <Button danger onClick={() => setIsModalOpen(true)}>
          Delete Account
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-full">
              <HiExclamationTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Account
            </h2>
          </div>

          <p className="text-sm text-gray-600">
            This action cannot be undone. Please type{" "}
            <span className="font-medium text-gray-900">{userEmail}</span> to
            confirm.
          </p>

          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Enter your email to confirm"
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-rose-500 focus:border-rose-500
              text-sm
            "
          />

          <div className="flex justify-end gap-3">
            <Button
              secondary
              onClick={() => {
                setIsModalOpen(false);
                setConfirmEmail("");
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              danger
              onClick={handleDelete}
              disabled={isLoading || confirmEmail !== userEmail}
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default DeleteAccountSection;
