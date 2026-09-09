"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { HiPlus, HiTrash } from "react-icons/hi2";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/libs/routes";

type AccountData = Awaited<ReturnType<typeof authClient.listAccounts>>["data"];
type Account = NonNullable<AccountData>[number];

const supportedProviders = [
  {
    id: "github",
    name: "GitHub",
    icon: FaGithub,
    color: "text-gray-900",
    bgColor: "bg-gray-100",
  },
  {
    id: "google",
    name: "Google",
    icon: FaGoogle,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
];

/**
 * Component for displaying and managing linked social accounts.
 * Allows users to link or unlink social providers.
 */
function LinkedAccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.listAccounts();
      if (error) {
        toast.error("Failed to load accounts");
        return;
      }
      setAccounts(data || []);
    } catch (_error) {
      toast.error("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleLinkAccount = async (providerId: string) => {
    setActionLoading(providerId);
    try {
      await authClient.linkSocial({
        provider: providerId as "github" | "google",
        callbackURL: ROUTES.PROFILE.accounts,
      });
    } catch (_error) {
      toast.error("Failed to link account");
      setActionLoading(null);
    }
  };

  const handleUnlinkAccount = async (providerId: string) => {
    // Prevent unlinking if it's the only account
    if (accounts.length <= 1) {
      toast.error("You must have at least one linked account");
      return;
    }

    const accountToUnlink = accounts.find(
      (acc) => acc.providerId === providerId,
    );
    if (!accountToUnlink) {
      toast.error("Account not found");
      return;
    }

    setActionLoading(providerId);
    try {
      const { error } = await authClient.unlinkAccount({
        accountId: accountToUnlink.accountId,
      });

      if (error) {
        toast.error(error.message || "Failed to unlink account");
        return;
      }

      toast.success("Account unlinked successfully");
      fetchAccounts();
    } catch (_error) {
      toast.error("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  const isProviderLinked = (providerId: string) => {
    return accounts.some((acc) => acc.providerId === providerId);
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">Loading accounts...</div>
    );
  }

  return (
    <div className="space-y-4">
      {supportedProviders.map((provider) => {
        const isLinked = isProviderLinked(provider.id);
        const isCurrentLoading = actionLoading === provider.id;

        return (
          <div
            key={provider.id}
            className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg p-2 ${provider.bgColor}`}>
                <provider.icon className={`h-6 w-6 ${provider.color}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{provider.name}</p>
                <p className="text-gray-500 text-sm">
                  {isLinked ? "Connected" : "Not connected"}
                </p>
              </div>
            </div>

            {isLinked ? (
              <button
                onClick={() => handleUnlinkAccount(provider.id)}
                disabled={isCurrentLoading || accounts.length <= 1}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-red-600 text-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                title={
                  accounts.length <= 1
                    ? "Cannot unlink the only account"
                    : "Unlink account"
                }
              >
                <HiTrash className="h-4 w-4" />
                Unlink
              </button>
            ) : (
              <button
                onClick={() => handleLinkAccount(provider.id)}
                disabled={isCurrentLoading}
                className="flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-gray-700 text-sm transition hover:bg-gray-100 disabled:opacity-50"
              >
                <HiPlus className="h-4 w-4" />
                Link
              </button>
            )}
          </div>
        );
      })}

      <p className="mt-4 text-gray-500 text-xs">
        Linked accounts can be used to sign in to your account.
      </p>
    </div>
  );
}

export default LinkedAccountsList;
