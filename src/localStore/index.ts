import { SelectedContext } from "@/types";
import { create } from "zustand";
import { Content } from "@tiptap/react";

interface LocalStoreState {
  prompt: Content;
  setPrompt: (prompt: Content) => void;

  selectedContexts: SelectedContext[];
  addContextToPrompt: (context: SelectedContext) => void;
  removeMultipleSelectedContextsFromPrompt: (contextIds: string[]) => void;
  updateSelectedContext: (context: SelectedContext) => void;
}

export const useLocalStore = create<LocalStoreState>((set) => ({
  prompt: "",
  setPrompt: (prompt) => set({ prompt }),

  selectedContexts: [],
  addContextToPrompt: (context) =>
    set((state) => ({
      selectedContexts: [...state.selectedContexts, context],
    })),
  removeMultipleSelectedContextsFromPrompt: (contextIds) =>
    set((state) => ({
      selectedContexts: state.selectedContexts.filter(
        (c) => !contextIds.includes(c.id),
      ),
    })),
  updateSelectedContext: (context) =>
    set((state) => ({
      selectedContexts: state.selectedContexts.map((c) =>
        c.id === context.id ? context : c,
      ),
    })),
}));
