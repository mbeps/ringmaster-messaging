import getConversations from "@/actions/conversation/get-conversations";
import getUsers from "@/actions/user/get-users";
import ConversationList from "@/app/conversations/_components/conversation-list";
import Sidebar from "@/components/sidebar/sidebar";

export const dynamic = "force-dynamic";

/**
 * Layout for the conversations page.
 * It has a sidebar and a list of conversations.
 *
 * @param param0: children
 * @returns layout of the conversations page
 */
export default async function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();
  const users = await getUsers();

  return (
    <Sidebar>
      <div className="h-full">
        <ConversationList users={users} initialItems={conversations} />
        {children}
      </div>
    </Sidebar>
  );
}
