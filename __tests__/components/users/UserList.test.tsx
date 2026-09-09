import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import UserList from "@/app/users/components/UserList";
import { User } from "@prisma/client";

vi.mock("@/app/users/components/UserBox", () => ({
  default: ({ data }: { data: User }) => (
    <div data-testid={`user-box-${data.id}`}>{data.name}</div>
  ),
}));

const makeUser = (id: string, name: string): User => ({
  id,
  name,
  email: `${id}@example.com`,
  emailVerified: null,
  image: null,
  hashedPassword: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
});

describe("UserList", () => {
  it("renders heading and list of users", () => {
    const users = [
      makeUser("user-1", "Boffo"),
      makeUser("user-2", "Pagliacci"),
      makeUser("user-3", "Harlequin"),
    ];

    render(<UserList items={users} />);

    expect(screen.getByText("Clowns")).toBeInTheDocument();
    expect(screen.getByTestId("user-box-user-1")).toHaveTextContent("Boffo");
    expect(screen.getByTestId("user-box-user-2")).toHaveTextContent("Pagliacci");
    expect(screen.getByTestId("user-box-user-3")).toHaveTextContent("Harlequin");
  });

  it("renders correctly with an empty list", () => {
    render(<UserList items={[]} />);

    expect(screen.getByText("Clowns")).toBeInTheDocument();
    expect(screen.queryByTestId(/user-box-/)).not.toBeInTheDocument();
  });
});
