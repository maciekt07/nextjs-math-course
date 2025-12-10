import { create } from "zustand";

type SidebarStore = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  optimisticPath: string | null;
  setOptimisticPath: (path: string) => void;
};

export const useSidebarStore = create<SidebarStore>((set) => ({
  open: true,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
  optimisticPath: null,
  setOptimisticPath: (path) => set({ optimisticPath: path }),
}));
