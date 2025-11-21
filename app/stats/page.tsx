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
          allLogs.push(...logs.map(log => ({ ...log, habitName: habit.name, habitColor: habit.color })));
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

    // Calculate current streak
    const sortedEntries = [...filteredEntries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    if (lastEntry) {
      const lastEntryDate = new Date(lastEntry.createdAt);
      lastEntryDate.setHours(0, 0, 0, 0);
      const daysSinceLastEntry = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastEntry <= 1) {
        let streakDate = new Date(lastEntryDate);
        for (let i = sortedEntries.length - 1; i >= 0; i--) {
          const entryDate = new Date(sortedEntries[i].createdAt);
          entryDate.setHours(0, 0, 0, 0);
          const diff = Math.floor((streakDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diff === 0) {
            currentStreak++;
          } else if (diff === 1) {
            currentStreak++;
            streakDate = entryDate;
          } else {
            break;
          }
        }
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
    const totalHabits = habits.length;
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

    return {
      totalHabits,
      totalCompletions,
      avgCompletionsPerDay: Math.round(avgCompletionsPerDay * 10) / 10,
    };
  }, [habits, filteredHabitLogs]);

  // Combined activity data (entries + habits over time)
  const activityOverTime = useMemo(() => {
    const grouped: Record<string, { entries: number; habits: number }> = {};
    
    // Count entries per day
    filteredEntries.forEach((e: any) => {
      const date = new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!grouped[date]) grouped[date] = { entries: 0, habits: 0 };
      grouped[date].entries++;
    });
    
    // Count habit completions per day
    filteredHabitLogs.forEach((log: any) => {
      if (log.value > 0) {
        const date = new Date(log.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!grouped[date]) grouped[date] = { entries: 0, habits: 0 };
        grouped[date].habits++;
      }
    });
    
    return Object.entries(grouped)
      .map(([date, data]) => ({ date, ...data }))
      .slice(-30);
  }, [filteredEntries, filteredHabitLogs]);

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

  // Mood distribution
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
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
          <p className="text-pink-100 text-xs md:text-sm font-medium mb-1">Completions</p>
          <p className="text-3xl md:text-4xl font-bold">{habitStats.totalCompletions}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Combined Activity */}
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
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px", fontWeight: "500" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px", fontWeight: "500" }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#fff", 
                  border: "2px solid #3B82F6", 
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }} 
              />
              <Area type="monotone" dataKey="entries" stroke="#3B82F6" strokeWidth={3} fill="url(#colorEntries)" name="Journal Entries" />
              <Area type="monotone" dataKey="habits" stroke="#10B981" strokeWidth={3} fill="url(#colorHabits)" name="Habit Completions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

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

        {/* Mood Distribution */}
        {moodDistribution.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-amber-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-500 p-3 rounded-xl">
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
                    border: "2px solid #F59E0B", 
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Writing Time Distribution */}
        {timeDistribution.length > 0 && (
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 md:p-8 shadow-xl border-2 border-cyan-100 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-500 p-3 rounded-xl">
                <span className="text-2xl md:text-3xl">⏰</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">When You Write</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
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
