import { redirect } from "next/navigation";
import { ROUTES } from "@/libs/routes";

/**
 * Main profile page that redirects to the account settings page.
 */
export default function ProfilePage() {
  redirect(ROUTES.PROFILE_ACCOUNT);
}
