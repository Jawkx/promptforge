import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { Context } from '../types';
import { Card, CardHeader, CardTitle } from './ui/card';

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
    <Card
      draggable
      onDragStart={handleDragStart}
      className='cursor-pointer'
    >
      <CardHeader>
        <CardTitle className="font-medium text-dark-50 mb-1 truncate pr-7">{context.title}</CardTitle>
        <div className='bg-muted rounded-sm p-1'>
          <p className="text-xs text-muted-foreground font-light line-clamp-3">{context.content}...</p>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ContextItem;
