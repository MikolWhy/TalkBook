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

import { useState, useEffect } from "react";
import { Habit } from "@/lib/db/schema";

interface HabitCardProps {
  habit: Habit;
  streak: number;
  todayLog?: { value: number };
  onLog: (habitId: number, value: number) => void;
  onEdit: (habitId: number) => void;
  onArchive?: (habitId: number) => void;
}

export default function HabitCard({ habit, streak, todayLog, onLog, onEdit, onArchive }: HabitCardProps) {
  const currentValue = todayLog?.value || 0;
  // For numeric habits, "done" means value > 0 (or >= target if target exists)
  // For boolean habits, "done" means value > 0
  const isCompleted = habit.type === "numeric" 
    ? (habit.target ? currentValue >= habit.target : currentValue > 0)
    : currentValue > 0;

  const showStreak = habit.frequency !== "one-time";
  
  const [quickValue, setQuickValue] = useState<string>(currentValue.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleLog = () => {
    if (habit.type === "boolean") {
      // Toggle: if completed today, unlog (value = 0), else log (value = 1)
      onLog(habit.id!, isCompleted ? 0 : 1);
    } else {
      // For numeric habits: if done, undo (set to 0), else mark as done (set to target or 1)
      if (isCompleted) {
        // Undo: set to 0
        onLog(habit.id!, 0);
      } else {
        // Mark as done: set to target value (or 1 if no target)
        const targetValue = habit.target || 1;
        onLog(habit.id!, targetValue);
      }
    }
  };

  const handleQuickIncrement = () => {
    const maxValue = habit.target || Infinity;
    const newValue = Math.min(maxValue, Math.max(0, currentValue + 1));
    onLog(habit.id!, newValue);
  };

  const handleQuickDecrement = () => {
    const newValue = Math.max(0, currentValue - 1);
    // If value becomes 0, it automatically becomes undone
    onLog(habit.id!, newValue);
  };

  const handleQuickValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuickValue(e.target.value);
  };

  const handleQuickValueSubmit = () => {
    const numValue = parseFloat(quickValue);
    const maxValue = habit.target || Infinity;
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxValue) {
      // If value is set to 0, it automatically becomes undone
      onLog(habit.id!, numValue);
      setIsEditing(false);
    } else {
      setQuickValue(currentValue.toString());
      setIsEditing(false);
    }
  };

  const handleQuickValueKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleQuickValueSubmit();
    } else if (e.key === 'Escape') {
      setQuickValue(currentValue.toString());
      setIsEditing(false);
    }
  };

  // Update quickValue when currentValue changes (but not when editing)
  useEffect(() => {
    if (!isEditing) {
      setQuickValue(currentValue.toString());
    }
  }, [currentValue, isEditing]);

  // Calculate progress for numeric habits
  const progress = habit.type === "numeric" && habit.target && todayLog
    ? Math.min((todayLog.value / habit.target) * 100, 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border-l-4 relative group flex flex-col h-full" style={{ borderLeftColor: habit.color }}>
      {/* Drag Handle - visible on hover, positioned at top center */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-gray-400 opacity-30 group-hover:opacity-70 transition-opacity pointer-events-none">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="4" cy="4" r="1.5"/>
          <circle cx="8" cy="4" r="1.5"/>
          <circle cx="12" cy="4" r="1.5"/>
          <circle cx="4" cy="8" r="1.5"/>
          <circle cx="8" cy="8" r="1.5"/>
          <circle cx="12" cy="8" r="1.5"/>
          <circle cx="4" cy="12" r="1.5"/>
          <circle cx="8" cy="12" r="1.5"/>
          <circle cx="12" cy="12" r="1.5"/>
        </svg>
      </div>
      
      <div className="flex items-start justify-between flex-1">
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
            {showStreak && (
              <span className="flex items-center gap-1">
                🔥 <span className="font-medium text-gray-700">{streak}</span> day streak
              </span>
            )}
            {habit.type === "numeric" && habit.target && (
              <span className="flex items-center gap-1">
                🎯 Count: <span className="font-medium text-gray-700">{habit.target}</span> {habit.unit}
              </span>
            )}
            <span className="text-xs text-gray-400 capitalize">
              {habit.frequency === "one-time" ? "one-time goal" : habit.frequency}
            </span>
          </div>

          {/* Progress Bar (for numeric habits) - always show space for consistency */}
          <div className="mb-3" style={{ height: '40px' }}>
            {habit.type === "numeric" && todayLog !== undefined ? (
              <>
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
              </>
            ) : habit.type === "numeric" ? (
              <div className="text-xs text-gray-400 pt-2">No progress today</div>
            ) : (
              <div style={{ height: '24px' }}></div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={handleLog}
            className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
              isCompleted
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
            title={isCompleted ? "Click to undo" : "Mark as in progress"}
          >
            {isCompleted ? "✓ Done" : "In progress"}
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

      {/* Trash Bin - Bottom Left */}
      {onArchive && (
        <div className="absolute bottom-2 left-2">
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to archive "${habit.name}"?`)) {
                onArchive(habit.id!);
              }
            }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
            title="Archive habit"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      )}

      {/* Quick Update Controls for Numeric Habits - Bottom Right */}
      {habit.type === "numeric" && (
        <div className="mt-auto flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={handleQuickDecrement}
            disabled={currentValue <= 0}
            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            title={currentValue <= 0 ? "Cannot go below 0" : "Decrease by 1"}
          >
            −
          </button>
          {isEditing ? (
            <input
              type="number"
              value={quickValue}
              onChange={handleQuickValueChange}
              onBlur={handleQuickValueSubmit}
              onKeyDown={handleQuickValueKeyDown}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 text-center"
              autoFocus
              min="0"
              max={habit.target || undefined}
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors min-w-[64px]"
            >
              {currentValue} {habit.unit}
            </button>
          )}
          <button
            onClick={handleQuickIncrement}
            disabled={habit.target !== undefined && currentValue >= habit.target}
            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            title={habit.target !== undefined && currentValue >= habit.target ? "Maximum reached" : "Increase by 1"}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}