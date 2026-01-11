import getCurrentUser from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";
import { ROUTES } from "@/libs/routes";
import SecurityForm from "./components/SecurityForm";

/**
 * Security settings page for changing password.
 */
export default async function SecurityPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(ROUTES.AUTH);
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-xl font-semibold text-gray-900">Security</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update your password to keep your account secure.
        </p>
        <div className="mt-6">
          <SecurityForm />
        </div>
      </div>
    </div>
  );
}
