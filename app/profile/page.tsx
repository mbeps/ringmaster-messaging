import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

/**
 * Main profile page that redirects to the account settings page.
 */
export default function ProfilePage() {
  redirect(ROUTES.PROFILE.account);
}
