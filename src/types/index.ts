export interface Context {
  id: string;
  title: string;
  content: string;
  category?: string;
}

export type ContextCreationData = Omit<Context, "id">;

export interface PromptEditorProps {
  onCopySuccess?: () => void;
}

export interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContext: ContextCreationData) => void;
}
