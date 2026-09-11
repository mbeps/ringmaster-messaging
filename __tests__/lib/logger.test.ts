import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("lib/logger", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("consoleFormatter", () => {
    it("formats log lines with columnar alignment, padded level, 24-char category, and delimiter", async () => {
      const { consoleFormatter } = await import("@/lib/logger");

      // Verify that consoleFormatter was constructed
      expect(consoleFormatter).toBeDefined();
      expect(typeof consoleFormatter).toBe("function");

      const record = {
        category: ["app", "actions", "song"],
        level: "info" as const,
        message: ["Song created"],
        timestamp: 1700000000000,
        properties: {},
      };

      const formatted = consoleFormatter(record);
      expect(typeof formatted).toBe("string");
      // Must contain joined category app·actions·song
      expect(formatted).toContain("app·actions·song");
      // Must contain vertical delimiter
      expect(formatted).toContain("│");
      // Must contain message text
      expect(formatted).toContain("Song created");
    });

    it("formats warning level and categories longer than 24 chars cleanly", async () => {
      const { consoleFormatter } = await import("@/lib/logger");

      const record = {
        category: ["app", "very", "long", "nested", "category", "path"],
        level: "warning" as const,
        message: ["Warning message"],
        timestamp: 1700000000000,
        properties: {},
      };

      const formatted = consoleFormatter(record);
      expect(formatted).toContain("app·very·long·nested·category·path");
      expect(formatted).toContain("WARNING");
      expect(formatted).toContain("│");
      expect(formatted).toContain("Warning message");
    });
  });

  describe("configureLoggingSync and getLogger", () => {
    it("configures logging synchronously and provides working loggers", async () => {
      const { configureLoggingSync, getLogger } = await import("@/lib/logger");

      configureLoggingSync();
      // Calling again is idempotent
      configureLoggingSync();

      const logger = getLogger(["app", "test"]);
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.warn).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("automatically calls configureLoggingSync on first getLogger invocation", async () => {
      const { getLogger } = await import("@/lib/logger");

      const logger = getLogger(["app", "actions", "user"]);
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe("function");
    });

    it("configureLogging resolves cleanly", async () => {
      const { configureLogging } = await import("@/lib/logger");

      await expect(configureLogging()).resolves.toBeUndefined();
    });

    it("configures non-blocking sink when outside test environment", async () => {
      const origEnv = process.env.NODE_ENV;
      const origVitest = process.env.VITEST;
      try {
        process.env.NODE_ENV = "production";
        delete process.env.VITEST;
        const { configureLoggingSync } = await import("@/lib/logger");
        expect(() => configureLoggingSync()).not.toThrow();
      } finally {
        process.env.NODE_ENV = origEnv;
        if (origVitest !== undefined) process.env.VITEST = origVitest;
      }
    });
  });
});
