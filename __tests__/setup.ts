import "@testing-library/jest-dom/vitest";

// jsdom lacks matchMedia; some components/hooks rely on it.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// Stub ResizeObserver for Headless UI, cmdk, modals/popovers
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Stub scrollIntoView called by focus management
Element.prototype.scrollIntoView = vi.fn();
HTMLElement.prototype.scrollIntoView = vi.fn();

// Fallback environment variable defaults for test runners (CI & JSDOM)
process.env.DATABASE_URL ||= "mongodb://localhost:27017/test";
process.env.BETTER_AUTH_SECRET ||= "mock_better_auth_secret_key";
process.env.BETTER_AUTH_URL ||= "http://localhost:3000";
process.env.PUSHER_APP_ID ||= "mock_pusher_app_id";
process.env.PUSHER_SECRET ||= "mock_pusher_secret";
process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||= "mock_pusher_app_key";
process.env.CLIENT_ID_GITHUB ||= "mock_github_client_id";
process.env.CLIENT_SECRET_GITHUB ||= "mock_github_client_secret";
process.env.CLIENT_ID_GOOGLE ||= "mock_google_client_id";
process.env.CLIENT_SECRET_GOOGLE ||= "mock_google_client_secret";
