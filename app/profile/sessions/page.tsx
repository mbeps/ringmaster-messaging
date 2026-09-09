import { redirect } from "next/navigation";
import getCurrentUser from "@/actions/getCurrentUser";
import { ROUTES } from "@/libs/routes";
import SessionsList from "./components/SessionsList";

/**
 * Sessions management page for viewing and revoking active sessions.
 */
export default async function SessionsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(ROUTES.AUTH);
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="font-semibold text-gray-900 text-xl">Active Sessions</h1>
        <p className="mt-1 text-gray-600 text-sm">
          Manage your active sessions and sign out from other devices.
        </p>
        <div className="mt-6">
          <SessionsList />
        </div>
      </div>
    </div>
  );
}
