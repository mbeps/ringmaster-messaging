import { redirect } from "next/navigation";
import getCurrentUser from "@/actions/getCurrentUser";
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
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="font-semibold text-gray-900 text-xl">Security</h1>
        <p className="mt-1 text-gray-600 text-sm">
          Update your password to keep your account secure.
        </p>
        <div className="mt-6">
          <SecurityForm />
        </div>
      </div>
    </div>
  );
}
