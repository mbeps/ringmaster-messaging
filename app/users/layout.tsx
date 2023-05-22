import getUsers from "../actions/getUsers";
import Sidebar from "../components/sidebar/Sidebar";
import UserList from "./components/UserList";

/**
 * Displays a sidebar with a list of users who exist in the platform.
 * @param children: layout of the users page
 * @returns (JSX.Element): layout of the users page
 */
export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const users = await getUsers();

  return (
    // @ts-expect-error
    <Sidebar>
      <div className="h-full">
        <UserList items={users} />
        {children}
      </div>
    </Sidebar>
  );
}
