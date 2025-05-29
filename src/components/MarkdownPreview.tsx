import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub Flavored Markdown support (tables, strikethrough, etc.)
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  isFocused: boolean;
  onFocus: () => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  isFocused,
  onFocus,
}) => {
  return (
    <Card
      className={cn(
        "h-full flex flex-col border-2",
      )}
      onClick={onFocus} // Allows the card to become "focused" visually
    >
      <CardContent className="p-0 flex-grow flex flex-col overflow-hidden">
        <ScrollArea className="h-full w-full">
          {/* 
            The `prose` classes from @tailwindcss/typography provide nice default styling for markdown.
            Ensure you have `@tailwindcss/typography` plugin installed and configured in your tailwind.config.js.
            If not, the markdown will be unstyled HTML.
          */}
          <div className="prose dark:prose-invert max-w-none p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default MarkdownPreview;
