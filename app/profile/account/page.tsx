import { redirect } from "next/navigation";
import getCurrentUser from "@/actions/getCurrentUser";
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
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="font-semibold text-gray-900 text-xl">
          Account Settings
        </h1>
        <p className="mt-1 text-gray-600 text-sm">
          Update your profile information and avatar.
        </p>
        <div className="mt-6">
          <AccountForm currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}
