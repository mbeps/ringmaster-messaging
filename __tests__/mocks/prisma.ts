import type { Mock } from "vitest";
import { vi } from "vitest";

type MockedFn = Mock;

const createMock = () => vi.fn();

export const mockPrisma = {
  conversation: {
    findUnique: createMock(),
    findMany: createMock(),
  },
  message: {
    findMany: createMock(),
  },
  user: {
    findUnique: createMock(),
    findMany: createMock(),
  },
};

export const resetPrismaMocks = () => {
  (mockPrisma.conversation.findUnique as MockedFn).mockReset();
  (mockPrisma.conversation.findMany as MockedFn).mockReset();
  (mockPrisma.message.findMany as MockedFn).mockReset();
  (mockPrisma.user.findUnique as MockedFn).mockReset();
  (mockPrisma.user.findMany as MockedFn).mockReset();
};
