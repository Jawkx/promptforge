import React, { useState, useCallback, useRef } from 'react';
import { useContexts } from '../hooks/useContexts';
import { Context } from '../types';
import PromptInput from './PromptInput';
import ContextsLibrary from './ContextsLibrary';
import AddContextModal from './AddContextModal';
import EditContextModal from './EditContextModal';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


interface PromptEditorProps {
  onCopySuccess: () => void; // Changed from onCopy to onCopySuccess to avoid naming conflicts
}

const PROMPT_FORGE_AREA = "promptForge";
const CONTEXT_LIBRARY_AREA = "contextLibrary";

const PromptEditor: React.FC<PromptEditorProps> = ({ onCopySuccess }) => {
  const {
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
  } = useContexts();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [contextToDeleteId, setContextToDeleteId] = useState<string | null>(null);

  const { toast } = useToast();

  const [focusedArea, setFocusedArea] = useState<string>(PROMPT_FORGE_AREA);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const contextData = e.dataTransfer.getData('application/json');
      if (contextData) {
        const context = JSON.parse(contextData) as Context;
        addContextToPrompt(context);
      }
    } catch (error) {
      console.error('Error parsing dropped context:', error);
      toast({ title: "Drop Error", description: "Failed to add context from drop.", variant: "destructive" });
    }
  }, [addContextToPrompt, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, context: Context) => {
    e.dataTransfer.setData('application/json', JSON.stringify(context));
    e.dataTransfer.effectAllowed = "move";
  }, []);


  const handleCopy = () => {
    const copiedText = copyPromptWithContexts();
    if (copiedText) {
      onCopySuccess();
    }
  };

  const handleAddContextButtonClick = () => {
    setAddModalOpen(true);
  };

  const handleEditContext = (context: Context) => {
    setEditingContext(context);
    setEditModalOpen(true);
  };

  const handleDeleteContextRequest = (id: string) => {
    setContextToDeleteId(id);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteContext = () => {
    if (contextToDeleteId) {
      deleteContext(contextToDeleteId);
    }
    setDeleteConfirmationOpen(false);
    setContextToDeleteId(null);
  };


  const handleSaveNewContext = (newContextData: Omit<Context, 'id'>) => {
    const success = addContext(newContextData);
    if (success) {
      setAddModalOpen(false);
    }
  };

  const handleSaveEdit = (updatedContextData: Context) => {
    const success = updateContext(updatedContextData);
    if (success) {
      setEditModalOpen(false);
      setEditingContext(null);
    }
  };

  const handlePasteToLibrary = (pastedText: string) => {
    addContextFromPaste(pastedText);
  };


  return (
    <div className="h-[calc(100vh-100px)] p-4 max-w-7xl mx-auto">
      <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg">
        <ResizablePanel defaultSize={60} minSize={30}>
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            selectedContexts={selectedContexts}
            onRemoveContext={removeContextFromPrompt}
            onCopy={handleCopy}
            isFocused={focusedArea === PROMPT_FORGE_AREA}
            onFocus={() => setFocusedArea(PROMPT_FORGE_AREA)}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className='mx-2 bg-transparent' />
        <ResizablePanel defaultSize={40} minSize={25}>
          <ContextsLibrary
            contexts={contexts}
            onDragStart={handleDragStart}
            onAddContextButtonClick={handleAddContextButtonClick}
            onEditContext={handleEditContext}
            onDeleteContext={handleDeleteContextRequest}
            onPasteToAdd={handlePasteToLibrary}
            isFocused={focusedArea === CONTEXT_LIBRARY_AREA}
            onFocus={() => setFocusedArea(CONTEXT_LIBRARY_AREA)}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      <AddContextModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveNewContext}
        contextsCount={contexts.length}
      />
      {editingContext && (
        <EditContextModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingContext(null);
          }}
          onSave={handleSaveEdit}
          context={editingContext}
        />
      )}
      <AlertDialog open={deleteConfirmationOpen} onOpenChange={setDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the context
              "{contexts.find(c => c.id === contextToDeleteId)?.title || 'this context'}" from the library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContextToDeleteId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteContext}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PromptEditor;
