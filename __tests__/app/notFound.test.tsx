import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RootNotFound from "@/app/not-found";
import { ASSETS } from "@/config/assets";
import { ROUTES } from "@/config/routes";

describe("RootNotFound", () => {
  it("renders 404 badge, heading, and description", () => {
    render(<RootNotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /page not found/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sorry, we couldn't find the page you're looking for/i),
    ).toBeInTheDocument();
  });

  it("renders the logo with configured asset properties", () => {
    render(<RootNotFound />);

    const logo = screen.getByAltText(ASSETS.LOGO.alt);
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", ASSETS.LOGO.path);
  });

  it("renders navigation links to home and conversations", () => {
    render(<RootNotFound />);

    const homeLink = screen.getByRole("link", { name: /back to home/i });
    expect(homeLink).toHaveAttribute("href", ROUTES.AUTH.path);

    const conversationsLink = screen.getByRole("link", {
      name: /go to conversations/i,
    });
    expect(conversationsLink).toHaveAttribute("href", ROUTES.CONVERSATIONS.path);
  });
});
