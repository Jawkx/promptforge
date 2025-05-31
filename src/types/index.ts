export const CONTEXT_COLOR_OPTIONS = [
  { label: "None", value: "", twBgClass: "bg-transparent border border-dashed border-gray-400", twTextClass: "text-gray-500" },
  { label: "Red", value: "red", twBgClass: "bg-red-500", twTextClass: "text-red-500" },
  { label: "Green", value: "green", twBgClass: "bg-green-500", twTextClass: "text-green-500" },
  { label: "Blue", value: "blue", twBgClass: "bg-blue-500", twTextClass: "text-blue-500" },
  { label: "Yellow", value: "yellow", twBgClass: "bg-yellow-500", twTextClass: "text-yellow-500" },
  { label: "Purple", value: "purple", twBgClass: "bg-purple-500", twTextClass: "text-purple-500" },
  { label: "Gray", value: "gray", twBgClass: "bg-gray-500", twTextClass: "text-gray-500" },
] as const; // Use "as const" for better type inference if needed

export type ContextColorValue = typeof CONTEXT_COLOR_OPTIONS[number]['value'];

export interface Context {
  id: string;
  title: string;
  content: string;
  colorLabel?: ContextColorValue; // Changed from category to colorLabel
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

