import { describe, expect, it, vi } from "vitest";

vi.mock("@logtape/logtape", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@logtape/logtape")>();
  return {
    ...actual,
    configureSync: vi.fn(() => {
      throw new Error("Simulated configureSync error");
    }),
  };
});

describe("lib/logger catch branch", () => {
  it("catches configureSync errors and marks initialized as true", async () => {
    const { configureLoggingSync } = await import("@/lib/logger");
    expect(() => configureLoggingSync()).not.toThrow();
  });
});

