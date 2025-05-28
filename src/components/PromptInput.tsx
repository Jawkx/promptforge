import React from 'react';
import { X, Copy } from 'lucide-react';
import { Context } from '../types';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

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
    <>
      <div
        onDragOver={handleDragOver}
        onDrop={onDrop}
        className='w-full h-auto relative'
      >
        <Textarea
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder="Carve your context here ..."
          className='flex-1 resize-y max-h-[48rem] min-h-32 z-10'
        />

        <Button
          onClick={onCopy}
          className='absolute bottom-4 right-4 z-10'
        >
          <Copy size={16} />
          Copy
        </Button>

        <div className='absolute w-full border-t border-border min-h-28 p-4 bottom-3 z-0'>
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

      </div>

    </>
  );
};

export default PromptInput;


