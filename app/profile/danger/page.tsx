import { redirect } from "next/navigation";
import getCurrentUser from "@/actions/getCurrentUser";
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
      <div className="rounded-xl border border-rose-200 bg-white p-6 shadow-sm">
        <h1 className="font-semibold text-rose-600 text-xl">Danger Zone</h1>
        <p className="mt-1 text-gray-600 text-sm">
          Irreversible and destructive actions.
        </p>
        <div className="mt-6">
          <DeleteAccountSection userEmail={currentUser.email} />
        </div>
      </div>
    </div>
  );
}
