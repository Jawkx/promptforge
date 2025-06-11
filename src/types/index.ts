export interface GlobalLabel {
  id: string;
  text: string;
}

export type Context = {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly charCount: number;
  readonly hash: string;
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
  context: Context | null;
  allGlobalLabels: GlobalLabel[];
  getGlobalLabelById: (id: string) => GlobalLabel | undefined;
}
