import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useActiveList from "@/hooks/useActiveList";

describe("useActiveList", () => {
  beforeEach(() => {
    useActiveList.getState().set([]);
  });

  it("starts with an empty members list", () => {
    expect(useActiveList.getState().members).toEqual([]);
  });

  it("adds a member id", () => {
    useActiveList.getState().add("user-1");
    expect(useActiveList.getState().members).toEqual(["user-1"]);
  });

  it("appends multiple member ids in order", () => {
    const { add } = useActiveList.getState();
    add("a");
    add("b");
    expect(useActiveList.getState().members).toEqual(["a", "b"]);
  });

  it("removes an existing member id", () => {
    const { set, remove } = useActiveList.getState();
    set(["a", "b", "c"]);
    remove("b");
    expect(useActiveList.getState().members).toEqual(["a", "c"]);
  });

  it("ignores removing a non-existent id", () => {
    const { set, remove } = useActiveList.getState();
    set(["a"]);
    remove("nope");
    expect(useActiveList.getState().members).toEqual(["a"]);
  });

  it("replaces the whole list via set (reset behaviour)", () => {
    const { set, add } = useActiveList.getState();
    add("a");
    add("b");
    set([]);
    expect(useActiveList.getState().members).toEqual([]);
  });

  it("set overwrites existing members with a new list", () => {
    const { set } = useActiveList.getState();
    set(["old-1", "old-2"]);
    set(["new-1"]);
    expect(useActiveList.getState().members).toEqual(["new-1"]);
  });

  it("add does not deduplicate ids", () => {
    const { add } = useActiveList.getState();
    add("dup");
    add("dup");
    expect(useActiveList.getState().members).toEqual(["dup", "dup"]);
  });

  it("removes all occurrences of the matching id", () => {
    const { set, remove } = useActiveList.getState();
    set(["x", "x"]);
    remove("x");
    expect(useActiveList.getState().members).toEqual([]);
  });

  it("exposes stable action references across state updates", () => {
    const before = useActiveList.getState();
    before.add("a");
    const after = useActiveList.getState();
    expect(after.add).toBe(before.add);
    expect(after.remove).toBe(before.remove);
    expect(after.set).toBe(before.set);
  });

  it("renders members through the hook and updates reactively", () => {
    const { result } = renderHook(() => useActiveList((s) => s.members));
    expect(result.current).toEqual([]);
    act(() => useActiveList.getState().add("reactive"));
    expect(result.current).toEqual(["reactive"]);
    act(() => useActiveList.getState().remove("reactive"));
    expect(result.current).toEqual([]);
  });
});
