import React, { useState } from 'react';
import PromptInput from './PromptInput';
import ContextsLibrary from './ContextsLibrary';
import AddContextModal from './AddContextModal';
import EditContextModal from './EditContextModal';
import { useContexts } from '../hooks/useContexts';
import { Context } from '../types';

interface PromptEditorProps {
  onCopy: () => void;
}


const PromptEditor: React.FC<PromptEditorProps> = ({ onCopy }) => {
  const {
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
  } = useContexts();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingContext, setEditingContext] = useState<Context | null>(null);
  const [draggingContext, setDraggingContext] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const contextData = e.dataTransfer.getData('context');
      if (contextData) {
        const context = JSON.parse(contextData);
        addContextToPrompt(context);
      }
    } catch (error) {
      console.error('Error parsing dropped context:', error);
    }
    setDraggingContext(false);
  };

  const handleDragStart = () => {
    setDraggingContext(true);
  };

  const handleCopy = () => {
    const text = copyPromptWithContexts();
    onCopy();
    return text;
  };

  const handleAddContext = () => {
    setAddModalOpen(true);
  };

  const handleEditContext = (context: Context) => {
    setEditingContext(context);
    setEditModalOpen(true);
  };

  const handleSaveContext = (newContext: Omit<Context, 'id'>) => {
    addContext(newContext);
  };

  const handleSaveEdit = (updatedContext: Context) => {
    updateContext(updatedContext);
  };

  return (
    <div className="w-full h-full mx-auto max-w-7xl px-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-150px)]">
        <div className="lg:col-span-2 h-full">
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onDrop={handleDrop}
            selectedContexts={selectedContexts}
            onRemoveContext={removeContext}
            onCopy={handleCopy}
          />
        </div>

        <div className="h-full">
          <ContextsLibrary
            contexts={contexts}
            onDragStart={handleDragStart}
            onAddContext={handleAddContext}
            onEditContext={handleEditContext}
            onDeleteContext={deleteContext}
          />
        </div>
      </div>

      <AddContextModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleSaveContext}
      />

      <EditContextModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingContext(null);
        }}
        onSave={handleSaveEdit}
        context={editingContext}
      />
    </div>
  );
};

export default PromptEditor;
