import { Context } from "@/types";
import { create } from "zustand";

interface LocalStoreState {
  promptInput: string;
  setPromptInput: (promptInput: string) => void;

  selectedContext: Context[];
  addSelectedContext: (context: Context) => void;
  removeSelectedContexts: (contextIds: string[]) => void;
  updateSelectedContext: (context: Context) => void;
}

export const useLocalStore = create<LocalStoreState>((set) => ({
  // Prompt Input
  promptInput: "",
  setPromptInput: (promptInput) => set({ promptInput }),

  // Selected Contexts
  selectedContext: [],
  addSelectedContext: (context: Context) =>
    set((state) => ({
      ...state,
      selectedContext: [...state.selectedContext, context],
    })),
  removeSelectedContexts: (contextIds: string[]) =>
    set((state) => ({
      ...state,
      selectedContext: state.selectedContext.filter(
        (c) => !contextIds.includes(c.id),
      ),
    })),
  updateSelectedContext: (context: Context) =>
    set((state) => ({
      ...state,
      selectedContext: state.selectedContext.map((c) =>
        c.id === context.id ? context : c,
      ),
    })),
}));
