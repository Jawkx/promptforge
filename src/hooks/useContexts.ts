import { useState, useCallback } from 'react';
import { Context } from '../types';
import { useToast } from './use-toast';

const initialContexts: Context[] = [];

const untitledCounter = 0;

const getNextUntitledTitle = (existingContexts: Context[]): string => {
  let title: string;
  let counter = existingContexts.filter(c => c.title.startsWith("Untitled (")).length + 1;
  do {
    title = `Untitled (${counter})`;
    counter++;
  } while (existingContexts.some(c => c.title === title));
  return title;
};


export const useContexts = () => {
  const [contexts, setContexts] = useState<Context[]>(initialContexts);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedContexts, setSelectedContexts] = useState<Context[]>([]);
  const { toast } = useToast();

  const addContext = useCallback((context: Omit<Context, 'id'>) => {
    let titleToUse = context.title;
    if (!titleToUse.trim()) {
      titleToUse = getNextUntitledTitle(contexts);
    }

    // Check for duplicate titles
    if (contexts.some(c => c.title === titleToUse)) {
      toast({
        title: "Duplicate Title",
        description: `A context with the title "${titleToUse}" already exists. Please choose a unique title.`,
        variant: "destructive",
      });
      // Potentially append a number or throw error, for now, let's just notify
      // For this implementation, we'll allow the modal to handle re-submission with a new title
      return false; // Indicate failure
    }

    const newContext: Context = {
      ...context,
      id: Date.now().toString(),
      title: titleToUse,
    };
    setContexts(prevContexts => [...prevContexts, newContext]);
    toast({
      title: "Context Added",
      description: `Context "${newContext.title}" has been added.`,
    });
    return true; // Indicate success
  }, [contexts, toast]);

  const addContextFromPaste = useCallback((content: string) => {
    const title = getNextUntitledTitle(contexts);
    const newContext: Context = {
      id: Date.now().toString(),
      title,
      content,
      category: 'Uncategorized',
    };
    setContexts(prevContexts => [...prevContexts, newContext]);
    toast({
      title: "Context Added",
      description: `Context "${newContext.title}" (from paste) has been added.`,
    });
  }, [contexts, toast]);


  const updateContext = useCallback((updatedContext: Context) => {
    // Check for duplicate titles, excluding the context being edited
    if (contexts.some(c => c.id !== updatedContext.id && c.title === updatedContext.title)) {
      toast({
        title: "Duplicate Title",
        description: `A context with the title "${updatedContext.title}" already exists. Please choose a unique title.`,
        variant: "destructive",
      });
      return false; // Indicate failure
    }

    setContexts(prevContexts =>
      prevContexts.map(context =>
        context.id === updatedContext.id ? updatedContext : context
      )
    );
    setSelectedContexts(prevSelectedContexts =>
      prevSelectedContexts.map(context =>
        context.id === updatedContext.id ? updatedContext : context
      )
    );
    toast({
      title: "Context Updated",
      description: `Context "${updatedContext.title}" has been updated.`,
    });
    return true; // Indicate success
  }, [contexts, toast]);


  const deleteContext = useCallback((id: string) => {
    const contextToDelete = contexts.find(c => c.id === id);
    if (contextToDelete) {
      setContexts(prevContexts => prevContexts.filter(context => context.id !== id));
      setSelectedContexts(prevSelectedContexts => prevSelectedContexts.filter(context => context.id !== id));
      toast({
        title: "Context Deleted",
        description: `Context "${contextToDelete.title}" has been deleted.`,
        variant: "destructive"
      });
    }
  }, [contexts, toast]);

  const removeContextFromPrompt = useCallback((id: string) => {
    setSelectedContexts(prevSelectedContexts => prevSelectedContexts.filter(context => context.id !== id));
    const removedContext = selectedContexts.find(c => c.id === id);
    if (removedContext) {
      toast({
        title: "Context Removed",
        description: `Context "${removedContext.title}" removed from prompt.`,
      });
    }
  }, [selectedContexts, toast]);

  const copyPromptWithContexts = useCallback(() => {
    const contextsText = selectedContexts
      .map(context => `# ${context.title}\n${context.content}`)
      .join('\n\n');

    const fullText = prompt
      ? `${prompt}\n\n${contextsText}`
      : contextsText;

    if (!fullText.trim()) {
      toast({
        title: "Nothing to Copy",
        description: "The prompt and selected contexts are empty.",
        variant: "destructive",
      });
      return "";
    }

    navigator.clipboard.writeText(fullText)
      .then(() => {
        toast({
          title: "Copied to Clipboard!",
          description: "The prompt and contexts have been copied.",
        });
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy text to clipboard.",
          variant: "destructive",
        });
      });

    return fullText;
  }, [prompt, selectedContexts, toast]);

  const addContextToPrompt = useCallback((context: Context) => {
    if (!selectedContexts.some(c => c.id === context.id)) {
      setSelectedContexts(prevSelectedContexts => [...prevSelectedContexts, context]);
      toast({
        title: "Context Selected",
        description: `Context "${context.title}" added to prompt.`,
      });
    } else {
      toast({
        title: "Context Already Selected",
        description: `Context "${context.title}" is already in the prompt.`,
        variant: "default",
      });
    }
  }, [selectedContexts, toast]);

  return {
    contexts,
    prompt,
    setPrompt,
    selectedContexts,
    addContext,
    addContextFromPaste,
    updateContext,
    deleteContext,
    removeContextFromPrompt,
    copyPromptWithContexts,
    addContextToPrompt,
    getNextUntitledTitle,
  };
};
