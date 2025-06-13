import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { Context } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LucideArrowLeft, LucideSave, LucideFrown } from "lucide-react";
import { useQuery, useStore } from "@livestore/react";
import { events } from "@/livestore/events";
import { contexts$ } from "@/livestore/queries";
import { useLocalStore } from "@/localStore";

const EditContext: React.FC = () => {
  const [, navigate] = useLocation();
  const params = useParams() as { type?: "library" | "selected"; id?: string };
  const { store } = useStore();
  const { type, id: contextId } = params;

  const { selectedContexts, updateSelectedContext } = useLocalStore();
  const contexts = useQuery(contexts$);
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contextToEdit, setContextToEdit] = useState<Context | null>(null);

  useEffect(() => {
    let foundContext: Context | undefined;
    if (type === "library") {
      foundContext = contexts.find((c) => c.id === contextId);
    } else if (type === "selected") {
      foundContext = selectedContexts.find((c) => c.id === contextId);
    }
    setContextToEdit(foundContext || null);
    if (foundContext) {
      setTitle(foundContext.title);
      setContent(foundContext.content);
    }
  }, [contextId, type, contexts, selectedContexts]);

  if (!contextToEdit && contextId) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center max-w-screen-lg mx-auto text-center">
        <LucideFrown className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-primary">Context Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The context you are trying to edit does not exist or could not be
          found.
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <LucideArrowLeft className="mr-2" />
          Back to Editor
        </Button>
      </div>
    );
  }

  const handleCancel = () => {
    navigate("/");
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!contextId || !contextToEdit) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      toast({
        title: "Title Required",
        description: "Title cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    if (!trimmedContent) {
      toast({
        title: "Content Required",
        description: "Content cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (type === "library") {
      store.commit(
        events.contextUpdated({
          id: contextId,
          title: trimmedTitle,
          content: trimmedContent,
        }),
      );
      toast({
        title: "Context Updated",
        description: `Context "${trimmedTitle}" has been updated.`,
      });
      navigate("/");
    } else if (type === "selected") {
      const updatedContext = {
        ...contextToEdit,
        title: trimmedTitle,
        content: trimmedContent,
        charCount: trimmedContent.length,
      };
      updateSelectedContext(updatedContext);
      toast({
        title: "Selected Context Updated",
        description: `Selected context "${trimmedTitle}" has been updated.`,
      });
      navigate("/");
    }
  };

  const screenTitle =
    type === "library" ? "Edit Library Context" : "Edit Selected Context";

  return (
    <div className="p-6 h-screen flex flex-col max-w-screen-lg mx-auto">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">{screenTitle}</h1>
          <p className="text-muted-foreground">
            Modify the title or content of your context snippet.
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
          placeholder="Title"
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
            Save Changes
          </Button>
        </footer>
      </form>
    </div>
  );
};

export default EditContext;
