"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getEntries } from "../../src/lib/cache/entriesCache";
import { getJournals, type Journal } from "../../src/lib/journals/manager";
import { getActiveHabits, getHabitLogs } from "../../src/lib/db/repo";
import { getUserStats } from "../../src/lib/gamification/xp";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

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
  const [timeRange, setTimeRange] = useState<number>(30); // days
  const [xpStats, setXpStats] = useState<any>(null);

  // Load data
  useEffect(() => {
    loadData();
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

  // Habit completion by habit
  const habitCompletionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredHabitLogs.forEach((log: any) => {
      if (log.value > 0) {
        counts[log.habitName] = (counts[log.habitName] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredHabitLogs]);

  // Mood distribution (pie chart)
  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEntries.forEach((e: any) => {
      if (e.mood) {
        counts[e.mood] = (counts[e.mood] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([mood, count]) => ({ mood: moodMap[mood] || mood, count, fullMood: mood }))
      .sort((a, b) => b.count - a.count);
  }, [filteredEntries]);

  // Mood pattern over time (line chart showing mood trends)
  const moodPatternOverTime = useMemo(() => {
    // Create a map of dates to moods (use most common mood per day if multiple entries)
    const dateMoodMap: Record<string, Record<string, number>> = {};
    
    filteredEntries.forEach((e: any) => {
      if (e.mood) {
        const entryDate = new Date(e.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        const dateKey = entryDate.toISOString().split('T')[0];
        
        if (!dateMoodMap[dateKey]) {
          dateMoodMap[dateKey] = {};
        }
        dateMoodMap[dateKey][e.mood] = (dateMoodMap[dateKey][e.mood] || 0) + 1;
      }
    });
    
    // Generate all dates in the range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeRange);
    cutoffDate.setHours(0, 0, 0, 0);
    
    const result: Array<{ date: string; mood: string | null; moodEmoji: string; moodValue: number }> = [];
    const currentDate = new Date(cutoffDate);
    
    // Mood value mapping for trend visualization (higher = more positive)
    const moodValues: Record<string, number> = {
      "very-happy": 5,
      "happy": 4,
      "excited": 4.5,
      "grateful": 4,
      "calm": 3.5,
      "neutral": 3,
      "anxious": 2,
      "sad": 1.5,
      "angry": 1,
      "very-sad": 0.5,
    };
    
    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const moodsForDay = dateMoodMap[dateKey];
      
      let dominantMood: string | null = null;
      let dominantMoodEmoji = "";
      let moodValue = 0;
      
      if (moodsForDay) {
        // Find the most common mood for this day
        let maxCount = 0;
        for (const [mood, count] of Object.entries(moodsForDay)) {
          if (count > maxCount) {
            maxCount = count;
            dominantMood = mood;
            dominantMoodEmoji = moodMap[mood] || "";
            moodValue = moodValues[mood] || 3;
          }
        }
      }
      
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
        mood: dominantMood,
        moodEmoji: dominantMoodEmoji,
        moodValue: moodValue,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result;
  }, [filteredEntries, timeRange]);

  // Writing time distribution
  const timeDistribution = useMemo(() => {
    const hours: Record<number, number> = {};
    filteredEntries.forEach((e: any) => {
      const hour = new Date(e.createdAt).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    
    const periods = {
      "🌅 Morning": 0,
      "☀️ Afternoon": 0,
      "🌆 Evening": 0,
      "🌙 Night": 0,
    };
    
    Object.entries(hours).forEach(([hour, count]) => {
      const h = parseInt(hour);
      if (h >= 6 && h < 12) periods["🌅 Morning"] += count;
      else if (h >= 12 && h < 18) periods["☀️ Afternoon"] += count;
      else if (h >= 18 && h < 22) periods["🌆 Evening"] += count;
      else periods["🌙 Night"] += count;
    });
    
    return Object.entries(periods)
      .map(([period, count]) => ({ period, count }))
      .filter(d => d.count > 0);
  }, [filteredEntries]);

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
          <p className="text-3xl md:text-4xl font-bold">{journalStats.currentStreak} 🔥</p>
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
          <p className="text-3xl md:text-4xl font-bold">{habitStats.habitStreak} ⚡</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combined Activity */}
        {activityOverTime.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-blue-100 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-500 p-3 rounded-xl">
                <span className="text-2xl md:text-3xl">📊</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Your Activity</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={activityOverTime}>
                <defs>
                  <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  style={{ fontSize: timeRange > 30 ? "10px" : "12px", fontWeight: "500" }}
                  angle={timeRange > 30 ? -45 : 0}
                  textAnchor={timeRange > 30 ? "end" : "middle"}
                  height={timeRange > 30 ? 60 : 30}
                />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px", fontWeight: "500" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "2px solid #3B82F6", 
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                  formatter={(value: any) => [value, ""]}
                />
                <Area type="monotone" dataKey="entries" stroke="#3B82F6" strokeWidth={3} fill="url(#colorEntries)" name="Journal Entries" />
                <Area type="monotone" dataKey="habits" stroke="#10B981" strokeWidth={3} fill="url(#colorHabits)" name="Habit Completions" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Habit Completions by Habit */}
        {habitCompletionData.length > 0 && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-500 p-3 rounded-xl">
                <span className="text-2xl md:text-3xl">✅</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Top Habits</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={habitCompletionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px", fontWeight: "500" }} />
                <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" style={{ fontSize: "11px", fontWeight: "500" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "2px solid #8B5CF6", 
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }} 
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Mood Pattern Over Time */}
        {moodPatternOverTime.some(d => d.mood !== null) && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-amber-100 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500 p-3 rounded-xl">
                <span className="text-2xl md:text-3xl">📈</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Mood Pattern Over Time</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodPatternOverTime}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280" 
                  style={{ fontSize: timeRange > 30 ? "10px" : "11px", fontWeight: "500" }}
                  angle={timeRange > 30 ? -45 : 0}
                  textAnchor={timeRange > 30 ? "end" : "middle"}
                  height={timeRange > 30 ? 60 : 30}
                />
                <YAxis 
                  stroke="#6b7280" 
                  style={{ fontSize: "12px", fontWeight: "500" }}
                  domain={[0, 5]}
                  ticks={[0, 1, 2, 3, 4, 5]}
                  tickFormatter={(value) => {
                    const moodLabels: Record<number, string> = {
                      0.5: "😭", 1: "😠", 1.5: "😢", 2: "😰", 3: "😐", 3.5: "😌", 4: "😊", 4.5: "🤩", 5: "😄"
                    };
                    return moodLabels[value] || "";
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "2px solid #F59E0B", 
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    if (props.payload.moodEmoji && props.payload.mood) {
                      return [`${props.payload.moodEmoji} ${props.payload.mood}`, "Mood"];
                    }
                    return [value, name];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="moodValue" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  fill="url(#colorMood)"
                  name="Mood"
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="moodValue" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={(props: any) => {
                    if (props.payload.moodValue > 0) {
                      return <circle cx={props.cx} cy={props.cy} r={4} fill="#F59E0B" />;
                    }
                    return null;
                  }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Mood Distribution */}
        {moodDistribution.length > 0 && (
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-rose-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-rose-500 p-3 rounded-xl">
                <span className="text-2xl md:text-3xl">😊</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Mood Breakdown</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={moodDistribution}
                  dataKey="count"
                  nameKey="mood"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry: any) => `${entry.mood} ${entry.count}`}
                  labelLine={false}
                  strokeWidth={3}
                  stroke="#fff"
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.fullMood] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "2px solid #F43F5E", 
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [`${value} entries`, props.payload.fullMood];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Writing Time Distribution */}
        {timeDistribution.length > 0 && (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-cyan-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-500 p-3 rounded-xl">
                <span className="text-2xl md:text-3xl">⏰</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">When You Write</h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#6b7280" style={{ fontSize: "12px", fontWeight: "500" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px", fontWeight: "500" }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#fff", 
                    border: "2px solid #06B6D4", 
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }}
                  formatter={(value: any) => [`${value} entries`, ""]}
                />
                <Bar dataKey="count" fill="#06B6D4" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
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
              <span className="text-4xl md:text-5xl">✍️</span>
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
              <span className="text-4xl md:text-5xl">📈</span>
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
              <span className="text-4xl md:text-5xl">📚</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
