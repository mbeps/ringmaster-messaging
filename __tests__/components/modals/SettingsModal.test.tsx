import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import SettingsModal from "@/components/modals/SettingsModal";
import { API_ROUTES } from "@/libs/routes";

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
}));

// ponytail: minimal CldUploadButton stub — fires onSuccess with a fake upload result
vi.mock("next-cloudinary", () => ({
  CldUploadButton: ({
    children,
    onSuccess,
  }: {
    children: React.ReactNode;
    onSuccess: (result: { info: { secure_url: string } }) => void;
  }) => (
    <div
      role="none"
      onClick={() => onSuccess({ info: { secure_url: "https://res.cloud/new.png" } })}
    >
      {children}
    </div>
  ),
}));

const currentUser = {
  id: "me",
  name: "Maruf",
  image: "https://res.cloud/old.png",
} as never;

describe("SettingsModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <SettingsModal isOpen={false} onClose={vi.fn()} currentUser={currentUser} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders prefilled with the current user's name", () => {
    render(<SettingsModal isOpen onClose={vi.fn()} currentUser={currentUser} />);
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Maruf");
  });

  it("shows a validation error when the name is cleared", async () => {
    render(<SettingsModal isOpen onClose={vi.fn()} currentUser={currentUser} />);

    const nameInput = screen.getByLabelText("Name");
    await userEvent.clear(nameInput);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
  });

  it("posts updated settings on valid submission", async () => {
    const axios = (await import("axios")).default;
    vi.mocked(axios.post).mockResolvedValueOnce({});
    const onClose = vi.fn();
    render(<SettingsModal isOpen onClose={onClose} currentUser={currentUser} />);

    await userEvent.clear(screen.getByLabelText("Name"));
    await userEvent.type(screen.getByLabelText("Name"), "New Name");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        API_ROUTES.SETTINGS,
        expect.objectContaining({ name: "New Name" }),
      );
    });
  });

  it("sets the uploaded Cloudinary URL as the image field", async () => {
    const axios = (await import("axios")).default;
    vi.mocked(axios.post).mockResolvedValueOnce({});
    render(<SettingsModal isOpen onClose={vi.fn()} currentUser={currentUser} />);

    await userEvent.click(screen.getByRole("button", { name: "Change" }));
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        API_ROUTES.SETTINGS,
        expect.objectContaining({ image: "https://res.cloud/new.png" }),
      );
    });
  });

  it("closes the modal and refreshes after successful save", async () => {
    const axios = (await import("axios")).default;
    vi.mocked(axios.post).mockResolvedValueOnce({});
    const onClose = vi.fn();
    render(<SettingsModal isOpen onClose={onClose} currentUser={currentUser} />);

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("shows an error toast when saving fails", async () => {
    const axios = (await import("axios")).default;
    vi.mocked(axios.post).mockRejectedValueOnce(new Error("fail"));
    render(<SettingsModal isOpen onClose={vi.fn()} currentUser={currentUser} />);

    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong!");
    });
  });

  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<SettingsModal isOpen onClose={onClose} currentUser={currentUser} />);
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
