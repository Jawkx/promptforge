import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Context } from '../types';
import { Card } from './ui/card';

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
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-dark-50">Add New Context</h2>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-dark-200 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-dark-50"
              placeholder="Context title"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-dark-200 mb-1">
              Category
            </label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-dark-50"
              placeholder="e.g., Programming, Writing (optional)"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="content" className="block text-sm font-medium text-dark-200 mb-1">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-dark-50 min-h-[100px]"
              placeholder="Context content"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-dark-600 rounded-md text-dark-200 hover:bg-dark-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Context
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddContextModal;
