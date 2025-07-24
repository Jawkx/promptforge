import { SelectedContext } from "@/types";
import { create } from "zustand";
import { Content } from "@tiptap/react";

export enum FocusArea {
  PROMPT_INPUT = "PROMPT_INPUT",
  SELECTED_CONTEXTS = "SELECTED_CONTEXTS",
  CONTEXT_LIBRARY = "CONTEXT_LIBRARY",
  ADD_CONTEXT_DIALOG = "ADD_CONTEXT_DIALOG",
  EDIT_CONTEXT_DIALOG = "EDIT_CONTEXT_DIALOG",
}

interface ModalState {
  addContextModal: { isOpen: boolean };
  editContextModal: {
    isOpen: boolean;
    type?: "library" | "selected";
    contextId?: string;
  };
  labelsModal: { isOpen: boolean };
}

interface LocalStoreState extends ModalState {
  prompt: Content;
  setPrompt: (prompt: Content) => void;

  selectedContexts: SelectedContext[];
  addContextToPrompt: (context: SelectedContext) => void;
  removeMultipleSelectedContextsFromPrompt: (contextIds: string[]) => void;
  updateSelectedContext: (context: SelectedContext) => void;
  reorderSelectedContexts: (activeId: string, overId: string) => void;

  focusedArea: FocusArea;
  setFocusedArea: (area: FocusArea) => void;

  // Modal actions
  openAddContextModal: () => void;
  closeAddContextModal: () => void;
  openEditContextModal: (
    type: "library" | "selected",
    contextId: string,
  ) => void;
  closeEditContextModal: () => void;
  openLabelsModal: () => void;
  closeLabelsModal: () => void;
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
    set((state) => {
      const idsToRemove = new Set(contextIds);
      return {
        selectedContexts: state.selectedContexts.filter(
          (c) => !idsToRemove.has(c.id),
        ),
      };
    }),
  updateSelectedContext: (context) =>
    set((state) => ({
      selectedContexts: state.selectedContexts.map((c) =>
        c.id === context.id ? context : c,
      ),
    })),
  reorderSelectedContexts: (activeId, overId) =>
    set((state) => {
      const oldIndex = state.selectedContexts.findIndex(
        (c) => c.id === activeId,
      );
      const newIndex = state.selectedContexts.findIndex((c) => c.id === overId);

      if (oldIndex === -1 || newIndex === -1) return state;

      const newSelectedContexts = [...state.selectedContexts];
      const [movedItem] = newSelectedContexts.splice(oldIndex, 1);
      newSelectedContexts.splice(newIndex, 0, movedItem);

      return { selectedContexts: newSelectedContexts };
    }),

  focusedArea: FocusArea.PROMPT_INPUT,
  setFocusedArea: (area) => set({ focusedArea: area }),

  // Modal state
  addContextModal: { isOpen: false },
  editContextModal: { isOpen: false },
  labelsModal: { isOpen: false },

  // Modal actions
  openAddContextModal: () =>
    set({
      addContextModal: { isOpen: true },
      focusedArea: FocusArea.ADD_CONTEXT_DIALOG,
    }),
  closeAddContextModal: () =>
    set({
      addContextModal: { isOpen: false },
      focusedArea: FocusArea.PROMPT_INPUT,
    }),
  openEditContextModal: (type, contextId) =>
    set({
      editContextModal: { isOpen: true, type, contextId },
      focusedArea: FocusArea.EDIT_CONTEXT_DIALOG,
    }),
  closeEditContextModal: () =>
    set({
      editContextModal: {
        isOpen: false,
        type: undefined,
        contextId: undefined,
      },
      focusedArea: FocusArea.PROMPT_INPUT,
    }),
  openLabelsModal: () => set({ labelsModal: { isOpen: true } }),
  closeLabelsModal: () => set({ labelsModal: { isOpen: false } }),
}));
