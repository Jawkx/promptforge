import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useContexts } from "@/hooks/useContexts";
import { useLabelManager } from "@/hooks/useLabelManager";
import { Context, ContextFormData, GlobalLabel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import LabelManagerUI from "@/components/LabelManager";
import { LucideArrowLeft, LucideSave, LucideFrown } from "lucide-react";

const EditContext: React.FC = () => {
  const [, navigate] = useLocation();
  const params = useParams() as { type?: 'library' | 'selected', id?: string };
  const { type, id: contextId } = params;

  const {
    contexts,
    selectedContexts,
    updateContextInLibrary,
    updateSelectedContext,
    getAllGlobalLabels,
    getGlobalLabelById
  } = useContexts();

  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contextToEdit, setContextToEdit] = useState<Context | null>(null);

  useEffect(() => {
    let foundContext: Context | undefined;
    if (type === 'library') {
      foundContext = contexts.find(c => c.id === contextId);
    } else if (type === 'selected') {
      foundContext = selectedContexts.find(c => c.id === contextId);
    }
    setContextToEdit(foundContext || null);
  }, [contextId, type, contexts, selectedContexts]);

  const initialLabelsForThisContext = React.useMemo(() => {
    if (!contextToEdit) return [];
    return (contextToEdit.labels || [])
      .map(id => getGlobalLabelById(id))
      .filter(Boolean) as GlobalLabel[];
  }, [contextToEdit, getGlobalLabelById]);

  const labelManager = useLabelManager({
    initialLabelsForContext: initialLabelsForThisContext,
    allGlobalLabels: getAllGlobalLabels(),
  });

  useEffect(() => {
    if (contextToEdit) {
      setTitle(contextToEdit.title);
      setContent(contextToEdit.content);
      const resolvedInitialLabels = (contextToEdit.labels || [])
        .map(id => getGlobalLabelById(id))
        .filter(Boolean) as GlobalLabel[];
      labelManager.initializeLabels(resolvedInitialLabels);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextToEdit, getGlobalLabelById]);


  if (!contextToEdit) {
    return (
      <div className="p-6 h-screen flex flex-col items-center justify-center max-w-screen-lg mx-auto text-center">
        <LucideFrown className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-primary">Context Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The context you are trying to edit does not exist or could not be found.
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
    if (!contextId) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      toast({ title: "Title Required", description: "Title cannot be empty.", variant: "destructive" });
      return;
    }
    if (!trimmedContent) {
      toast({ title: "Content Required", description: "Content cannot be empty.", variant: "destructive" });
      return;
    }

    const formData: ContextFormData = {
      id: contextId,
      title: trimmedTitle,
      content: trimmedContent,
      labels: labelManager.getLabelsForSave(),
    };

    let success = false;
    if (type === 'library') {
      success = updateContextInLibrary(formData);
    } else if (type === 'selected') {
      success = updateSelectedContext(formData);
    }

    if (success) {
      navigate("/");
    }
  };

  const screenTitle = type === 'library' ? "Edit Library Context" : "Edit Selected Context";

  return (
    <div className="p-6 h-screen flex flex-col max-w-screen-lg mx-auto">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">{screenTitle}</h1>
          <p className="text-muted-foreground">
            Modify the title, content, or labels of your context snippet.
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

        <LabelManagerUI
          currentContextLabels={labelManager.currentContextLabels}
          createTemporaryLabel={labelManager.createTemporaryLabel}
          replaceAllCurrentContextLabels={labelManager.replaceAllCurrentContextLabels}
          allGlobalLabels={getAllGlobalLabels()}
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
