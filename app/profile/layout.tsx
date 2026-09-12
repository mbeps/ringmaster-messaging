import { redirect } from "next/navigation";
import getCurrentUser from "@/actions/user/get-current-user";
import ProfileLayoutClient from "@/app/profile/_components/profile-layout-client";
import { ROUTES } from "@/config/routes";

export const dynamic = "force-dynamic";

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
    redirect(ROUTES.AUTH.path);
  }

  return <ProfileLayoutClient>{children}</ProfileLayoutClient>;
}
