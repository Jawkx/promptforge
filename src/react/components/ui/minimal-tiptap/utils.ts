import type { Editor } from "@tiptap/react";
import type { MinimalTiptapProps } from "./minimal-tiptap";

type ShortcutKeyResult = {
  symbol: string;
  readable: string;
};

export const isClient = (): boolean => typeof window !== "undefined";
export const isServer = (): boolean => !isClient();
export const isMacOS = (): boolean =>
  isClient() && window.navigator.userAgent.includes("Mac");

const shortcutKeyMap: Record<string, ShortcutKeyResult> = {
  mod: isMacOS()
    ? { symbol: "⌘", readable: "Command" }
    : { symbol: "Ctrl", readable: "Control" },
  alt: isMacOS()
    ? { symbol: "⌥", readable: "Option" }
    : { symbol: "Alt", readable: "Alt" },
  shift: { symbol: "⇧", readable: "Shift" },
};

export const getShortcutKey = (key: string): ShortcutKeyResult =>
  shortcutKeyMap[key.toLowerCase()] || { symbol: key, readable: key };

export const getShortcutKeys = (keys: string[]): ShortcutKeyResult[] =>
  keys.map(getShortcutKey);

export const getOutput = (
  editor: Editor,
  format: MinimalTiptapProps["output"],
): object | string => {
  switch (format) {
    case "json":
      return editor.getJSON();
    case "html":
      return editor.isEmpty ? "" : editor.getHTML();
    default:
      return editor.getText();
  }
};

export const isUrl = (
  text: string,
  options: { requireHostname: boolean } = {
    requireHostname: false,
  },
): boolean => {
  if (text.includes("\n")) return false;

  try {
    const url = new URL(text);
    const blockedProtocols = ["javascript:", "file:", "vbscript:", "data:"];

    if (blockedProtocols.includes(url.protocol)) return false;
    if (url.hostname) return true;

    return (
      url.protocol !== "" &&
      (url.pathname.startsWith("//") || url.pathname.startsWith("http")) &&
      !options.requireHostname
    );
  } catch {
    return false;
  }
};

export const sanitizeUrl = (
  url: string | null | undefined,
): string | undefined => {
  if (!url) return undefined;

  return isUrl(url, { requireHostname: false }) ||
    /^(\/|#|mailto:|sms:|fax:|tel:)/.test(url)
    ? url
    : `https://${url}`;
};
