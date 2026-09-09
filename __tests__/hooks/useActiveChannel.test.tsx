// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

const channelMock = vi.hoisted(() => ({
  bind: vi.fn(),
  unbind_all: vi.fn(),
}));

const pusherClientMock = vi.hoisted(() => ({
  subscribe: vi.fn(() => channelMock),
  unsubscribe: vi.fn(),
}));

vi.mock("@/libs/pusher", () => ({ pusherClient: pusherClientMock }));

import useActiveChannel from "@/hooks/useActiveChannel";
import useActiveList from "@/hooks/useActiveList";

type BindHandler = (payload: unknown) => void;

/** Get the handler registered for a given event name. */
const getHandler = (event: string): BindHandler => {
  const call = channelMock.bind.mock.calls.find((c) => c[0] === event);
  if (!call) throw new Error(`no handler bound for ${event}`);
  return call[1] as BindHandler;
};

describe("useActiveChannel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActiveList.getState().set([]);
    pusherClientMock.subscribe.mockReturnValue(channelMock);
  });

  it("subscribes to the presence-messenger channel", () => {
    renderHook(() => useActiveChannel());
    expect(pusherClientMock.subscribe).toHaveBeenCalledWith(
      "presence-messenger"
    );
  });

  it("binds the three presence events", () => {
    renderHook(() => useActiveChannel());
    const events = channelMock.bind.mock.calls.map((c) => c[0]);
    expect(events).toEqual([
      "pusher:subscription_succeeded",
      "pusher:member_added",
      "pusher:member_removed",
    ]);
  });

  it("sets initial members on subscription_succeeded", () => {
    renderHook(() => useActiveChannel());
    const members = { each: (cb: (m: { id: string }) => void) => {
      cb({ id: "a" });
      cb({ id: "b" });
    } };
    act(() => getHandler("pusher:subscription_succeeded")(members));
    expect(useActiveList.getState().members).toEqual(["a", "b"]);
  });

  it("adds a member on member_added and removes on member_removed", () => {
    renderHook(() => useActiveChannel());
    act(() => getHandler("pusher:member_added")({ id: "x" }));
    expect(useActiveList.getState().members).toEqual(["x"]);
    act(() => getHandler("pusher:member_removed")({ id: "x" }));
    expect(useActiveList.getState().members).toEqual([]);
  });

  it("does not resubscribe on rerender", () => {
    const { rerender } = renderHook(() => useActiveChannel());
    rerender();
    expect(pusherClientMock.subscribe).toHaveBeenCalledTimes(1);
  });

  it("unbinds all handlers and unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useActiveChannel());
    unmount();
    expect(channelMock.unbind_all).toHaveBeenCalledTimes(1);
    expect(pusherClientMock.unsubscribe).toHaveBeenCalledWith(
      "presence-messenger"
    );
  });

  it("handles an empty initial member list", () => {
    renderHook(() => useActiveChannel());
    const members = { each: (_cb: (m: { id: string }) => void) => {} };
    act(() => getHandler("pusher:subscription_succeeded")(members));
    expect(useActiveList.getState().members).toEqual([]);
  });

  it("replaces stale members on re-subscription success", () => {
    useActiveList.getState().set(["stale"]);
    renderHook(() => useActiveChannel());
    const members = { each: (cb: (m: { id: string }) => void) => {
      cb({ id: "fresh" });
    } };
    act(() => getHandler("pusher:subscription_succeeded")(members));
    expect(useActiveList.getState().members).toEqual(["fresh"]);
  });

  it("accumulates multiple joins then leaves in event order", () => {
    renderHook(() => useActiveChannel());
    const added = getHandler("pusher:member_added");
    const removed = getHandler("pusher:member_removed");
    act(() => {
      added({ id: "1" });
      added({ id: "2" });
      added({ id: "3" });
      removed({ id: "2" });
    });
    expect(useActiveList.getState().members).toEqual(["1", "3"]);
  });

  it("binds each event exactly once", () => {
    renderHook(() => useActiveChannel());
    const counts = channelMock.bind.mock.calls.map((c) => c[0]);
    for (const event of [
      "pusher:subscription_succeeded",
      "pusher:member_added",
      "pusher:member_removed",
    ]) {
      expect(counts.filter((e) => e === event)).toHaveLength(1);
    }
  });

  it("does not unsubscribe while still mounted", () => {
    renderHook(() => useActiveChannel());
    expect(pusherClientMock.unsubscribe).not.toHaveBeenCalled();
    expect(channelMock.unbind_all).not.toHaveBeenCalled();
  });

  it("supports subscribe/unsubscribe across mount cycles", () => {
    const first = renderHook(() => useActiveChannel());
    first.unmount();
    const second = renderHook(() => useActiveChannel());
    second.unmount();
    expect(pusherClientMock.subscribe).toHaveBeenCalledTimes(2);
    expect(pusherClientMock.unsubscribe).toHaveBeenCalledTimes(2);
  });
});
