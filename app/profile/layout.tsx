import getCurrentUser from "@/actions/getCurrentUser";
import { redirect } from "next/navigation";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileHeader from "./components/ProfileHeader";
import { ROUTES } from "@/libs/routes";

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

  return (
    <div className="h-full bg-gray-50">
      <ProfileHeader />
      <div className="flex h-[calc(100%-64px)]">
        <ProfileSidebar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
