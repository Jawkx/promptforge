import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LucideArrowLeft, LucideSave } from "lucide-react";
import { useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { v4 as uuid } from "uuid";
import { getRandomUntitledPlaceholder } from "@/constants/titlePlaceholders";

const AddContext: React.FC = () => {
  const [, navigate] = useLocation();
  const { store } = useStore();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleCancel = () => {
    navigate("/");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const finalTitle =
      title.length !== 0 ? title.trim() : getRandomUntitledPlaceholder();
    const finalContent = content.trim();

    if (!finalTitle && !finalContent) {
      toast({
        title: "Empty Context",
        description:
          "Both title and content are empty. Please add some content or a title.",
        variant: "destructive",
      });
      return;
    }
    if (!finalContent && finalTitle) {
      // Allow this case
    } else if (!finalContent) {
      toast({
        title: "Empty Content",
        description:
          "Content cannot be empty if title is also blank or nearly blank.",
        variant: "destructive",
      });
      return;
    }

    const id = uuid();
    store.commit(
      events.contextCreated({ id, title: finalTitle, content: finalContent }),
    );

    navigate("/");
  };

  return (
    <div className="p-6 h-screen flex flex-col max-w-screen-lg mx-auto">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Add New Context</h1>
          <p className="text-muted-foreground">
            Create a new context snippet to use in your prompts.
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <LucideArrowLeft className="mr-2" />
          Back to Editor
        </Button>
      </header>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional, will be auto-generated if blank)"
        />
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 min-h-[250px] resize-y"
          placeholder="Paste your context content here."
        />
        <footer className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <LucideSave className="mr-2" />
            Add Context
          </Button>
        </footer>
      </form>
    </div>
  );
};

export default AddContext;
