import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast as sonnerToast } from "sonner";
import { useLocalStore } from "@/store/localStore";
import { LucideCopy, LucideChevronDown, LucideDownload } from "lucide-react";

export const CopyAllButton = () => {
  const getConstructedPrompt = (asMarkdown: boolean) => {
    const { prompt, selectedContexts } = useLocalStore.getState();

    const contextsText = selectedContexts
      .map((context) => {
        if (asMarkdown) {
          // Format for markdown file
          return `# ${context.title}\n\n---\n\n${context.content}`;
        }
        // Format for plain text copy
        return `${context.title}\n${"=".repeat(20)}\n${context.content}`;
      })
      .join(`\n\n`);

    const fullText = prompt ? `${prompt}\n\n${contextsText}` : contextsText;
    return fullText;
  };

  const onCopyAll = () => {
    const fullText = getConstructedPrompt(false);

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
          description: "The prompt and contexts have been copied as text.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        sonnerToast.error("Copy Failed", {
          description: "Could not copy text to clipboard.",
        });
      });
  };

  const onDownloadAsMarkdown = () => {
    const markdownText = getConstructedPrompt(true);
    if (!markdownText.trim()) {
      sonnerToast.error("Nothing to Download", {
        description: "The prompt and selected contexts are empty.",
      });
      return;
    }
    const blob = new Blob([markdownText], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "prompt.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    sonnerToast.success("Download Started", {
      description: "Your prompt.md file is downloading.",
    });
  };

  return (
    <div className="flex mt-4 justify-end">
      <div className="flex">
        <Button onClick={onCopyAll} className="w-full rounded-r-none" size="lg">
          <LucideCopy className="mr-2 h-4 w-4" /> Copy as markdown
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="px-2 rounded-l-none border-l border-primary-foreground/20"
              aria-label="More copy options"
            >
              <LucideChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={onDownloadAsMarkdown}>
              <LucideDownload className="mr-2 h-4 w-4" />
              <span>Download as Markdown</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
