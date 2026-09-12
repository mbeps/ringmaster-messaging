import getConversationById from "@/actions/conversation/get-conversation-by-id";
import getMessages from "@/actions/message/get-messages";
import Body from "@/app/conversations/[conversationId]/_components/body";
import Form from "@/app/conversations/[conversationId]/_components/form";
import Header from "@/app/conversations/[conversationId]/_components/header";
import EmptyState from "@/components/empty-state";

interface IParams {
  conversationId: string;
}

/**
 * Displays the conversation page with the header, body and form.
 * @param param0: params with conversationId
 * @returns Conversation page component
 */
export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<IParams>;
}) {
  const { conversationId } = await params;

  const conversation = await getConversationById(conversationId);
  const messages = await getMessages(conversationId);

  if (!conversation) {
    return (
      <div className="h-full lg:pl-80">
        <div className="flex h-full flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full lg:pl-80">
      <div className="flex h-full flex-col">
        <Header conversation={conversation} />
        <Body initialMessages={messages} />
        <Form />
      </div>
    </div>
  );
}
