import React, { useRef } from "react";
import { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";
import { useLocalStore } from "@/localStore";
import TurnDownService from "turndown";

const turndownService = new TurnDownService();

const PromptInput: React.FC = () => {
  const { prompt, setPrompt } = useLocalStore();

  const editorContainerRef = useRef<HTMLDivElement>(null);

  const handleFocusClick = () => {
    if (editorContainerRef.current) {
      const editableElement =
        editorContainerRef.current.querySelector<HTMLElement>(".ProseMirror");

      if (editableElement) {
        editableElement.focus();
      }
    }
  };

  const handleSetPrompt = (inputContent: Content) => {
    setPrompt(turndownService.turndown(inputContent as string));
  };

  return (
    <div className="w-full h-full" onClick={handleFocusClick}>
      <MinimalTiptapEditor
        ref={editorContainerRef}
        value={prompt}
        onChange={handleSetPrompt}
        className="w-full h-full"
        editorContentClassName="p-5 overflow-y-auto flex-1"
        output="html"
        placeholder="Enter your prompt here..."
        autofocus={true}
        editable={true}
        editorClassName="focus:outline-none"
      />
    </div>
  );
};

export default PromptInput;
