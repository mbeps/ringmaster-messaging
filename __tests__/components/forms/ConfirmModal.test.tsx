import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/modals/ConfirmModal";
import { API_ROUTES, ROUTES } from "@/config/routes";

const push = vi.fn();
const refresh = vi.fn();

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useParams: () => ({ conversationId: "conv-1" }),
}));

describe("ConfirmModal", () => {
  it("does not render when closed", () => {
    render(<ConfirmModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText("Delete conversation")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(<ConfirmModal isOpen onClose={vi.fn()} />);
    expect(screen.getByText("Delete conversation")).toBeInTheDocument();
  });

  it("deletes the conversation and redirects on confirm", async () => {
    const axios = (await import("axios")).default;
    vi.mocked(axios.delete).mockResolvedValueOnce({});
    const onClose = vi.fn();
    render(<ConfirmModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(API_ROUTES.CONVERSATIONS.detail("conv-1"));
      expect(onClose).toHaveBeenCalled();
      expect(push).toHaveBeenCalledWith(ROUTES.CONVERSATIONS.path);
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("shows an error toast when deletion fails", async () => {
    const axios = (await import("axios")).default;
    vi.mocked(axios.delete).mockRejectedValueOnce(new Error("fail"));
    render(<ConfirmModal isOpen onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong!");
    });
  });
});
