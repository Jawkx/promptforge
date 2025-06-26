import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuid } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateContextHash = (title: string, content: string): string => {
  const dataString = JSON.stringify({
    title,
    content,
  });

  let hash = 5381;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + char */
    hash = hash & hash; // Convert to 32bit integer
  }
  return String(hash >>> 0); // Ensure positive integer string
};

export const generateId = () => `context-${uuid()}`;

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
