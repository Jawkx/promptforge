import React from 'react';
import { X, Copy } from 'lucide-react';
import { Context } from '../types';

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onDrop: (e: React.DragEvent) => void;
  selectedContexts: Context[];
  onRemoveContext: (id: string) => void;
  onCopy: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  value,
  onChange,
  onDrop,
  selectedContexts,
  onRemoveContext,
  onCopy
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    // Handle paste normally
  };

  return (
    <div
      className="h-full flex flex-col border border-dark-700 rounded-lg overflow-hidden bg-dark-800 relative"
      onDragOver={handleDragOver}
      onDrop={onDrop}
    >
      <textarea
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="Carve your context here ..."
        className="flex-grow p-4 outline-none resize-none text-dark-50 bg-dark-800 placeholder-dark-400"
      />

      <div className="absolute bottom-4 right-4">
        <button
          onClick={onCopy}
          className="flex items-center gap-1 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 transition-colors text-dark-50 rounded-lg text-sm shadow-lg"
        >
          <Copy size={16} />
          <span>Copy</span>
        </button>
      </div>

      {selectedContexts.length > 0 && (
        <div className="border-t border-dark-700 p-3 bg-dark-900">
          <h3 className="text-xs font-medium text-dark-400 mb-2">Selected Contexts</h3>
          <div className="flex flex-wrap gap-2">
            {selectedContexts.map(context => (
              <div
                key={context.id}
                className="flex items-center bg-dark-700 text-dark-50 text-xs px-2 py-1 rounded"
              >
                <span className="truncate max-w-[150px]">{context.title}</span>
                <button
                  onClick={() => onRemoveContext(context.id)}
                  className="ml-1 text-dark-400 hover:text-dark-50"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptInput;
