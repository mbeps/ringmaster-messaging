import { create } from "zustand";

interface ActiveListStore {
  members: string[]; // list of active members
  add: (id: string) => void; // function to add a member to the list
  remove: (id: string) => void; // function to remove a member from the list
  set: (ids: string[]) => void; // function to set the list of active members
}

/**
 * Creates a Zustand store using the create function.
 * The store manages a list of active members and provides functions to add, remove, and set the members.
 * Returns the store, allowing components to access and update the state of the active members list.
 */
const useActiveList = create<ActiveListStore>((set) => ({
  members: [],
  add: (id) => set((state) => ({ members: [...state.members, id] })),
  remove: (id) =>
    set((state) => ({
      members: state.members.filter((memberId) => memberId !== id),
    })),
  set: (ids) => set({ members: ids }),
}));

export default useActiveList;
