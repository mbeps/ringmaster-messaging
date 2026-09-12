import getCurrentUser from "@/actions/user/get-current-user";
import DesktopSidebar from "@/components/sidebar/desktop-sidebar";
import MobileFooter from "@/components/sidebar/mobile-footer";

/**
 * A component that allows the user to navigate through the app.
 * It displays the sidebar on desktop and the footer on mobile.
 *
 * @param param0: children
 * @returns sidebar component (mobile or desktop)
 */
export default async function Sidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  return (
    <div className="h-full">
      <DesktopSidebar currentUser={currentUser!} />
      <MobileFooter currentUser={currentUser!} />
      <main className="h-full lg:pl-20">{children}</main>
    </div>
  );
}
