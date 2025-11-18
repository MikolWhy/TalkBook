// journal list page - displays all journal entries
// shows entries in chronological order with preview and actions
//
// WHAT WE'RE CREATING:
// - A page that lists all journal entries in reverse chronological order (newest first)
// - Each entry shows: date, mood emoji, weather, truncated content preview
// - Actions: click to view/edit, delete entry
// - Empty state when no entries exist
//
// OWNERSHIP:
// - Aadil implements this completely
//
// COORDINATION NOTES:
// - Uses repo.ts entry functions (Aadil creates)
// - No conflicts - Aadil owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This page shows all journal entries in a list
// - Entries are displayed in reverse chronological order (newest first)
// - Each entry shows: date, mood, weather, truncated content preview
// - Actions: view, edit, delete
// - Supports filtering and search (future enhancement)
//
// DEVELOPMENT NOTES:
// - Fetch all entries from database (or use journalStore cache)
// - Display entries as cards with preview
// - Show rich text content (use dangerouslySetInnerHTML with sanitization)
// - Link to edit page for each entry
// - Delete confirmation before deleting
// - Empty state when no entries exist
//
// TODO: implement journal list page
//
// FUNCTIONALITY:
// - Load entries from database
// - Display entries in reverse chronological order
// - Show entry preview (date, mood emoji, weather, truncated content)
// - Link to edit page
// - Delete entry with confirmation
// - Empty state message
//
// UI:
// - List of entry cards
// - Each card: date, mood, weather, content preview, actions
// - Hover effects on cards
// - Responsive grid/list layout
//
// SYNTAX:
// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getEntries, deleteEntry } from "@/lib/db/repo";
//
// export default function JournalPage() {
//   // implementation
// }

"use client";

//adding to use nav links
import Link from "next/link";
import DashboardLayout from "../components/DashboardLayout";

// TODO: implement journal list page

// TEMPORARY: Basic page structure to prevent navigation errors
// This will be replaced with full implementation later
export default function JournalPage() {
  return (
    <DashboardLayout>
      {/* Header Section with Title and New Entry Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journal</h1>
        
        {/* New Entry Button */}
        <Link
          href="/journal/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ✍️ New Entry
        </Link>
      </div>
      
      <p className="text-gray-600">Journal entries will be displayed here.</p>
    </DashboardLayout>
  );
}

