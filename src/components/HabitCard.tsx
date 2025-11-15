// habit card component - displays habit with progress and actions
// shows habit info, streak, progress, and logging interface
//
// WHAT WE'RE CREATING:
// - A reusable component that displays one habit in a card format
// - Shows: habit name, target value, current progress, streak count, log button
// - Handles habit logging (both boolean and numeric habits)
// - Updates progress bar and streak display in real-time
//
// OWNERSHIP:
// - Zayn implements this completely
//
// COORDINATION NOTES:
// - Used by app/habits/page.tsx (Zayn creates)
// - Uses repo.ts habit functions (Zayn adds these)
// - No conflicts - Zayn owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This component displays a single habit with all its information
// - Shows progress bars, streak counters, and logging buttons
// - Used on the habits list page
// - Supports both boolean habits (done/not done) and numeric habits (target value)
//
// DEVELOPMENT NOTES:
// - Display habit name, target, current progress
// - Show streak badge (consecutive days)
// - Show progress bar (for numeric habits) or checkmark (for boolean)
// - Logging button/interface (different for bool vs numeric)
// - Recent activity list (last few logs)
// - Visual indication when goal is exceeded
//
// TODO: implement habit card component
//
// FUNCTIONALITY:
// - Display habit information (name, target, unit, color)
// - Show current streak
// - Show progress bar for numeric habits
// - Show checkmark for boolean habits
// - Logging interface (button for bool, input+button for numeric)
// - Recent activity display
// - Goal exceeded indicator (green text, emoji)
//
// UI:
// - Card design with habit color accent
// - Progress bar (gamified, like XP bar)
// - Streak badge
// - Logging controls
// - Recent activity list
// - Hover effects
//
// PROPS:
// - habit: Habit - habit data from database
// - logs: HabitLog[] - recent logs for this habit
// - streak: number - current streak
// - onLog: (value?: number) => void - callback when habit is logged
// - onEdit: () => void - callback to edit habit
// - onArchive: () => void - callback to archive habit
//
// SYNTAX:
// "use client";
//
// interface HabitCardProps {
//   habit: Habit;
//   logs: HabitLog[];
//   streak: number;
//   onLog: (value?: number) => void;
//   onEdit: () => void;
//   onArchive: () => void;
// }
//
// export default function HabitCard(props: HabitCardProps) {
//   // implementation
// }

"use client";

// TODO: implement habit card component

