"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { forwardRef, useImperativeHandle, useEffect } from "react";

// Props interface - defines what data this component expects
interface RichTextEditorProps {
  value: string; // Current HTML content
  onChange: (value: string) => void; // Callback when content changes
  placeholder?: string; // Placeholder text when empty
  pageColor?: string; // Background color (hex code)
  linedPaper?: boolean; // Whether to show lined background
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
    useImperativeHandle(ref, () => ({
      insertPromptAsHeading: (prompt: string) => {
        if (!editor) return;
        
        // Insert prompt as heading (h3)
        editor.chain().focus().setHeading({ level: 3 }).insertContent(prompt).insertContent("\n\n").run();
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
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="border-b border-gray-200 bg-gray-50 p-2 flex flex-wrap gap-1">
          {/* Bold Button */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-gray-900 ${
              editor.isActive("bold") ? "bg-gray-300" : ""
            }`}
            title="Bold (Ctrl+B)"
          >
            <span className="font-bold">B</span>
          </button>

          {/* Italic Button */}
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-gray-900 ${
              editor.isActive("italic") ? "bg-gray-300" : ""
            }`}
            title="Italic (Ctrl+I)"
          >
            <span className="italic">I</span>
          </button>

          {/* Underline Button */}
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-gray-900 ${
              editor.isActive("underline") ? "bg-gray-300" : ""
            }`}
            title="Underline (Ctrl+U)"
          >
            <span className="underline">U</span>
          </button>

          {/* Divider */}
          <div className="w-px bg-gray-300 mx-1"></div>

          {/* Bullet List Button */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-gray-900 ${
              editor.isActive("bulletList") ? "bg-gray-300" : ""
            }`}
            title="Bullet List"
          >
            <span>• List</span>
          </button>

          {/* Heading 1 Button */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-gray-900 ${
              editor.isActive("heading", { level: 1 }) ? "bg-gray-300" : ""
            }`}
            title="Heading 1"
          >
            H1
          </button>

          {/* Heading 2 Button */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-gray-900 ${
              editor.isActive("heading", { level: 2 }) ? "bg-gray-300" : ""
            }`}
            title="Heading 2"
          >
            H2
          </button>

          {/* Heading 3 Button */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1.5 rounded hover:bg-gray-200 transition-colors text-gray-900 ${
              editor.isActive("heading", { level: 3 }) ? "bg-gray-300" : ""
            }`}
            title="Heading 3"
          >
            H3
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
