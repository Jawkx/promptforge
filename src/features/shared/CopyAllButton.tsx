import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLocalStore } from "@/store/app.store";
import { LucideCopy } from "lucide-react";
import { useCallback } from "react";

export const CopyAllButton = () => {
  const { toast } = useToast();
  const prompt = useLocalStore((state) => state.prompt);
  const selectedContexts = useLocalStore((state) => state.selectedContexts);

  const onCopyPromptAndContextsClick = useCallback(() => {
    const contextsText = selectedContexts
      .map((context) => `# ${context.title}\n${context.content}`)
      .join("\n\n");

    const fullText = prompt ? `${prompt}\n\n${contextsText}` : contextsText;

    if (!fullText.trim()) {
      toast({
        title: "Nothing to Copy",
        description: "The prompt and selected contexts are empty.",
        variant: "destructive",
      });
      return;
    }

    navigator.clipboard
      .writeText(fullText)
      .then(() => {
        toast({
          title: "Copied to Clipboard!",
          description: "The prompt and contexts have been copied.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy text to clipboard.",
          variant: "destructive",
        });
      });
  }, [selectedContexts, prompt, toast]);

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
