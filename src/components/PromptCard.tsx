// prompt component - NOT NEEDED with auto-insert approach
//
// WHAT WE'RE CREATING:
// - This component is NOT NEEDED with the auto-insert approach
// - Prompts are automatically inserted as headers in the editor (no separate component)
// - This file can be deleted or left empty
//
// OWNERSHIP:
// - Not needed - prompts go directly into RichTextEditor
//
// COORDINATION NOTES:
// - Michael implements auto-insert logic in app/journal/new/page.tsx instead
// - No component needed - prompts are built into the page
//
// CONTEXT FOR AI ASSISTANTS:
// - With auto-insert approach, prompts are automatically inserted as headers when page loads
// - No separate component needed - prompts go directly into RichTextEditor
// - This file can be deleted or left empty
// - Person 1 implements auto-insert logic in app/journal/new/page.tsx instead
//
// DEVELOPMENT NOTES:
// - Card should look clickable (hover effects, cursor pointer)
// - Show prompt text clearly
// - Handle click to insert prompt (via callback to parent)
// - Consider showing prompt type (person, topic) if available
//
// TODO: implement prompt card component
//
// FUNCTIONALITY:
// - Display prompt text
// - Handle click to insert prompt
// - Visual feedback on hover/click
//
// UI:
// - Button design (can be styled as card-like button or simple button)
// - Hover effect (scale, shadow change, or color change)
// - Clear typography for prompt text
// - Simple and clean - prompts are built into the page, not floating cards
//
// PROPS:
// - prompt: string - the prompt text to display
// - onSelect: () => void - callback when prompt is clicked
//
// SYNTAX:
// "use client";
//
// interface PromptCardProps {
//   prompt: string;
//   onSelect: () => void;
// }
//
// export default function PromptCard({ prompt, onSelect }: PromptCardProps) {
//   // implementation
// }

"use client";

// TODO: implement prompt card component

