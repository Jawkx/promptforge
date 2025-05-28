import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { Context } from '../types';

interface ContextItemProps {
  context: Context;
  onDragStart: (context: Context) => void;
  onEdit: (context: Context) => void;
  onDelete: (id: string) => void;
}

const ContextItem: React.FC<ContextItemProps> = ({ context, onDragStart, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('context', JSON.stringify(context));
    onDragStart(context);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group bg-dark-700 rounded-lg p-3 mb-3 shadow-sm border border-dark-600 cursor-move hover:shadow-md transition-shadow duration-200 relative"
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-dark-50 mb-1 truncate pr-7">{context.title}</h3>
          <p className="text-sm text-dark-300 truncate">{context.content.substring(0, 50)}...</p>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-dark-400 hover:text-dark-50 hover:bg-dark-600 rounded"
            aria-label="Context menu"
          >
            <MoreVertical size={16} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-36 bg-dark-800 rounded-lg shadow-lg border border-dark-600 py-1 z-10">
              <button
                onClick={() => {
                  onEdit(context);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-dark-50 hover:bg-dark-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete(context.id);
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-dark-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContextItem;
