export const PREDEFINED_LABEL_COLORS = [
  { name: "Red", value: "red", twBgClass: "bg-red-500", twChipClass: "bg-red-100 text-red-700 border-red-300 dark:bg-red-700 dark:text-red-100 dark:border-red-500" },
  { name: "Blue", value: "blue", twBgClass: "bg-blue-500", twChipClass: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-700 dark:text-blue-100 dark:border-blue-500" },
  { name: "Green", value: "green", twBgClass: "bg-green-500", twChipClass: "bg-green-100 text-green-700 border-green-300 dark:bg-green-700 dark:text-green-100 dark:border-green-500" },
  { name: "Yellow", value: "yellow", twBgClass: "bg-yellow-500", twChipClass: "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-700 dark:text-yellow-100 dark:border-yellow-500" },
  { name: "Purple", value: "purple", twBgClass: "bg-purple-500", twChipClass: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-700 dark:text-purple-100 dark:border-purple-500" },
] as const;

export type LabelColorValue = typeof PREDEFINED_LABEL_COLORS[number]['value'];

export interface ContextLabel {
  id: string;
  text: string;
  color: LabelColorValue;
}

export interface Context {
  id: string;
  title: string;
  content: string;
  labels: ContextLabel[];
}

export type ContextCreationData = Omit<Context, "id" | "labels"> & {
  labels: Omit<ContextLabel, "id">[];
};

export interface PromptEditorProps {
  onCopySuccess?: () => void;
}

export interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newContext: ContextCreationData) => void;
}

