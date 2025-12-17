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

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HabitCard from "@/components/features/HabitCard";
import XPNotification from "@/components/gamification/XPNotification";
import { awardHabitXP, calculateGlobalHabitStreak, awardAllHabitsCompletedBonus } from "@/lib/gamification/xp";
import { updateHabitPR } from "@/lib/gamification/pr";
import {
  getActiveHabits,
  logHabit,
  calculateStreak,
  getHabitLogs,
  updateHabitOrder,
  archiveHabit,
  toggleHabitLock
} from "@/lib/db/repo";
import { Habit } from "@/lib/db/schema";
import { Target, PartyPopper, CheckCircle2 } from "lucide-react";

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [todayLogs, setTodayLogs] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedHabitId, setDraggedHabitId] = useState<number | null>(null);
  const [shouldResetPosition, setShouldResetPosition] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // XP Notification State
  const [showXPNotification, setShowXPNotification] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const [oldLevel, setOldLevel] = useState<number | undefined>(undefined);
  const [newLevel, setNewLevel] = useState<number | undefined>(undefined);

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
      // Find the habit being logged
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      // Check if habit was/is completed based on type and target
      const previousValue = todayLogs[habitId]?.value || 0;
      const wasCompleted = habit.type === 'numeric'
        ? (habit.target ? previousValue >= habit.target : previousValue > 0)
        : previousValue > 0;
      const isNowCompleted = habit.type === 'numeric'
        ? (habit.target ? value >= habit.target : value > 0)
        : value > 0;

      // Log the habit
      if (value === 0) {
        await logHabit(habitId, today, 0);
      } else {
        await logHabit(habitId, today, value);
      }

      // Award XP only if habit is being completed (not un-logged) AND XP hasn't been awarded for this habit today
      if (isNowCompleted && !wasCompleted) {
        // Update PR for numeric habits when completed
        if (habit.type === 'numeric' && value > 0) {
          const prResult = updateHabitPR(habit.name, value);
          if (prResult.isNewPR) {
            console.log(`🎉 New PR for ${habit.name}: ${value} ${habit.unit || ''}`);
          }
        }

        // Check if XP was already awarded for this habit today
        const xpAwardedKey = `talkbook-habit-xp-${habitId}-${today}`;
        const xpAlreadyAwarded = localStorage.getItem(xpAwardedKey) === 'true';

        if (!xpAlreadyAwarded) {
          // Count how many habits are completed today (before reload, so add 1 for this one)
          const completedBeforeThis = Object.values(todayLogs).filter((log: any) => log?.value > 0).length;
          const completedToday = completedBeforeThis + 1;

          // Calculate global habit streak
          const habitStreak = await calculateGlobalHabitStreak();

          // Award regular habit XP
          const xpResult = awardHabitXP(
            habit.type,
            habit.type === 'numeric' ? value : 1,
            habitStreak,
            completedToday
          );

          console.log("🎉 Habit XP Awarded:", xpResult);

          // Mark XP as awarded for this habit today
          localStorage.setItem(xpAwardedKey, 'true');

          let totalXP = xpResult.xp;
          let leveledUp = xpResult.leveledUp;
          let oldLevel = xpResult.oldLevel;
          let newLevel = xpResult.newLevel;

          // Show XP notification for regular habit XP first
          setXpEarned(totalXP);
          setLeveledUp(leveledUp);
          setOldLevel(oldLevel);
          setNewLevel(newLevel);
          setShowXPNotification(true);

          // Dispatch event for XP bar to update
          window.dispatchEvent(new Event("xp-updated"));
        }
      }

      // Reload habits to update streaks and logs
      await loadHabits();

      // After reloading, check if all habits are completed and award bonus XP (once per day)
      if (isNowCompleted && !wasCompleted) {
        // Get fresh data after reload
        const allHabits = await getActiveHabits(1);
        const updatedLogs: Record<number, any> = {};
        for (const h of allHabits) {
          if (h.id) {
            const logs = await getHabitLogs(h.id, today, today);
            if (logs.length > 0) {
              updatedLogs[h.id] = logs[0];
            }
          }
        }

        // Count how many habits are completed today
        const completedCount = allHabits.filter(habit => {
          const log = updatedLogs[habit.id!];
          if (!log) return false;

          if (habit.type === "boolean") {
            return log.value > 0;
          } else {
            return habit.target ? log.value >= habit.target : log.value > 0;
          }
        }).length;

        // Check if all habits are completed and award bonus (once per day)
        const allCompleted = completedCount === allHabits.length && allHabits.length > 0;

        if (allCompleted) {
          const bonusResult = awardAllHabitsCompletedBonus();
          if (bonusResult.awarded) {
            console.log("🎉 All Habits Completed Bonus:", bonusResult.xp, "XP");

            // Show bonus XP notification
            setXpEarned(bonusResult.xp);
            setLeveledUp(bonusResult.leveledUp);
            setOldLevel(bonusResult.oldLevel);
            setNewLevel(bonusResult.newLevel);
            setShowXPNotification(true);

            // Dispatch event for XP bar to update
            window.dispatchEvent(new Event("xp-updated"));
          }
        }
      }
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

  const handleToggleLock = async (habitId: number) => {
    try {
      await toggleHabitLock(habitId);
      await loadHabits();
    } catch (error) {
      console.error("Failed to toggle habit lock:", error);
      alert("Failed to toggle lock. Please try again.");
    }
  };

  const handleDeleteAll = async () => {
    const unlockedHabits = habits.filter(h => !h.locked);

    if (unlockedHabits.length === 0) {
      alert("All habits are locked. Unlock habits to delete them.");
      return;
    }

    const lockedCount = habits.length - unlockedHabits.length;
    const message = lockedCount > 0
      ? `This will delete ${unlockedHabits.length} unlocked habit(s). ${lockedCount} locked habit(s) will be kept. Continue?`
      : `This will delete all ${unlockedHabits.length} habit(s). Continue?`;

    if (!confirm(message)) return;

    try {
      for (const habit of unlockedHabits) {
        if (habit.id) {
          await archiveHabit(habit.id);
        }
      }
      await loadHabits();
    } catch (error) {
      console.error("Failed to delete habits:", error);
      alert("Failed to delete habits. Please try again.");
    }
  };

  const handleDragStart = (habitId: number) => {
    const index = habits.findIndex(h => h.id === habitId);
    setDraggedIndex(index);
    setDraggedHabitId(habitId);
  };

  const handleDragEnd = async () => {
    if (draggedHabitId === null) return;

    // Mark this habit as needing position reset
    setShouldResetPosition(prev => ({ ...prev, [draggedHabitId]: true }));

    // Update order in database
    const habitIds = habits.map(h => h.id!).filter(id => id !== undefined);
    await updateHabitOrder(habitIds);

    setDraggedIndex(null);
    setDraggedHabitId(null);

    // Clear reset flag after animation
    setTimeout(() => {
      setShouldResetPosition(prev => {
        const newState = { ...prev };
        delete newState[draggedHabitId];
        return newState;
      });
    }, 300);
  };

  // Throttle state for drag handler
  const dragThrottleRef = useRef<number>(0);

  const handleDrag = (event: any, info: any) => {
    if (draggedIndex === null || draggedHabitId === null) return;

    const draggedHabit = habits[draggedIndex];
    if (!draggedHabit) return;

    // Throttle position updates to prevent chaos
    const now = Date.now();
    if (now - dragThrottleRef.current < 100) return; // Only update every 100ms
    dragThrottleRef.current = now;

    // Get pointer position - try multiple methods for reliability
    let clientX: number;
    let clientY: number;

    // Try to get from the original event
    if (event && 'clientX' in event) {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    } else if (event && 'touches' in event && (event as TouchEvent).touches.length > 0) {
      clientX = (event as TouchEvent).touches[0].clientX;
      clientY = (event as TouchEvent).touches[0].clientY;
    } else {
      // Fallback: use info.point (relative to dragged element) + element position
      const draggedElement = document.querySelector(`[data-habit-id="${draggedHabitId}"]`) as HTMLElement;
      if (!draggedElement) return;
      const draggedRect = draggedElement.getBoundingClientRect();
      clientX = draggedRect.left + info.point.x;
      clientY = draggedRect.top + info.point.y;
    }

    // Get the container
    const container = containerRef.current || document.querySelector('.habits-grid') as HTMLElement;
    if (!container) return;

    // Check if pointer is within container bounds
    const containerRect = container.getBoundingClientRect();
    if (
      clientX < containerRect.left ||
      clientX > containerRect.right ||
      clientY < containerRect.top ||
      clientY > containerRect.bottom
    ) {
      return; // Don't swap if outside container
    }

    // Temporarily hide the dragged element to check what's underneath
    const draggedElement = document.querySelector(`[data-habit-id="${draggedHabitId}"]`) as HTMLElement;
    const originalPointerEvents = draggedElement?.style.pointerEvents;
    if (draggedElement) {
      draggedElement.style.pointerEvents = 'none';
    }

    // Find which card we're hovering over using elementFromPoint
    const elementBelow = document.elementFromPoint(clientX, clientY);

    // Restore pointer events
    if (draggedElement) {
      draggedElement.style.pointerEvents = originalPointerEvents || '';
    }

    if (!elementBelow) return;

    // Find the card container (motion.div) that contains this element
    const cardElement = elementBelow.closest('[data-habit-id]') as HTMLElement;
    if (!cardElement) return;

    const hoveredHabitId = parseInt(cardElement.getAttribute('data-habit-id') || '0');
    if (hoveredHabitId === draggedHabitId) return;

    // Find the index of the hovered habit
    const hoveredIndex = habits.findIndex(h => h.id === hoveredHabitId);
    if (hoveredIndex === -1 || hoveredIndex === draggedIndex) return;

    // Only swap if we're actually over a significant portion of the card
    const cardRect = cardElement.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(clientX - cardCenterX, 2) + Math.pow(clientY - cardCenterY, 2)
    );
    const maxDistance = Math.min(cardRect.width, cardRect.height) * 0.4; // 40% of card size - more strict

    if (distanceFromCenter > maxDistance) return; // Too far from center, don't swap

    // Update order
    const newHabits = [...habits];
    const [removed] = newHabits.splice(draggedIndex, 1);
    newHabits.splice(hoveredIndex, 0, removed);
    setHabits(newHabits);
    setDraggedIndex(hoveredIndex);
  };

  // Get unique colors from habits
  const availableColors = Array.from(new Set(habits.map(h => h.color)));

  // Filter and sort habits: in-progress at top, done at bottom
  let filteredHabits = selectedColor
    ? habits.filter(h => h.color === selectedColor)
    : habits;

  // Sort: in-progress habits first, done habits last
  filteredHabits = [...filteredHabits].sort((a, b) => {
    const aLog = todayLogs[a.id!];
    const bLog = todayLogs[b.id!];

    // Check if habits are completed
    const aCompleted = a.type === 'numeric'
      ? (a.target ? (aLog?.value || 0) >= a.target : (aLog?.value || 0) > 0)
      : (aLog?.value || 0) > 0;
    const bCompleted = b.type === 'numeric'
      ? (b.target ? (bLog?.value || 0) >= b.target : (bLog?.value || 0) > 0)
      : (bLog?.value || 0) > 0;

    // In-progress (not completed) comes first
    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1;
    }

    // If both have same completion status, maintain original order
    return 0;
  });

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
        <div className="flex items-center gap-3">
          {habits.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
              Delete All
            </button>
          )}
          <Link
            href="/habits/new"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
          >
            <span className="text-xl">+</span>
            Add Habit
          </Link>
        </div>
      </div>

      {/* Color Filter */}
      {habits.length > 0 && (
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Filter by color:</span>
          <button
            onClick={() => setSelectedColor(null)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${selectedColor === null
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
              className={`w-8 h-8 rounded-full transition-all ${selectedColor === color
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
        <div className="text-center py-12 rounded-lg shadow" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <div className="flex justify-center mb-4">
            <Target className="w-16 h-16 text-gray-400" />
          </div>
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
        <motion.div
          ref={containerRef}
          className="habits-grid grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredHabits.map((habit, index) => {
              const originalIndex = habits.findIndex(h => h.id === habit.id);
              const isDragging = draggedHabitId === habit.id;

              return (
                <motion.div
                  key={habit.id}
                  data-habit-id={habit.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: isDragging ? 0.6 : 1,
                    scale: 1,
                    zIndex: isDragging ? 50 : 1,
                    x: shouldResetPosition[habit.id!] ? 0 : undefined,
                    y: shouldResetPosition[habit.id!] ? 0 : undefined
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    layout: { duration: 0.3, ease: "easeOut" },
                    opacity: { duration: 0.1 },
                    scale: { duration: 0.1 },
                    x: { duration: 0.3, ease: "easeOut" },
                    y: { duration: 0.3, ease: "easeOut" }
                  }}
                  drag={!selectedColor}
                  dragConstraints={false}
                  dragElastic={0}
                  dragMomentum={false}
                  dragPropagation={false}
                  onDragStart={() => {
                    // Clear reset flag when starting new drag
                    setShouldResetPosition(prev => {
                      const newState = { ...prev };
                      delete newState[habit.id!];
                      return newState;
                    });
                    handleDragStart(habit.id!);
                  }}
                  onDrag={handleDrag}
                  onDragEnd={async (event, info) => {
                    await handleDragEnd();
                  }}
                  whileDrag={{
                    scale: 1.03,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    zIndex: 100,
                    cursor: "grabbing"
                  }}
                  className={`group ${!selectedColor ? 'cursor-grab' : ''}`}
                >
                  <HabitCard
                    habit={habit}
                    streak={streaks[habit.id!] || 0}
                    todayLog={todayLogs[habit.id!]}
                    onLog={handleLog}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onToggleLock={handleToggleLock}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
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
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                {completedCount} / {habits.length} completed
              </span>
              {completedCount === habits.length && habits.length > 0 && (
                <span className="text-green-700 font-semibold flex items-center gap-1">
                  <PartyPopper className="w-4 h-4" />
                  All habits completed! (+50 bonus XP)
                </span>
              )}
            </div>
          </div>
        );
      })()}

      {/* XP Notification */}
      <XPNotification
        xp={xpEarned}
        show={showXPNotification}
        onComplete={() => setShowXPNotification(false)}
        leveledUp={leveledUp}
        oldLevel={oldLevel}
        newLevel={newLevel}
      />
    </DashboardLayout>
  );
}
