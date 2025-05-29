export interface Context {
  id: string;
  title: string;
  content: string;
  category?: string;
}

export interface ContextsLibraryProps {
  contexts: Context[];
  onDragStart: (context: Context) => void;
  onAddContext: () => void;
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
}

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onDrop: (e: React.DragEvent) => void;
  selectedContexts: Context[];
  onRemoveContext: (id: string) => void;
  onCopy: () => void;
}

export interface PromptEditorProps {
  onCopy: () => void;
}

export interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: Omit<Context, "id">) => void;
}
