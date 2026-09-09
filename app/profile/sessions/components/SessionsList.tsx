"use client";

import { format } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  HiComputerDesktop,
  HiDevicePhoneMobile,
  HiTrash,
} from "react-icons/hi2";
import Button from "@/components/Button";
import { authClient } from "@/lib/auth-client";

type SessionData = Awaited<ReturnType<typeof authClient.listSessions>>["data"];
type Session = NonNullable<SessionData>[number];

/**
 * Component for displaying and managing active user sessions.
 * Allows users to view all active sessions and revoke them.
 */
function SessionsList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const currentSession = authClient.useSession();

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.listSessions();
      if (error) {
        toast.error("Failed to load sessions");
        return;
      }
      setSessions(data || []);
    } catch (_error) {
      toast.error("Failed to load sessions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleRevokeSession = async (sessionToken: string) => {
    setRevokingId(sessionToken);
    try {
      const { error } = await authClient.revokeSession({ token: sessionToken });
      if (error) {
        toast.error("Failed to revoke session");
        return;
      }
      toast.success("Session revoked successfully");
      fetchSessions();
    } catch (_error) {
      toast.error("Something went wrong");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOther = async () => {
    setIsLoading(true);
    try {
      const { error } = await authClient.revokeOtherSessions();
      if (error) {
        toast.error("Failed to revoke sessions");
        return;
      }
      toast.success("All other sessions revoked");
      fetchSessions();
    } catch (_error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const getDeviceIcon = (userAgent?: string | null) => {
    if (!userAgent) return HiComputerDesktop;
    const lowerAgent = userAgent.toLowerCase();
    if (
      lowerAgent.includes("mobile") ||
      lowerAgent.includes("android") ||
      lowerAgent.includes("iphone")
    ) {
      return HiDevicePhoneMobile;
    }
    return HiComputerDesktop;
  };

  const getDeviceName = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari")) return "Safari Browser";
    if (userAgent.includes("Edge")) return "Edge Browser";
    return "Unknown Browser";
  };

  if (isLoading && sessions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">Loading sessions...</div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.length > 1 && (
        <div className="flex justify-end">
          <Button danger onClick={handleRevokeAllOther} disabled={isLoading}>
            Sign out all other sessions
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {sessions.map((session) => {
          const DeviceIcon = getDeviceIcon(session.userAgent);
          const isCurrentSession =
            session.token === currentSession.data?.session?.token;

          return (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border bg-gray-50 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-white p-2">
                  <DeviceIcon className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {getDeviceName(session.userAgent)}
                    {isCurrentSession && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-green-700 text-xs">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Last active: {format(new Date(session.updatedAt), "PPp")}
                  </p>
                </div>
              </div>

              {!isCurrentSession && (
                <button
                  onClick={() => handleRevokeSession(session.token)}
                  disabled={revokingId === session.token}
                  className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                  title="Revoke session"
                >
                  <HiTrash className="h-5 w-5" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {sessions.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No active sessions found.
        </div>
      )}
    </div>
  );
}

export default SessionsList;
