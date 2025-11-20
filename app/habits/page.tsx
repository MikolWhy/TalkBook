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
  getHabitLogs
} from "@/lib/db/repo";
import { Habit } from "@/lib/db/schema";

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [todayLogs, setTodayLogs] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

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
            {habits.length} active habit{habits.length !== 1 ? 's' : ''}
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
        /* Habits List */
        <div className="space-y-4">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              streak={streaks[habit.id!] || 0}
              todayLog={todayLogs[habit.id!]}
              onLog={handleLog}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* Today's Summary */}
      {habits.length > 0 && (
        <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">Today's Progress</h3>
          <div className="flex items-center gap-4 text-sm text-blue-700">
            <span>
              ✓ {Object.keys(todayLogs).length} / {habits.length} completed
            </span>
            <span>
              🔥 Total streak: {Object.values(streaks).reduce((sum, s) => sum + s, 0)} days
            </span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
