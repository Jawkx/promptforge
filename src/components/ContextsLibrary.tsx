import React from 'react';
import { Plus } from 'lucide-react';
import { Context } from '../types';
import ContextItem from './ContextItem';
import { Button } from './ui/button';

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
    <div className="rounded-lg p-4 h-full flex flex-col border-2 border-border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-foreground text-xl text-base">Contexts</h2>
        <Button
          variant="secondary"
          onClick={onAddContext}
          aria-label="Add new context"
        >
          <Plus size={20} className='text-base' />
        </Button>
      </div>

      <div className="overflow-y-auto flex-grow">
        {sortedCategories.map(category => (
          <div key={category} className="mb-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">{category}</h3>
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
