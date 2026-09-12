import getUsers from "@/actions/user/get-users";
import UserList from "@/app/users/_components/user-list";
import Sidebar from "@/components/sidebar/sidebar";

export const dynamic = "force-dynamic";

/**
 * Displays a sidebar with a list of users who exist in the platform.
 * @param param0: layout of the users page
 * @returns layout of the users page
 */
export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const users = await getUsers();

  return (
    <Sidebar>
      <div className="h-full">
        <UserList items={users} />
        {children}
      </div>
    </Sidebar>
  );
}
