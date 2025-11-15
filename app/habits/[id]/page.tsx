// edit habit page - update existing habit
// similar to new page but pre-fills with existing habit data
//
// WHAT WE'RE CREATING:
// - A page for editing existing habits
// - Pre-fills form with existing habit data (name, type, target, unit, color)
// - Same interface as new habit page but with update/archive actions
// - Handles habit not found (404 error)
//
// OWNERSHIP:
// - Zayn implements this completely
//
// COORDINATION NOTES:
// - Uses repo.ts habit functions (Zayn adds these)
// - No conflicts - Zayn owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This page allows editing existing habits
// - Pre-fills form with existing habit data
// - Can update all fields (name, type, target, unit, color)
// - Can delete/archive habit from this page
//
// DEVELOPMENT NOTES:
// - Fetch habit by ID from URL params
// - Pre-fill form with existing data
// - Update habit on save
// - Archive habit (soft delete) with confirmation
// - Handle habit not found (404)
//
// TODO: implement habit editing form
//
// FUNCTIONALITY:
// - Load habit by ID from database
// - Pre-fill form with existing data
// - Update habit on save
// - Archive habit with confirmation
// - Navigate back to habits list after save/archive
// - Show 404 if habit not found
//
// UI:
// - Same as new habit page but with pre-filled data
// - Archive/delete button (in addition to save)
//
// SYNTAX:
// "use client";
// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { getHabitById, updateHabit, archiveHabit } from "@/lib/db/repo";
//
// export default function EditHabitPage() {
//   const params = useParams();
//   const habitId = parseInt(params.id as string);
//   // implementation
// }

"use client";

import { useParams } from "next/navigation";

// TODO: implement habit editing form

// TEMPORARY: Basic page structure to prevent navigation errors
// useParams = gets URL parameters (the [id] from the route)
export default function EditHabitPage() {
  const params = useParams();
  const habitId = params.id as string;
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Edit Habit</h1>
      <p className="text-gray-600">Editing habit ID: {habitId}</p>
      <p className="text-sm text-gray-500 mt-2">Habit editing form will be displayed here.</p>
    </div>
  );
}

