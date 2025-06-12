import { Context } from "@/types";
import { create } from "zustand";

interface LocalStoreState {
  selectedContext: Context[];
  addSelectedContext: (context: Context) => void;
  removeSelectedContext: (contextId: string) => void;
  reorderSelectedContext: (contextId: string, newIndex: number) => void;
}

export const useLocalStore = create<LocalStoreState>((set) => ({
  selectedContext: [],
  addSelectedContext: (context: Context) =>
    set((state) => ({
      ...state,
      selectedContext: [...state.selectedContext, context],
    })),
  removeSelectedContext: (contextId: string) =>
    set((state) => ({
      ...state,
      selectedContext: state.selectedContext.filter(
        (context) => context.id !== contextId,
      ),
    })),
  reorderSelectedContext: (contextId: string, newIndex: number) =>
    set((state) => ({
      ...state,
      selectedContext: state.selectedContext.map((context) =>
        context.id === contextId ? { ...context, index: newIndex } : context,
      ),
    })),
}));
