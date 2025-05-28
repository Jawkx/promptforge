import React, { useState } from 'react';
import { Context } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

interface AddContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (context: Omit<Context, 'id'>) => void;
}

const AddContextModal: React.FC<AddContextModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSave({
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || 'Uncategorized'
      });
      setTitle('');
      setContent('');
      setCategory('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card
        onClick={e => e.stopPropagation()}
        className='w-1/2'
      >
        <CardHeader className='flex flex-row'>
          <CardTitle className="text-xl font-semibold text-dark-50">Add New Context</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="mb-4 space-y-1.5">
              <Label htmlFor="title">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Context title"
                required
              />
            </div>

            <div className="mb-4 space-y-1.5">
              <Label htmlFor="category" >
                Category
              </Label>
              <Input
                type="text"
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g., Programming, Writing (optional)"
              />
            </div>

            <div className="mb-6 space-y-1.5">
              <Label htmlFor="content" >
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Context content"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
              >
                Save Context
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddContextModal;
