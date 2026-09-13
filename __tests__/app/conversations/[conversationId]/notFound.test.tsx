import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ConversationNotFound from "@/app/conversations/[conversationId]/not-found";
import { ROUTES } from "@/config/routes";

describe("ConversationNotFound", () => {
  it("renders 404 badge, contextual heading, and message", () => {
    render(<ConversationNotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /conversation not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /this conversation does not exist, may have been deleted, or you don't have access to it/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders link back to conversations page", () => {
    render(<ConversationNotFound />);

    const link = screen.getByRole("link", { name: /back to conversations/i });
    expect(link).toHaveAttribute("href", ROUTES.CONVERSATIONS.path);
  });
});
