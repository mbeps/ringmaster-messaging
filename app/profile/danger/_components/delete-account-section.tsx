"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { HiExclamationTriangle } from "react-icons/hi2";
import Button from "@/components/button";
import Modal from "@/components/modals/modal";
import { API_ROUTES, ROUTES } from "@/config/routes";
import { authClient } from "@/lib/auth-client";

interface DeleteAccountSectionProps {
  userEmail: string;
}

/**
 * Component for deleting the user account with confirmation.
 * Shows a warning and requires email confirmation before deletion.
 */
export default function DeleteAccountSection({
  userEmail,
}: DeleteAccountSectionProps) {
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
      const response = await axios.delete(API_ROUTES.ACCOUNT.delete);

      if (response.data.success) {
        // Sign out the user
        await authClient.signOut();
        toast.success("Account deleted successfully");
        router.push(ROUTES.AUTH.path);
      }
    } catch (_error) {
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <HiExclamationTriangle className="mt-0.5 h-6 w-6 shrink-0 text-rose-500" />
            <div>
              <h3 className="font-medium text-rose-800">Delete Account</h3>
              <p className="mt-1 text-rose-700 text-sm">
                Once you delete your account, there is no going back. This will
                permanently delete:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-rose-700 text-sm">
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
            <div className="rounded-full bg-rose-100 p-2">
              <HiExclamationTriangle className="h-6 w-6 text-rose-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-lg">
              Delete Account
            </h2>
          </div>

          <p className="text-gray-600 text-sm">
            This action cannot be undone. Please type{" "}
            <span className="font-medium text-gray-900">{userEmail}</span> to
            confirm.
          </p>

          <input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            placeholder="Enter your email to confirm"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500"
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
