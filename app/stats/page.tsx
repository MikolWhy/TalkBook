"use client";

/**
 * Analytics Dashboard
 * 
 * Visualizes user data including mood trends, journaling gaps, and habit data.
 * 
 * Implementation:
 * - Aggregates historical data from `entriesCache` and `habitLogs`.
 * - Leverages a lazy-loaded `ChartsSection` for better page performance.
 * - Displays RPG-style progression stats via `getUserStats`.
 * 
 * @module app/stats/page.tsx
 */

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getEntries } from "@/lib/cache/entriesCache";
import { getJournals, type Journal } from "@/lib/journals/manager";
import { getActiveHabits, getHabitLogs } from "@/lib/db/repo";
import { getUserStats } from "@/lib/gamification/xp";
import { BarChart as BarChartIcon, Flame, Zap, PenTool, TrendingUp, BookOpen } from "lucide-react";

// Dynamically import heavy components to reduce initial bundle size
const ChartsSection = dynamic(() => import("@/components/features/stats/ChartsSection"), { ssr: false });
const InsightsPanel = dynamic(() => import("@/components/features/stats/InsightsPanel"), { ssr: false });
const WordCloud = dynamic(() => import("@/components/features/stats/WordCloud"), { ssr: false });

// Mood mapping
const moodMap: Record<string, string> = {
  "very-happy": "😄",
  "happy": "😊",
  "neutral": "😐",
  "sad": "😢",
  "very-sad": "😭",
  "excited": "🤩",
  "calm": "😌",
  "anxious": "😰",
  "angry": "😠",
  "grateful": "🙏",
};

// Chart colors
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const MOOD_COLORS: Record<string, string> = {
  "very-happy": "#10B981",
  "happy": "#3B82F6",
  "excited": "#F59E0B",
  "grateful": "#8B5CF6",
  "calm": "#14B8A6",
  "neutral": "#6B7280",
  "anxious": "#F97316",
  "sad": "#EF4444",
  "angry": "#DC2626",
  "very-sad": "#991B1B",
};

export default function StatsPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [habitLogs, setHabitLogs] = useState<any[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournalId, setSelectedJournalId] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<number>(30); // days - default to 30 for better visibility
  const [xpStats, setXpStats] = useState<any>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Reload data when entries might have changed (e.g., after editing)
  useEffect(() => {
    const handleDataChange = () => {
      loadData();
    };
    
    // Listen for storage events (cross-tab updates)
    window.addEventListener('storage', handleDataChange);
    // Listen for custom event (same-tab updates)
    window.addEventListener('entries-updated', handleDataChange);
    // Reload when page becomes visible (user navigates back from editing)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('entries-updated', handleDataChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadData = async () => {
    const allEntries = getEntries().filter((e: any) => !e.draft);
    setEntries(allEntries);
    setJournals(getJournals());
    setXpStats(getUserStats());

    // Load habits
    try {
      const habitsData = await getActiveHabits(1);
      setHabits(habitsData);

      // Load all habit logs for the time range
      const allLogs: any[] = [];
      for (const habit of habitsData) {
        if (habit.id) {
          const logs = await getHabitLogs(habit.id);
          allLogs.push(...logs.map(log => ({ ...log, habitId: habit.id, habitName: habit.name, habitColor: habit.color })));
        }
      }
      setHabitLogs(allLogs);
    } catch (error) {
      console.error("Failed to load habits:", error);
    }
  };

  // Filter entries by journal and time range
  const filteredEntries = useMemo(() => {
    let filtered = entries;

    // Filter by journal
    if (selectedJournalId !== "all") {
      filtered = filtered.filter((e: any) => (e.journalId || "journal-1") === selectedJournalId);
    }

    // Filter by time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    filtered = filtered.filter((e: any) => new Date(e.createdAt) >= cutoffDate);

    return filtered;
  }, [entries, selectedJournalId, timeRange]);

  // Filter habit logs by time range
  const filteredHabitLogs = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    const cutoffString = cutoffDate.toISOString().split('T')[0];

    return habitLogs.filter((log: any) => log.date >= cutoffString);
  }, [habitLogs, timeRange]);

  // Calculate journal statistics
  const journalStats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalEntries: 0,
        totalWords: 0,
        currentStreak: 0,
      };
    }

    const totalEntries = filteredEntries.length;
    const wordCounts = filteredEntries.map((e: any) => {
      const plainText = e.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return plainText.split(/\s+/).filter((w: string) => w.length > 0).length;
    });
    const totalWords = wordCounts.reduce((sum: number, count: number) => sum + count, 0);

    // Calculate current streak (consecutive days with at least 1 entry)
    // Get unique dates that have at least one entry
    const datesWithEntries = new Set<string>();
    filteredEntries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      const dateString = entryDate.toISOString().split('T')[0];
      datesWithEntries.add(dateString);
    });

    let currentStreak = 0;
    if (datesWithEntries.size > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let currentDate = new Date(today);

      // Start from today and go backwards day by day
      // Count consecutive days that have at least one entry
      while (true) {
        const dateString = currentDate.toISOString().split('T')[0];

        if (datesWithEntries.has(dateString)) {
          currentStreak++;
          // Move to previous day
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          // Gap in streak, stop counting
          break;
        }

        // Safety limit to prevent infinite loops
        if (currentStreak > 10000) break;
      }
    }

    return {
      totalEntries,
      totalWords,
      currentStreak,
    };
  }, [filteredEntries]);

  // Calculate habit statistics
  const habitStats = useMemo(() => {
    // Check which one-time habits have been completed (have any log with value > 0)
    const completedOneTimeHabitIds = new Set<number>();
    habitLogs.forEach((log: any) => {
      if (log.value > 0 && log.habitId) {
        const habit = habits.find(h => h.id === log.habitId);
        if (habit && habit.frequency === 'one-time') {
          completedOneTimeHabitIds.add(log.habitId);
        }
      }
    });

    // Count active habits (excluding completed one-time habits)
    const activeHabits = habits.filter(habit => {
      if (habit.frequency === 'one-time' && habit.id && completedOneTimeHabitIds.has(habit.id)) {
        return false; // Exclude completed one-time habits
      }
      return true;
    });

    const totalHabits = activeHabits.length;
    const totalCompletions = filteredHabitLogs.filter((log: any) => log.value > 0).length;

    // Calculate habit completion rate per day
    const dateGroups: Record<string, number> = {};
    filteredHabitLogs.forEach((log: any) => {
      if (log.value > 0) {
        dateGroups[log.date] = (dateGroups[log.date] || 0) + 1;
      }
    });

    const daysWithCompletions = Object.keys(dateGroups).length;
    const avgCompletionsPerDay = daysWithCompletions > 0 ? totalCompletions / daysWithCompletions : 0;

    // Calculate habit streak (at least 1 habit completed per day)
    let habitStreak = 0;
    if (Object.keys(dateGroups).length > 0) {
      // Create a Set of dates with completions for quick lookup
      const completionDatesSet = new Set(
        Object.keys(dateGroups).map(date => {
          const d = new Date(date + 'T00:00:00');
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find the most recent completion date
      const completionDates = Array.from(completionDatesSet)
        .map(time => new Date(time))
        .sort((a, b) => b.getTime() - a.getTime());

      const mostRecentDate = completionDates[0];
      if (mostRecentDate) {
        const daysSinceLastCompletion = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));

        // Streak continues if last completion was today or yesterday
        if (daysSinceLastCompletion <= 1) {
          // Start checking from the most recent completion date
          let checkDate = new Date(mostRecentDate);

          // Count consecutive days backwards
          while (completionDatesSet.has(checkDate.getTime())) {
            habitStreak++;
            // Move to previous day
            checkDate.setDate(checkDate.getDate() - 1);
            checkDate.setHours(0, 0, 0, 0);
          }
        }
      }
    }

    return {
      totalHabits,
      totalCompletions,
      avgCompletionsPerDay: Math.round(avgCompletionsPerDay * 10) / 10,
      habitStreak,
    };
  }, [habits, filteredHabitLogs]);

  // Combined activity data (entries + habits over time)
  const activityOverTime = useMemo(() => {
    const grouped: Record<string, { entries: number; habits: number; dateObj: Date }> = {};

    // Count entries per day
    filteredEntries.forEach((e: any) => {
      const entryDate = new Date(e.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      const dateKey = entryDate.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { entries: 0, habits: 0, dateObj: entryDate };
      }
      grouped[dateKey].entries++;
    });

    // Count habit completions per day
    filteredHabitLogs.forEach((log: any) => {
      if (log.value > 0) {
        const logDate = new Date(log.date + 'T00:00:00');
        logDate.setHours(0, 0, 0, 0);
        const dateKey = logDate.toISOString().split('T')[0];
        if (!grouped[dateKey]) {
          grouped[dateKey] = { entries: 0, habits: 0, dateObj: logDate };
        }
        grouped[dateKey].habits++;
      }
    });

    // Generate all dates in the range for better visualization
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    cutoffDate.setHours(0, 0, 0, 0);

    const result: Array<{ date: string; entries: number; habits: number }> = [];
    const currentDate = new Date(cutoffDate);

    // For shorter ranges (7-30 days), show daily data
    // For longer ranges (90+ days), show weekly/monthly aggregates
    const shouldAggregate = timeRange > 30;
    const aggregationDays = timeRange > 90 ? 7 : 1; // Weekly for 90+ days, daily otherwise

    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const data = grouped[dateKey] || { entries: 0, habits: 0 };

      // Format date for display
      let dateLabel: string;
      if (timeRange <= 7) {
        dateLabel = currentDate.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      } else if (timeRange <= 30) {
        dateLabel = currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      } else {
        dateLabel = currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }

      result.push({
        date: dateLabel,
        entries: data.entries,
        habits: data.habits,
      });

      currentDate.setDate(currentDate.getDate() + aggregationDays);
    }

    return result;
  }, [filteredEntries, filteredHabitLogs, timeRange]);

  // Mood pattern (pie chart showing counts of each mood emoji)
  // Includes default emoji (😐) for entries with no mood selected
  const moodPatternData = useMemo(() => {
    const counts: Record<string, number> = {};

    // Count all moods including default (null mood = 😐)
    filteredEntries.forEach((e: any) => {
      const moodKey = e.mood || "neutral"; // Default to "neutral" for null mood
      counts[moodKey] = (counts[moodKey] || 0) + 1;
    });

    // Convert to array format for pie chart
    // Include all possible moods even if count is 0, so chart structure is consistent
    const allMoods = [
      "very-happy", "happy", "excited", "grateful", "calm",
      "neutral", "anxious", "sad", "angry", "very-sad"
    ];

    return allMoods
      .map((mood) => ({
        mood: mood,
        moodEmoji: moodMap[mood] || "😐",
        count: counts[mood] || 0,
        fullMood: mood,
      }))
      .filter((item) => item.count > 0) // Only show moods that have entries
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [filteredEntries]);

  // Writing time distribution
  const timeDistribution = useMemo(() => {
    const hours: Record<number, number> = {};
    filteredEntries.forEach((e: any) => {
      const hour = new Date(e.createdAt).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });

    const periods = {
      "Morning": 0,
      "Afternoon": 0,
      "Evening": 0,
      "Night": 0,
    };

    Object.entries(hours).forEach(([hour, count]) => {
      const h = parseInt(hour);
      if (h >= 6 && h < 12) periods["Morning"] += count;
      else if (h >= 12 && h < 18) periods["Afternoon"] += count;
      else if (h >= 18 && h < 22) periods["Evening"] += count;
      else periods["Night"] += count;
    });

    // Always return all periods, even if count is 0
    return [
      { period: "Morning", count: periods["Morning"] },
      { period: "Afternoon", count: periods["Afternoon"] },
      { period: "Evening", count: periods["Evening"] },
      { period: "Night", count: periods["Night"] },
    ];
  }, [filteredEntries]);

  // Mood timeline (mood trends over time)
  // Shows ALL individual mood entries as separate points (not aggregated by day)
  // Multiple entries on same day = multiple points on chart
  const moodTimelineData = useMemo(() => {
    // Map moods to numerical scores for visualization
    const moodScores: Record<string, number> = {
      "very-sad": 0,
      "sad": 1,
      "angry": 2,
      "anxious": 3,
      "neutral": 4,
      "calm": 5,
      "happy": 6,
      "grateful": 6, // Map legacy grateful to happy
      "very-happy": 7,
      "excited": 8,
    };

    const moodLabels: Record<string, string> = {
      "very-sad": "Very Sad 😭",
      "sad": "Sad 😢",
      "angry": "Angry 😠",
      "anxious": "Anxious 😰",
      "neutral": "Neutral 😐",
      "calm": "Calm 😌",
      "happy": "Happy 😊",
      "grateful": "Grateful 🙏",
      "very-happy": "Very Happy 😄",
      "excited": "Excited 🤩",
    };

    // Get cutoff date for time range
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);

    // Process ALL entries with moods (not grouped by day)
    const result: Array<{ 
      entryIndex: number;
      date: string; 
      timestamp: number; 
      moodScore: number; 
      moodLabel: string;
      fullDate: string;
    }> = [];

    filteredEntries.forEach((e: any) => {
      if (e.mood && e.createdAt) {
        const entryDate = new Date(e.createdAt);
        
        // Only include entries within the time range
        if (entryDate >= cutoffDate) {
          const score = moodScores[e.mood] ?? 4; // Default to neutral if unknown
          
          // Format date label based on time range
          let dateLabel: string;
          if (timeRange <= 7) {
            // For short ranges, show time of day too
            dateLabel = entryDate.toLocaleDateString("en-US", { 
              weekday: "short", 
              day: "numeric",
              hour: "numeric",
              minute: "2-digit"
            });
          } else if (timeRange <= 30) {
            dateLabel = entryDate.toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric",
              hour: "numeric",
              minute: "2-digit"
            });
          } else {
            dateLabel = entryDate.toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric"
            });
          }

          result.push({
            entryIndex: 0, // Will be set after sorting
            date: dateLabel,
            timestamp: entryDate.getTime(), // Use timestamp for proper sorting
            moodScore: score,
            moodLabel: moodLabels[e.mood] || "Neutral 😐",
            fullDate: entryDate.toISOString(),
          });
        }
      }
    });

    // Sort by timestamp (chronological order)
    const sorted = result.sort((a, b) => a.timestamp - b.timestamp);
    
    // Cap entries to prevent off-screen overflow
    // Reasonable cap: ~50 entries for good visibility, adjust based on time range
    const maxEntries = timeRange <= 7 ? 100 : timeRange <= 30 ? 150 : 200;
    
    let finalData = sorted;
    if (sorted.length > maxEntries) {
      // If too many entries, sample evenly to show trend without overflow
      const step = Math.ceil(sorted.length / maxEntries);
      finalData = sorted.filter((_, index) => index % step === 0 || index === sorted.length - 1);
    }
    
    // Assign sequential entry indices (1, 2, 3, ...) for X-axis positioning
    return finalData.map((entry, index) => ({
      ...entry,
      entryIndex: index + 1, // Start from 1
    }));
  }, [filteredEntries, timeRange]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics & Insights</h1>
        <p className="text-gray-600">Track your journaling and habit-building journey</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Journal</label>
          <select
            value={selectedJournalId}
            onChange={(e) => setSelectedJournalId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            style={{ backgroundColor: "var(--background, #ffffff)" }}
          >
            <option value="all">All Journals</option>
            {journals.map((journal) => (
              <option key={journal.id} value={journal.id}>
                {journal.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            style={{ backgroundColor: "var(--background, #ffffff)" }}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
            <option value={365}>Last Year</option>
            <option value={99999}>All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-indigo-100 text-xs md:text-sm font-medium mb-1">Level</p>
          <p className="text-3xl md:text-4xl font-bold">{xpStats?.level || 1}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-blue-100 text-xs md:text-sm font-medium mb-1">Total XP</p>
          <p className="text-2xl md:text-3xl font-bold">{xpStats?.totalXP.toLocaleString() || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-green-100 text-xs md:text-sm font-medium mb-1">Entries</p>
          <p className="text-3xl md:text-4xl font-bold">{journalStats.totalEntries}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-orange-100 text-xs md:text-sm font-medium mb-1">Entry Streak</p>
          <p className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            {journalStats.currentStreak} <Flame className="w-8 h-8 md:w-10 md:h-10" />
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-purple-100 text-xs md:text-sm font-medium mb-1">Habits</p>
          <p className="text-3xl md:text-4xl font-bold">{habitStats.totalHabits}</p>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-pink-100 text-xs md:text-sm font-medium mb-1">Habit Completions</p>
          <p className="text-3xl md:text-4xl font-bold">{habitStats.totalCompletions}</p>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <p className="text-teal-100 text-xs md:text-sm font-medium mb-1">Habit Streak</p>
          <p className="text-3xl md:text-4xl font-bold flex items-center gap-2">
            {habitStats.habitStreak} <Zap className="w-8 h-8 md:w-10 md:h-10" />
          </p>
        </div>
      </div>

      {/* Insights Panel */}
      <InsightsPanel entries={filteredEntries} timeRange={timeRange} />

      {/* Charts Grid - Dynamically loaded to improve initial compile time */}
      <ChartsSection
        activityOverTime={activityOverTime}
        moodPatternData={moodPatternData}
        moodTimelineData={moodTimelineData}
        timeDistribution={timeDistribution}
        timeRange={timeRange}
        MOOD_COLORS={MOOD_COLORS}
        COLORS={COLORS}
      />

      {/* Word Cloud */}
      <div className="mt-8">
        <WordCloud entries={filteredEntries} />
      </div>


      {/* Additional Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-rose-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-600 font-semibold text-sm uppercase tracking-wide mb-2">Total Words</p>
              <p className="text-4xl md:text-5xl font-bold text-gray-900">{journalStats.totalWords.toLocaleString()}</p>
            </div>
            <div className="bg-rose-500 p-4 rounded-2xl">
              <PenTool className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-violet-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-600 font-semibold text-sm uppercase tracking-wide mb-2">Avg Daily Habits</p>
              <p className="text-4xl md:text-5xl font-bold text-gray-900">{habitStats.avgCompletionsPerDay}</p>
            </div>
            <div className="bg-violet-500 p-4 rounded-2xl">
              <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide mb-2">Active Journals</p>
              <p className="text-4xl md:text-5xl font-bold text-gray-900">{journals.length}</p>
            </div>
            <div className="bg-emerald-500 p-4 rounded-2xl">
              <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
