"use client";

import { Lightbulb } from "lucide-react";
import { Prompt } from "@/lib/nlp/prompts";
import { RichTextEditorRef } from "@/components/ui/RichTextEditor";

interface PromptSuggestionsProps {
  prompts: Prompt[];
  editorRef: React.RefObject<RichTextEditorRef | null>;
  onPromptInserted?: (promptId: string) => void; // Called when prompt is inserted (not permanently used)
}

export default function PromptSuggestions({
  prompts,
  editorRef,
  onPromptInserted,
}: PromptSuggestionsProps) {
  const handleInsertPrompt = (prompt: Prompt) => {
    if (!editorRef.current) return;

    // Insert prompt as heading in the editor
    editorRef.current.insertPromptAsHeading(prompt.text);

    // Notify parent that prompt was inserted (but not permanently used yet)
    onPromptInserted?.(prompt.id);
  };

  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Writing Prompts
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Click a prompt to insert it as a heading in your entry. You can edit it
        after inserting.
      </p>
  
      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="flex gap-2 min-w-max">
          {prompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleInsertPrompt(prompt)}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200 whitespace-nowrap flex-shrink-0"
              title={`Insert: ${prompt.text}`}
            >
              {prompt.text}
            </button>
          ))}
        </div>
      </div>
      {prompts.length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          Prompts are based on people, topics, and dates from your previous
          entries. If you delete a prompt from the editor, it will reappear here.
          Prompts are only marked as used when you save the entry.
        </p>
      )}
    </div>
  );
}

