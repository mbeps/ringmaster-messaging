import { redirect } from "next/navigation";
import getCurrentUser from "@/actions/getCurrentUser";
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
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="font-semibold text-gray-900 text-xl">Linked Accounts</h1>
        <p className="mt-1 text-gray-600 text-sm">
          Connect your social accounts for easier sign-in.
        </p>
        <div className="mt-6">
          <LinkedAccountsList />
        </div>
      </div>
    </div>
  );
}
