import { Button } from "@/components/ui/button";
import { toast as sonnerToast } from "sonner";
import { useLocalStore } from "@/store/app.store";
import { LucideCopy } from "lucide-react";
import { useCallback } from "react";

export const CopyAllButton = () => {
  const prompt = useLocalStore((state) => state.prompt);
  const selectedContexts = useLocalStore((state) => state.selectedContexts);

  const onCopyPromptAndContextsClick = useCallback(() => {
    const contextsText = selectedContexts
      .map(
        (context) =>
          `${context.title}\n ${"=".repeat(20)} \n${context.content}`,
      )
      .join(`\n\n`);

    const fullText = prompt ? `${prompt}\n\n${contextsText}` : contextsText;

    if (!fullText.trim()) {
      sonnerToast.error("Nothing to Copy", {
        description: "The prompt and selected contexts are empty.",
      });
      return;
    }

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        sonnerToast.success("Copied to Clipboard!", {
          description: "The prompt and contexts have been copied.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        sonnerToast.error("Copy Failed", {
          description: "Could not copy text to clipboard.",
        });
      });
  }, [selectedContexts, prompt]);

  return (
    <Button
      onClick={onCopyPromptAndContextsClick}
      className="mt-4 w-full"
      size="lg"
    >
      <LucideCopy className="mr-2 h-4 w-4" /> Copy All
    </Button>
  );
};
