// habits list page - displays all active habits
// shows habits with progress, streaks, and logging interface
//
// WHAT WE'RE CREATING:
// - A page that lists all active (non-archived) habits
// - Each habit shows: name, target, current progress, streak, logging interface
// - Users can log habits directly from this page
// - Supports both boolean habits (done/not done) and numeric habits (target value)
//
// OWNERSHIP:
// - Zayn implements this completely
//
// COORDINATION NOTES:
// - Uses repo.ts habit functions (Zayn adds these)
// - Uses HabitCard component (Zayn creates)
// - No conflicts - Zayn owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This page shows all active (non-archived) habits
// - Each habit displays: name, target, current progress, streak, logging interface
// - Users can log habits directly from this page
// - Supports both boolean habits (done/not done) and numeric habits (target value)
//
// DEVELOPMENT NOTES:
// - Fetch active habits from database
// - Display habits using HabitCard component
// - Handle habit logging (update database, recalculate streak)
// - Show loading state during operations
// - Empty state when no habits exist
// - Link to create new habit
//
// TODO: implement habits list page
//
// FUNCTIONALITY:
// - Load active habits from database
// - Display habits with HabitCard component
// - Handle habit logging (bool and numeric)
// - Recalculate streak after logging
// - Archive habit option
// - Link to edit habit
// - Empty state message
//
// UI:
// - List of habit cards
// - Each card shows progress, streak, logging interface
// - Create new habit button/link
// - Responsive layout
//
// SYNTAX:
// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getActiveHabits, logHabit, calculateStreak, getHabitLogs } from "@/lib/db/repo";
// import HabitCard from "@/components/HabitCard";
//
// export default function HabitsPage() {
//   // implementation
// }

"use client";

// TODO: implement habits list page

