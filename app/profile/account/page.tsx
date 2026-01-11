import getCurrentUser from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";
import { ROUTES } from "@/libs/routes";
import AccountForm from "./components/AccountForm";

/**
 * Account settings page for updating profile information.
 */
export default async function AccountPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(ROUTES.AUTH);
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your profile information and avatar.
        </p>
        <div className="mt-6">
          <AccountForm currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
