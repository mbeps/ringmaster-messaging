import getCurrentUser from "@/actions/getCurrentUser";
import DesktopSidebar from "@/components/sidebar/DesktopSidebar";
import MobileFooter from "./MobileFooter";

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
      <MobileFooter currentUser={currentUser!} />
      <main className="h-full lg:pl-20">{children}</main>
    </div>
  );
}

export default Sidebar;
