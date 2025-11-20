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

import { Habit } from "@/lib/db/schema";

interface HabitCardProps {
  habit: Habit;
  streak: number;
  todayLog?: { value: number };
  onLog: (habitId: number, value: number) => void;
  onEdit: (habitId: number) => void;
}

export default function HabitCard({ habit, streak, todayLog, onLog, onEdit }: HabitCardProps) {
  const isCompleted = todayLog !== undefined;

  const handleLog = () => {
    if (habit.type === "boolean") {
      // Toggle: if completed today, unlog (value = 0), else log (value = 1)
      onLog(habit.id!, isCompleted ? 0 : 1);
    } else {
      // For numeric habits, prompt for value
      const value = prompt(`Enter value for ${habit.name}:`, habit.target?.toString() || "1");
      if (value && !isNaN(parseFloat(value))) {
        onLog(habit.id!, parseFloat(value));
      }
    }
  };

  // Calculate progress for numeric habits
  const progress = habit.type === "numeric" && habit.target && todayLog
    ? Math.min((todayLog.value / habit.target) * 100, 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: habit.color }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: habit.color }}
            />
            <h3 className="font-semibold text-gray-900 text-lg">{habit.name}</h3>
          </div>
          
          {/* Description */}
          {habit.description && (
            <p className="text-sm text-gray-600 mb-3">{habit.description}</p>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              🔥 <span className="font-medium text-gray-700">{streak}</span> day streak
            </span>
            {habit.type === "numeric" && habit.target && (
              <span className="flex items-center gap-1">
                🎯 Target: <span className="font-medium text-gray-700">{habit.target}</span> {habit.unit}
              </span>
            )}
            <span className="text-xs text-gray-400 capitalize">{habit.frequency}</span>
          </div>

          {/* Progress Bar (for numeric habits) */}
          {habit.type === "numeric" && todayLog && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Today: {todayLog.value} {habit.unit}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: progress >= 100 ? "#10B981" : habit.color,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={handleLog}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              isCompleted
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isCompleted ? "✓ Done" : "Log"}
          </button>
          <button
            onClick={() => onEdit(habit.id!)}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Edit habit"
          >
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
}