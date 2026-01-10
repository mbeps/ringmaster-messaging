import getCurrentUser from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";
import { ROUTES } from "@/libs/routes";
import DeleteAccountSection from "./components/DeleteAccountSection";

/**
 * Danger zone page for account deletion.
 */
export default async function DangerPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(ROUTES.AUTH);
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border border-rose-200 p-6">
        <h1 className="text-xl font-semibold text-rose-600">Danger Zone</h1>
        <p className="mt-1 text-sm text-gray-600">
          Irreversible and destructive actions.
        </p>
        <div className="mt-6">
          <DeleteAccountSection userEmail={currentUser.email} />
        </div>
      </div>
    </div>
  );
}
