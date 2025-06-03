export interface GlobalLabel {
  id: string;
  text: string;
}

export interface Context {
  id: string;
  originalId?: string;
  title: string;
  content: string;
  labels: string[];
}

export type ContextFormData = {
  id?: string;
  title: string;
  content: string;
  labels: GlobalLabel[];
};


export interface PromptEditorProps {
  onCopySuccess?: () => void;
}

export interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContextData: ContextFormData) => void;
  allGlobalLabels: GlobalLabel[];
}

export interface EditContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContextData: ContextFormData) => void;
  context: Context | null; // Can be a library context or a selected context copy
  allGlobalLabels: GlobalLabel[];
  getGlobalLabelById: (id: string) => GlobalLabel | undefined;
}
