"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import { Bold, Italic, Underline as UnderlineIcon, List, Heading1, Heading2, Heading3 } from "lucide-react";

// Props interface - defines what data this component expects
interface RichTextEditorProps {
  value: string; // Current HTML content
  onChange: (value: string) => void; // Callback when content changes
  placeholder?: string; // Placeholder text when empty
  pageColor?: string; // Background color (hex code)
  linedPaper?: boolean; // Whether to show lined background (for now no)
}

// Ref interface - defines methods that parent components can call
export interface RichTextEditorRef {
  insertPromptAsHeading: (prompt: string) => void; // Method to insert prompt as heading
}

// RichTextEditor component
// forwardRef allows parent components to access methods via ref
const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  function RichTextEditor({ value, onChange, placeholder = "Start writing...", pageColor, linedPaper }, ref) {

    // Initialize Tiptap editor with extensions
    const editor = useEditor({
      extensions: [
        StarterKit, // Includes: bold, italic, headings, lists, etc.
        Underline, // Underline formatting
        Highlight.configure({ multicolor: true }), // Text highlighting
      ],
      content: value, // Initial content
      immediatelyRender: false, // Prevent SSR hydration issues in Next.js
      onUpdate: ({ editor }) => {
        // Called whenever content changes
        const html = editor.getHTML();
        onChange(html);
      },
      editorProps: {
        attributes: {
          class: "prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4",
        },
      },
    });

    // Expose methods to parent components via ref
    // SYNTAX: useImperativeHandle(ref, callback) - React hook to expose methods to parent via ref
    //         The callback returns an object with methods that parent can call via ref.current.methodName()
    //         ref comes from forwardRef wrapper (see component definition)
    useImperativeHandle(ref, () => ({
      insertPromptAsHeading: (prompt: string) => {
        if (!editor) return; // Early return if editor not initialized (defensive check)

        // #1: Insert Prompt as H3 Heading with Paragraph Below
        // WHY: User requested that prompts insert as headings (like Google Docs), and clicking
        //      underneath should default to regular body text, not heading format.
        // HOW: Use Tiptap's insertContent to insert HTML directly - `<h3>${prompt}</h3><p></p>`
        //      The empty paragraph ensures cursor is positioned in paragraph mode for regular text.
        // SYNTAX BREAKDOWN:
        //   - editor.chain() - Tiptap's chainable API (returns EditorChain object)
        //   - .focus() - Focuses the editor (chainable method)
        //   - .insertContent(htmlString) - Inserts HTML content at cursor position
        //     - Template literal: `...` allows ${prompt} interpolation
        //     - HTML string: `<h3>...</h3><p></p>` - H3 heading + empty paragraph
        //   - .run() - Executes the chain (required to actually perform the operations)
        // REFERENCES:
        //   - editor: Tiptap Editor instance from useEditor() hook (line ~30)
        //   - prompt: string parameter passed from parent component
        //   - insertContent: Tiptap command from @tiptap/core library
        // APPROACH: Simple and direct - Tiptap handles cursor positioning automatically.
        //           No setTimeout needed - this is conventional Tiptap usage.
        // CONNECTION: Called from PromptSuggestions component when user clicks a prompt button.
        editor.chain()
          .focus()
          .insertContent(`<h3>${prompt}</h3><p></p>`) // Insert H3 + empty paragraph
          .run();
      },
    }));

    // Update editor content when value prop changes (for editing existing entries)
    useEffect(() => {
      if (editor && value !== editor.getHTML()) {
        editor.commands.setContent(value);
      }
    }, [value, editor]);

    if (!editor) {
      return <div>Loading editor...</div>;
    }

    // Determine background style
    const backgroundStyle: React.CSSProperties = {};
    if (pageColor) {
      backgroundStyle.backgroundColor = pageColor;
    }
    if (linedPaper) {
      backgroundStyle.backgroundImage = "repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)";
      backgroundStyle.backgroundSize = "100% 32px";
    }

    return (
      <div
        className="border border-gray-300 rounded-lg overflow-hidden"
        style={{ backgroundColor: "var(--background, #ffffff)" }}
      >
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1" style={{ backgroundColor: "var(--background, #ffffff)", opacity: 0.95 }}>
          {/* Bold Button */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 ${editor.isActive("bold") ? "bg-gray-200 text-gray-900" : ""
              }`}
            title="Bold (Ctrl+B)"
          >
            <Bold size={18} />
          </button>

          {/* Italic Button */}
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 ${editor.isActive("italic") ? "bg-gray-200 text-gray-900" : ""
              }`}
            title="Italic (Ctrl+I)"
          >
            <Italic size={18} />
          </button>

          {/* Underline Button */}
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 ${editor.isActive("underline") ? "bg-gray-200 text-gray-900" : ""
              }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={18} />
          </button>

          {/* Divider */}
          <div className="w-px bg-gray-300 mx-1 h-6 self-center"></div>

          {/* Bullet List Button */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 ${editor.isActive("bulletList") ? "bg-gray-200 text-gray-900" : ""
              }`}
            title="Bullet List"
          >
            <List size={18} />
          </button>

          {/* Heading 1 Button */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 ${editor.isActive("heading", { level: 1 }) ? "bg-gray-200 text-gray-900" : ""
              }`}
            title="Heading 1"
          >
            <Heading1 size={18} />
          </button>

          {/* Heading 2 Button */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200 text-gray-900" : ""
              }`}
            title="Heading 2"
          >
            <Heading2 size={18} />
          </button>

          {/* Heading 3 Button */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-100 transition-colors text-gray-700 ${editor.isActive("heading", { level: 3 }) ? "bg-gray-200 text-gray-900" : ""
              }`}
            title="Heading 3"
          >
            <Heading3 size={18} />
          </button>
        </div>

        {/* Editor Content Area */}
        <div style={backgroundStyle} className="relative">
          <EditorContent editor={editor} />
          {!editor.getText() && (
            <div className="absolute top-4 left-4 pointer-events-none text-gray-400">
              {placeholder}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default RichTextEditor;
