import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthForm from "@/app/(site)/components/AuthForm";
import { ROUTES } from "@/libs/routes";

const {
  pushMock,
  backMock,
  signInEmailMock,
  signInSocialMock,
  signUpEmailMock,
  useSessionMock,
  toastSuccessMock,
  toastErrorMock,
} = vi.hoisted(() => ({
  pushMock: vi.fn(),
  backMock: vi.fn(),
  signInEmailMock: vi.fn(),
  signInSocialMock: vi.fn(),
  signUpEmailMock: vi.fn(),
  useSessionMock: vi.fn(() => ({ data: null })),
  toastSuccessMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, back: backMock }),
  useParams: () => ({ conversationId: "c1" }),
  usePathname: () => "/conversations/c1",
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: useSessionMock,
    signIn: {
      email: signInEmailMock,
      social: signInSocialMock,
    },
    signUp: {
      email: signUpEmailMock,
    },
  },
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock("axios");

vi.mock("react-hot-toast", () => {
  const toastFn: any = vi.fn();
  toastFn.error = toastErrorMock;
  toastFn.success = toastSuccessMock;
  return {
    default: toastFn,
    toast: toastFn,
  };
});

describe("AuthForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSessionMock.mockReturnValue({ data: null });
    signInEmailMock.mockResolvedValue({});
    signInSocialMock.mockResolvedValue({});
    signUpEmailMock.mockResolvedValue({});
  });

  it("redirects to /users when a session is already present", () => {
    useSessionMock.mockReturnValue({
      data: { user: { email: "me@example.com" } },
    });

    render(<AuthForm />);

    expect(pushMock).toHaveBeenCalledWith(ROUTES.USERS);
  });

  it("renders LOGIN variant by default with Email and Password inputs, but not Name", () => {
    render(<AuthForm />);

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText("New to Ringmaster?")).toBeInTheDocument();
    expect(screen.getByText("Create an account")).toBeInTheDocument();
  });

  it("toggles between LOGIN and REGISTER variants", async () => {
    render(<AuthForm />);

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();

    // Switch to REGISTER
    await userEvent.click(screen.getByText("Create an account"));

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Register" })).toBeInTheDocument();
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();

    // Switch back to LOGIN
    await userEvent.click(screen.getByText("Login"));

    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText("New to Ringmaster?")).toBeInTheDocument();
  });

  it("does not call signIn.email when submitted with invalid inputs", async () => {
    render(<AuthForm />);

    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(signInEmailMock).not.toHaveBeenCalled();
    });
  });

  it("submits login form and calls authClient.signIn.email with success handling", async () => {
    signInEmailMock.mockImplementation(async ({ fetchOptions }: any) => {
      fetchOptions?.onSuccess?.();
    });

    render(<AuthForm />);

    await userEvent.type(screen.getByLabelText("Email address"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret123");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(signInEmailMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
        callbackURL: ROUTES.USERS,
        fetchOptions: expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      });
      expect(toastSuccessMock).toHaveBeenCalledWith("Logged in!");
      expect(pushMock).toHaveBeenCalledWith(ROUTES.USERS);
    });
  });

  it("handles login error with custom error message", async () => {
    signInEmailMock.mockImplementation(async ({ fetchOptions }: any) => {
      fetchOptions?.onError?.({ error: { message: "Invalid credentials" } });
    });

    render(<AuthForm />);

    await userEvent.type(screen.getByLabelText("Email address"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Invalid credentials");
    });
  });

  it("handles login error fallback message when message is missing", async () => {
    signInEmailMock.mockImplementation(async ({ fetchOptions }: any) => {
      fetchOptions?.onError?.({ error: {} });
    });

    render(<AuthForm />);

    await userEvent.type(screen.getByLabelText("Email address"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Invalid credentials!");
    });
  });

  it("submits registration form and calls authClient.signUp.email with success handling", async () => {
    signUpEmailMock.mockImplementation(async ({ fetchOptions }: any) => {
      fetchOptions?.onSuccess?.();
    });

    render(<AuthForm />);

    // Toggle to REGISTER
    await userEvent.click(screen.getByText("Create an account"));

    await userEvent.type(screen.getByLabelText("Name"), "Jane Doe");
    await userEvent.type(screen.getByLabelText("Email address"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "P@ssword123");
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(signUpEmailMock).toHaveBeenCalledWith({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "P@ssword123",
        callbackURL: ROUTES.USERS,
        fetchOptions: expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      });
      expect(toastSuccessMock).toHaveBeenCalledWith("Account created!");
      expect(pushMock).toHaveBeenCalledWith(ROUTES.USERS);
    });
  });

  it("handles registration error with custom error message", async () => {
    signUpEmailMock.mockImplementation(async ({ fetchOptions }: any) => {
      fetchOptions?.onError?.({ error: { message: "Email already registered" } });
    });

    render(<AuthForm />);

    await userEvent.click(screen.getByText("Create an account"));

    await userEvent.type(screen.getByLabelText("Name"), "Jane Doe");
    await userEvent.type(screen.getByLabelText("Email address"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "P@ssword123");
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Email already registered");
    });
  });

  it("handles registration error fallback message when error message is empty", async () => {
    signUpEmailMock.mockImplementation(async ({ fetchOptions }: any) => {
      fetchOptions?.onError?.({ error: {} });
    });

    render(<AuthForm />);

    await userEvent.click(screen.getByText("Create an account"));

    await userEvent.type(screen.getByLabelText("Name"), "Jane Doe");
    await userEvent.type(screen.getByLabelText("Email address"), "jane@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "P@ssword123");
    await userEvent.click(screen.getByRole("button", { name: "Register" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Registration failed");
    });
  });

  it("triggers social login with github provider when clicking the first social button", async () => {
    render(<AuthForm />);

    const buttons = screen.getAllByRole("button");
    // Button 0 is submit, button 1 is github, button 2 is google
    const githubButton = buttons[1];
    await userEvent.click(githubButton);

    expect(signInSocialMock).toHaveBeenCalledWith({
      provider: "github",
      callbackURL: ROUTES.USERS,
      fetchOptions: expect.objectContaining({
        onError: expect.any(Function),
      }),
    });
  });

  it("triggers social login with google provider when clicking the second social button", async () => {
    render(<AuthForm />);

    const buttons = screen.getAllByRole("button");
    const googleButton = buttons[2];
    await userEvent.click(googleButton);

    expect(signInSocialMock).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: ROUTES.USERS,
      fetchOptions: expect.objectContaining({
        onError: expect.any(Function),
      }),
    });
  });

  it("handles social login error", async () => {
    signInSocialMock.mockImplementation(async ({ fetchOptions }: any) => {
      fetchOptions?.onError?.({ error: { message: "OAuth canceled" } });
    });

    render(<AuthForm />);

    const buttons = screen.getAllByRole("button");
    const githubButton = buttons[1];
    await userEvent.click(githubButton);

    expect(toastErrorMock).toHaveBeenCalledWith(
      "OAuth authentication failed: OAuth canceled"
    );
  });
});
