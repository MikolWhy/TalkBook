// edit journal entry page - update existing entry
// similar to new page but pre-fills with existing entry data
//
// WHAT WE'RE CREATING:
// - A page for editing existing journal entries
// - Pre-fills form with existing entry data (content, mood, weather)
// - Same interface as new entry page but with update/delete actions
// - Handles entry not found (404 error)
//
// OWNERSHIP:
// - Aadil implements this completely
//
// COORDINATION NOTES:
// - Uses repo.ts entry functions (Aadil creates)
// - Uses RichTextEditor component (Aadil creates)
// - No conflicts - Aadil owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This page allows editing existing journal entries
// - Pre-fills form with existing entry data
// - Supports updating all fields (content, mood, weather)
// - Can delete entry from this page
//
// DEVELOPMENT NOTES:
// - Fetch entry by ID from URL params
// - Pre-fill RichTextEditor with existing content
// - Pre-select mood and weather
// - Update entry on save (don't create new one)
// - Delete entry with confirmation
// - Handle entry not found (404)
//
// TODO: implement entry editing form
//
// FUNCTIONALITY:
// - Load entry by ID from database
// - Pre-fill form with existing data
// - Update entry on save
// - Delete entry with confirmation
// - Navigate back to journal list after save/delete
// - Show 404 if entry not found
//
// UI:
// - Same as new entry page but with pre-filled data
// - Delete button (in addition to save)
//
// SYNTAX:
// "use client";
// import { useEffect, useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useParams } from "next/navigation";
// import { getEntryById, updateEntry, deleteEntry } from "@/lib/db/repo";
//
// export default function EditEntryPage() {
//   const params = useParams();
//   const entryId = parseInt(params.id as string);
//   // implementation
// }

"use client";

import { useParams } from "next/navigation";

// TODO: implement entry editing form

// TEMPORARY: Basic page structure to prevent navigation errors
// useParams = gets URL parameters (the [id] from the route)
export default function EditEntryPage() {
  const params = useParams();
  const entryId = params.id as string;
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Entry</h1>
      <p className="text-gray-600">Editing entry ID: {entryId}</p>
      <p className="text-sm text-gray-500 mt-2">Entry editing form will be displayed here.</p>
    </div>
  );
}

