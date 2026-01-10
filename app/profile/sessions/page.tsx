import getCurrentUser from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";
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
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-xl font-semibold text-gray-900">Active Sessions</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your active sessions and sign out from other devices.
        </p>
        <div className="mt-6">
          <SessionsList />
        </div>
      </div>
    </div>
  );
}
