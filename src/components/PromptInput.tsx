import React from "react";
import { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "./ui/minimal-tiptap";
import { useLocalStore } from "@/localStore";
import TurnDownService from "turndown";

const turndownService = new TurnDownService();

const PromptInput: React.FC = () => {
  const { prompt, setPrompt } = useLocalStore();

  const handleSetPrompt = (inputContent: Content) => {
    setPrompt(turndownService.turndown(inputContent as string));
  };

  return (
    <MinimalTiptapEditor
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
  );
};

export default PromptInput;
