import { useState } from 'react';
import { Context } from '../types';

const initialContexts: Context[] = [
];

export const useContexts = () => {
  const [contexts, setContexts] = useState<Context[]>(initialContexts);
  const [prompt, setPrompt] = useState<string>('');
  const [selectedContexts, setSelectedContexts] = useState<Context[]>([]);

  const addContext = (context: Omit<Context, 'id'>) => {
    const newContext: Context = {
      ...context,
      id: Date.now().toString()
    };
    setContexts([...contexts, newContext]);
  };

  const updateContext = (updatedContext: Context) => {
    setContexts(contexts.map(context =>
      context.id === updatedContext.id ? updatedContext : context
    ));

    setSelectedContexts(selectedContexts.map(context =>
      context.id === updatedContext.id ? updatedContext : context
    ));
  };

  const deleteContext = (id: string) => {
    setContexts(contexts.filter(context => context.id !== id));
    setSelectedContexts(selectedContexts.filter(context => context.id !== id));
  };

  const removeContext = (id: string) => {
    setSelectedContexts(selectedContexts.filter(context => context.id !== id));
  };

  const copyPromptWithContexts = () => {
    const contextsText = selectedContexts
      .map(context => `# ${context.title}\n${context.content}`)
      .join('\n\n');

    const fullText = prompt
      ? `${prompt}\n\n${contextsText}`
      : contextsText;

    navigator.clipboard.writeText(fullText)
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });

    return fullText;
  };

  const addContextToPrompt = (context: Context) => {
    if (!selectedContexts.some(c => c.id === context.id)) {
      setSelectedContexts([...selectedContexts, context]);
    }
  };

  return {
    contexts,
    prompt,
    setPrompt,
    selectedContexts,
    addContext,
    updateContext,
    deleteContext,
    removeContext,
    copyPromptWithContexts,
    addContextToPrompt
  };
};
