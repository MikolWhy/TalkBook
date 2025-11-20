// habits/page.tsx
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


// TODO: implement habits list page

// TEMPORARY: Basic page structure to prevent navigation errors
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import HabitCard from "@/components/HabitCard";
import { 
  getActiveHabits, 
  logHabit, 
  calculateStreak,
  calculateGlobalStreak,
  getHabitLogs,
  updateHabitOrder,
  archiveHabit
} from "@/lib/db/repo";
import { Habit } from "@/lib/db/schema";

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [globalStreak, setGlobalStreak] = useState<number>(0);
  const [todayLogs, setTodayLogs] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    setLoading(true);
    try {
      const habitsData = await getActiveHabits(1); // TODO: get profileId from context when Aadil implements profiles
      setHabits(habitsData);

      // Load streaks and today's logs for each habit
      const streaksData: Record<number, number> = {};
      const logsData: Record<number, any> = {};

      for (const habit of habitsData) {
        if (habit.id) {
          const streak = await calculateStreak(habit.id);
          streaksData[habit.id] = streak;

          const logs = await getHabitLogs(habit.id, today, today);
          if (logs.length > 0) {
            logsData[habit.id] = logs[0];
          }
        }
      }

      setStreaks(streaksData);
      setTodayLogs(logsData);
      
      // Calculate global streak (days where all habits are completed)
      const global = await calculateGlobalStreak(1); // TODO: get profileId from context
      setGlobalStreak(global);
    } catch (error) {
      console.error("Failed to load habits:", error);
      alert("Failed to load habits. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (habitId: number, value: number) => {
    try {
      if (value === 0) {
        // User is un-logging - we could delete the log or set value to 0
        // For now, we'll just set value to 0 (which logHabit will update)
        await logHabit(habitId, today, 0);
      } else {
        await logHabit(habitId, today, value);
      }
      
      // Reload habits to update streaks and logs
      await loadHabits();
    } catch (error) {
      console.error("Failed to log habit:", error);
      alert("Failed to log habit. Please try again.");
    }
  };

  const handleEdit = (habitId: number) => {
    router.push(`/habits/${habitId}`);
  };

  const handleArchive = async (habitId: number) => {
    try {
      await archiveHabit(habitId);
      await loadHabits();
    } catch (error) {
      console.error("Failed to archive habit:", error);
      alert("Failed to archive habit. Please try again.");
    }
  };

  const handleDragStart = (e: React.DragEvent, habitId: number) => {
    const index = habits.findIndex(h => h.id === habitId);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropHabitId: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;
    
    const draggedHabit = habits[draggedIndex];
    const dropIndex = habits.findIndex(h => h.id === dropHabitId);
    
    if (draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newHabits = [...habits];
    newHabits.splice(draggedIndex, 1);
    newHabits.splice(dropIndex, 0, draggedHabit);
    
    setHabits(newHabits);
    setDraggedIndex(null);

    // Update order in database
    const habitIds = newHabits.map(h => h.id!).filter(id => id !== undefined);
    await updateHabitOrder(habitIds);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Get unique colors from habits
  const availableColors = Array.from(new Set(habits.map(h => h.color)));

  // Filter habits by color
  const filteredHabits = selectedColor 
    ? habits.filter(h => h.color === selectedColor)
    : habits;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading habits...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <p className="text-sm text-gray-600 mt-1">
            {filteredHabits.length} active habit{filteredHabits.length !== 1 ? 's' : ''}
            {selectedColor && ` (filtered by color)`}
          </p>
        </div>
        <Link
          href="/habits/new"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
        >
          <span className="text-xl">+</span>
          Add Habit
        </Link>
      </div>

      {/* Color Filter */}
      {habits.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter by color:</span>
          <button
            onClick={() => setSelectedColor(null)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              selectedColor === null
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {availableColors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(selectedColor === color ? null : color)}
              className={`w-8 h-8 rounded-full transition-all ${
                selectedColor === color
                  ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          {selectedColor && (
            <button
              onClick={() => setSelectedColor(null)}
              className="ml-auto text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {habits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No habits yet</h2>
          <p className="text-gray-600 mb-6">Start building better habits today!</p>
          <Link
            href="/habits/new"
            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium"
          >
            Create Your First Habit
          </Link>
        </div>
      ) : (
        /* Habits List - 2 columns with drag and drop */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {filteredHabits.map((habit) => {
            const originalIndex = habits.findIndex(h => h.id === habit.id);
            const isDragging = draggedIndex === originalIndex;
            return (
              <div
                key={habit.id}
                draggable={!selectedColor} // Only allow dragging when not filtered
                onDragStart={(e) => handleDragStart(e, habit.id!)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, habit.id!)}
                onDragEnd={handleDragEnd}
                className={`group transition-opacity ${
                  isDragging ? 'opacity-50' : 'opacity-100'
                } ${!selectedColor ? 'cursor-move' : ''}`}
              >
                <HabitCard
                  habit={habit}
                  streak={streaks[habit.id!] || 0}
                  todayLog={todayLogs[habit.id!]}
                  onLog={handleLog}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Today's Summary */}
      {habits.length > 0 && (() => {
        // Count actually completed habits (not just ones with logs)
        const completedCount = habits.filter(habit => {
          const log = todayLogs[habit.id!];
          if (!log) return false;
          
          if (habit.type === "boolean") {
            return log.value > 0;
          } else {
            // Numeric: completed if value >= target (or > 0 if no target)
            return habit.target ? log.value >= habit.target : log.value > 0;
          }
        }).length;

        return (
          <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Today's Progress</h3>
            <div className="flex items-center gap-4 text-sm text-blue-700">
              <span>
                ✓ {completedCount} / {habits.length} completed
              </span>
              <span>
                🔥 Global streak: {globalStreak} day{globalStreak !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
}
