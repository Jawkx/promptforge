import React from 'react';
import { Plus } from 'lucide-react';
import { Context } from '../types';
import ContextItem from './ContextItem';

interface ContextsLibraryProps {
  contexts: Context[];
  onDragStart: (context: Context) => void;
  onAddContext: () => void;
  onEditContext: (context: Context) => void;
  onDeleteContext: (id: string) => void;
}

const ContextsLibrary: React.FC<ContextsLibraryProps> = ({
  contexts,
  onDragStart,
  onAddContext,
  onEditContext,
  onDeleteContext
}) => {
  const groupedContexts = contexts.reduce((acc, context) => {
    const category = context.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(context);
    return acc;
  }, {} as Record<string, Context[]>);

  const sortedCategories = Object.keys(groupedContexts).sort();

  return (
    <div className="bg-dark-800 rounded-lg p-4 h-full flex flex-col border border-dark-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-xl text-dark-50">Contexts Library</h2>
        <button
          onClick={onAddContext}
          className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center text-dark-50 hover:bg-dark-600 transition-colors border border-dark-600"
          aria-label="Add new context"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="overflow-y-auto flex-grow">
        {sortedCategories.map(category => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-medium text-dark-400 mb-2">{category}</h3>
            {groupedContexts[category].map(context => (
              <ContextItem
                key={context.id}
                context={context}
                onDragStart={onDragStart}
                onEdit={onEditContext}
                onDelete={onDeleteContext}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextsLibrary;
