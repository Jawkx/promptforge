import { Button } from "@/components/ui/button";
import { toast as sonnerToast } from "sonner";
import { useLocalStore } from "@/store/localStore";
import { LucideCopy, Download } from "lucide-react";

export const CopyAllButton = () => {
  const generateMarkdownContent = () => {
    const { prompt, selectedContexts } = useLocalStore.getState();

    let markdown = "";

    if (prompt) {
      markdown += `# Prompt\n\n${prompt}\n\n`;
    }

    if (selectedContexts.length > 0) {
      markdown += `# Contexts\n\n`;
      selectedContexts.forEach((context) => {
        markdown += `## ${context.title}\n\n${context.content}\n\n`;
      });
    }

    return markdown;
  };

  const onCopyPromptAndContextsClick = () => {
    const { prompt, selectedContexts } = useLocalStore.getState();

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
  };

  const onDownloadMarkdownClick = () => {
    const markdownContent = generateMarkdownContent();

    if (!markdownContent.trim()) {
      sonnerToast.error("Nothing to Download", {
        description: "The prompt and selected contexts are empty.",
      });
      return;
    }

    try {
      const blob = new Blob([markdownContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "prompt-and-contexts.md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      sonnerToast.success("Downloaded!", {
        description: "Markdown file has been downloaded.",
      });
    } catch (err) {
      console.error("Failed to download file: ", err);
      sonnerToast.error("Download Failed", {
        description: "Could not download the markdown file.",
      });
    }
  };

  return (
    <div className="mt-4 flex gap-2">
      <Button
        onClick={onCopyPromptAndContextsClick}
        className="flex-1"
        size="lg"
      >
        <LucideCopy className="mr-2 h-4 w-4" /> Copy All
      </Button>
      <Button
        onClick={onDownloadMarkdownClick}
        className="flex-1"
        size="lg"
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" /> Download
      </Button>
    </div>
  );
};
