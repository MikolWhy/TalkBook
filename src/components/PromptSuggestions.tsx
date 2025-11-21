"use client";

import { Prompt } from "../lib/nlp/prompts";
import { RichTextEditorRef } from "./RichTextEditor";

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
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        💡 Writing Prompts
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Click a prompt to insert it as a heading in your entry. You can edit it
        after inserting.
      </p>
      {/* #17: Horizontal Scrollable Prompt Row */}
      {/* WHY: User requested that when more prompts are available than can fit, they should */}
      {/*      be scrollable horizontally. This allows access to all prompts without taking */}
      {/*      up vertical space. */}
      {/* HOW: Use overflow-x-auto on container, flex with min-w-max on inner div. */}
      {/*      whitespace-nowrap prevents text wrapping, flex-shrink-0 prevents button shrinking. */}
      {/*      Negative margins (-mx-2) and padding (px-2) allow scrollbar to extend to edges. */}
      {/* SYNTAX BREAKDOWN: */}
      {/*   - className="overflow-x-auto pb-2 -mx-2 px-2" */}
      {/*     - Tailwind CSS utility classes (CSS framework) */}
      {/*     - overflow-x-auto: CSS overflow-x: auto (horizontal scrollbar when needed) */}
      {/*     - pb-2: padding-bottom: 0.5rem (space for scrollbar) */}
      {/*     - -mx-2: negative margin-left and margin-right: -0.5rem (extends to edges) */}
      {/*     - px-2: padding-left and padding-right: 0.5rem (inner padding) */}
      {/*   - className="flex gap-2 min-w-max" */}
      {/*     - flex: CSS display: flex (flexbox layout) */}
      {/*     - gap-2: CSS gap: 0.5rem (space between flex items) */}
      {/*     - min-w-max: CSS min-width: max-content (prevents shrinking below content width) */}
      {/*   - prompts.map((prompt) => (...)) */}
      {/*     - Array.map() - JavaScript Array method, creates new array by transforming each element */}
      {/*     - Arrow function: (prompt) => (...) - callback for each prompt */}
      {/*     - Returns JSX element for each prompt */}
      {/*   - key={prompt.id} */}
      {/*     - React key prop: unique identifier for list items (required for performance) */}
      {/*     - Helps React efficiently update DOM when list changes */}
      {/*   - onClick={() => handleInsertPrompt(prompt)} */}
      {/*     - onClick: React event handler prop (handles click events) */}
      {/*     - Arrow function: () => handleInsertPrompt(prompt) - calls function with prompt */}
      {/*     - Event handler receives synthetic event (React wraps native event) */}
      {/*   - className="... whitespace-nowrap flex-shrink-0" */}
      {/*     - whitespace-nowrap: CSS white-space: nowrap (prevents text wrapping) */}
      {/*     - flex-shrink-0: CSS flex-shrink: 0 (prevents button from shrinking) */}
      {/*   - title={`Insert: ${prompt.text}`} */}
      {/*     - title: HTML attribute for tooltip (shows on hover) */}
      {/*     - Template literal: `Insert: ${prompt.text}` - string interpolation */}
      {/* REFERENCES: */}
      {/*   - Tailwind CSS: Utility-first CSS framework - Tailwind CSS Documentation */}
      {/*   - Array.map(): JavaScript Array.prototype.map() - MDN Web Docs */}
      {/*   - React keys: Lists and Keys - React Documentation */}
      {/*   - onClick: Handling Events - React Documentation */}
      {/*   - CSS overflow: CSS overflow property - MDN Web Docs */}
      {/*   - CSS flexbox: CSS Flexible Box Layout - MDN Web Docs */}
      {/* APPROACH: Standard CSS horizontal scroll pattern - conventional and simple. */}
      {/*           Not over-engineered - just CSS flexbox with overflow. */}
      {/* CONNECTION: Shows prompts generated from extraction (#4, #5, #10). */}
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

