import getCurrentUser from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";
import { ROUTES } from "@/libs/routes";
import ProfileLayoutClient from "./components/ProfileLayoutClient";

/**
 * Layout for profile pages.
 * Includes a sidebar for navigation and a header with back button.
 */
export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect(ROUTES.AUTH);
  }

  return <ProfileLayoutClient>{children}</ProfileLayoutClient>;
}
