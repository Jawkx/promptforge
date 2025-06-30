import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuid } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateId = () => `context-${uuid()}`;

export const generateLabelId = () => `label-${uuid()}`;

export const estimateTokens = (text: string): number => {
  // A rough estimate: 1 token for every 4 characters.
  // This is a common heuristic for English text across many LLMs.
  return Math.ceil(text.length / 4);
};

export const formatTokenCount = (count: number): string => {
  if (count < 1000) {
    return String(count);
  }
  if (count < 1_000_000) {
    const num = Math.floor(count / 1000);
    return `${num}k`;
  }
  const num = Math.floor(count / 1_000_000);
  return `${num}M`;
};
