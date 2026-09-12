import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import axios from "axios";
import DeleteAccountSection from "@/app/profile/danger/components/DeleteAccountSection";
import { API_ROUTES, ROUTES } from "@/config/routes";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useParams: () => ({}),
  usePathname: () => "/profile/danger",
}));

const signOutMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { email: "user@example.com" } },
    }),
    signOut: signOutMock,
  },
}));

vi.mock("axios");

vi.mock("react-hot-toast", () => {
  const toastFn: any = vi.fn();
  toastFn.error = vi.fn();
  toastFn.success = vi.fn();
  return {
    default: toastFn,
    toast: toastFn,
  };
});

const userEmail = "user@example.com";

describe("DeleteAccountSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering warning notice and delete button", () => {
    it("renders warning notice details and initial delete button", () => {
      render(<DeleteAccountSection userEmail={userEmail} />);

      expect(screen.getByRole("heading", { level: 3, name: "Delete Account" })).toBeInTheDocument();
      expect(
        screen.getByText(/Once you delete your account, there is no going back/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Your profile and account information")).toBeInTheDocument();
      expect(screen.getByText("All messages you have sent")).toBeInTheDocument();
      expect(screen.getByText("Your participation in conversations")).toBeInTheDocument();
      expect(screen.getByText("Any linked social accounts")).toBeInTheDocument();

      const deleteButton = screen.getByRole("button", { name: "Delete Account" });
      expect(deleteButton).toBeInTheDocument();
      expect(screen.queryByPlaceholderText("Enter your email to confirm")).not.toBeInTheDocument();
    });
  });

  describe("Delete confirmation modal flow", () => {
    it("opens modal when Delete Account button is clicked", async () => {
      render(<DeleteAccountSection userEmail={userEmail} />);

      fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

      expect(screen.getByRole("heading", { level: 2, name: "Delete Account" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter your email to confirm")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("closes modal and clears input when Cancel button is clicked", async () => {
      render(<DeleteAccountSection userEmail={userEmail} />);

      fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

      const input = screen.getByPlaceholderText("Enter your email to confirm");
      await userEvent.type(input, "partial@text");

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByPlaceholderText("Enter your email to confirm")).not.toBeInTheDocument();
      });

      // Re-open to verify input was cleared
      fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));
      expect(screen.getByPlaceholderText("Enter your email to confirm")).toHaveValue("");
    });

    it("keeps modal confirm button disabled until exact email is typed", async () => {
      render(<DeleteAccountSection userEmail={userEmail} />);

      fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

      const input = screen.getByPlaceholderText("Enter your email to confirm");
      const confirmButtons = screen.getAllByRole("button", { name: "Delete Account" });
      const modalConfirmBtn = confirmButtons[confirmButtons.length - 1];

      // Empty input -> disabled
      expect(modalConfirmBtn).toBeDisabled();

      // Wrong email -> disabled
      await userEvent.type(input, "wrong@example.com");
      expect(modalConfirmBtn).toBeDisabled();

      // Clear and type exact email -> enabled
      await userEvent.clear(input);
      await userEvent.type(input, userEmail);
      expect(modalConfirmBtn).toBeEnabled();
    });

    it("executes account deletion, signs out, shows success toast, and redirects to ROUTES.AUTH.path on success", async () => {
      vi.mocked(axios.delete).mockResolvedValueOnce({
        data: { success: true },
      });
      signOutMock.mockResolvedValueOnce({});

      render(<DeleteAccountSection userEmail={userEmail} />);

      fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

      const input = screen.getByPlaceholderText("Enter your email to confirm");
      await userEvent.type(input, userEmail);

      const confirmButtons = screen.getAllByRole("button", { name: "Delete Account" });
      const modalConfirmBtn = confirmButtons[confirmButtons.length - 1];

      fireEvent.click(modalConfirmBtn);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(API_ROUTES.ACCOUNT.delete);
        expect(signOutMock).toHaveBeenCalledTimes(1);
        expect(toast.success).toHaveBeenCalledWith("Account deleted successfully");
        expect(push).toHaveBeenCalledWith(ROUTES.AUTH.path);
      });

      // Modal is closed after deletion
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("Enter your email to confirm")).not.toBeInTheDocument();
      });
    });

    it("handles API failure by showing error toast and remaining without sign out or redirect", async () => {
      vi.mocked(axios.delete).mockRejectedValueOnce(new Error("Server error"));

      render(<DeleteAccountSection userEmail={userEmail} />);

      fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

      const input = screen.getByPlaceholderText("Enter your email to confirm");
      await userEvent.type(input, userEmail);

      const confirmButtons = screen.getAllByRole("button", { name: "Delete Account" });
      const modalConfirmBtn = confirmButtons[confirmButtons.length - 1];

      fireEvent.click(modalConfirmBtn);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(API_ROUTES.ACCOUNT.delete);
        expect(toast.error).toHaveBeenCalledWith("Failed to delete account");
      });

      expect(signOutMock).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();

      // Modal closes in finally block
      await waitFor(() => {
        expect(screen.queryByPlaceholderText("Enter your email to confirm")).not.toBeInTheDocument();
      });
    });

    it("does not sign out or redirect if API returns success: false", async () => {
      vi.mocked(axios.delete).mockResolvedValueOnce({
        data: { success: false },
      });

      render(<DeleteAccountSection userEmail={userEmail} />);

      fireEvent.click(screen.getByRole("button", { name: "Delete Account" }));

      const input = screen.getByPlaceholderText("Enter your email to confirm");
      await userEvent.type(input, userEmail);

      const confirmButtons = screen.getAllByRole("button", { name: "Delete Account" });
      const modalConfirmBtn = confirmButtons[confirmButtons.length - 1];

      fireEvent.click(modalConfirmBtn);

      await waitFor(() => {
        expect(axios.delete).toHaveBeenCalledWith(API_ROUTES.ACCOUNT.delete);
      });

      expect(signOutMock).not.toHaveBeenCalled();
      expect(push).not.toHaveBeenCalled();
      expect(toast.success).not.toHaveBeenCalled();
    });
  });
});
