import getCurrentUser from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";
import { ROUTES } from "@/libs/routes";
import LinkedAccountsList from "./components/LinkedAccountsList";

/**
 * Linked accounts page for managing connected social accounts.
 */
export default async function AccountsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(ROUTES.AUTH);
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-xl font-semibold text-gray-900">Linked Accounts</h1>
        <p className="mt-1 text-sm text-gray-600">
          Connect your social accounts for easier sign-in.
        </p>
        <div className="mt-6">
          <LinkedAccountsList />
        </div>
      </div>
    </div>
  );
}
