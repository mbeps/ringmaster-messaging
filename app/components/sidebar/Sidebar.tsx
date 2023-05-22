import DesktopSidebar from "@/app/components/sidebar/DesktopSidebar";
import MobileFooter from "./MobileFooter";
import getCurrentUser from "@/app/actions/getCurrentUser";

/**
 * A component that allows the user to navigate through the app.
 * It displays the sidebar on desktop and the footer on mobile.
 *
 * @param param0 { children: React.ReactNode}
 * @returns (JSX.Element): sidebar component (mobile or desktop)
 */
async function Sidebar({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();

  return (
    <div className="h-full">
      <DesktopSidebar currentUser={currentUser!} />
      <MobileFooter />
      <main className="lg:pl-20 h-full">{children}</main>
    </div>
  );
}

export default Sidebar;
