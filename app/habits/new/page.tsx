// new habit page - create habit form
// includes name, type (bool/number), target, unit, color selection
//
// WHAT WE'RE CREATING:
// - A form page for creating new habits
// - Inputs: name, type (boolean or numeric), target (for numeric), unit, color
// - Validates form before saving
// - Saves habit to database and navigates to habits list
//
// OWNERSHIP:
// - Zayn implements this completely
//
// COORDINATION NOTES:
// - Uses repo.ts habit functions (Zayn adds these)
// - No conflicts - Zayn owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This page allows creating new habits
// - Habits can be boolean (done/not done) or numeric (target value)
// - Users set name, target (for numeric), unit (e.g., "reps", "pages"), and color
//
// DEVELOPMENT NOTES:
// - Form with name input, type selection (radio buttons), target input (for numeric)
// - Unit input (optional, for numeric habits)
// - Color picker or color selection buttons
// - Validate form before saving
// - Save to database and navigate to habits list
//
// TODO: implement habit creation form
//
// FUNCTIONALITY:
// - Name input
// - Type selection (boolean or number)
// - Target input (for numeric habits, min 1)
// - Unit input (optional, for numeric habits)
// - Color selection
// - Save habit to database
// - Navigate to habits list after save
//
// UI:
// - Form layout
// - Radio buttons for type selection
// - Conditional fields (target/unit only for numeric)
// - Color picker/buttons
// - Save button
//
// SYNTAX:
// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createHabit } from "@/lib/db/repo";
//
// export default function NewHabitPage() {
//   // implementation
// }

"use client";

// TODO: implement habit creation form

