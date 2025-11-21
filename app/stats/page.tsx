"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getEntries } from "../../src/lib/cache/entriesCache";
import { getJournals, getActiveJournalId, type Journal } from "../../src/lib/journals/manager";
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
  Legend,
  ResponsiveContainer,
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

// Mood score mapping for trend analysis
const moodScores: Record<string, number> = {
  "very-sad": 1,
  "sad": 2,
  "anxious": 2.5,
  "angry": 2.5,
  "neutral": 3,
  "calm": 4,
  "happy": 4.5,
  "grateful": 4.5,
  "excited": 5,
  "very-happy": 5,
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
  const [journals, setJournals] = useState<Journal[]>([]);
  const [selectedJournalId, setSelectedJournalId] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<number>(30); // days

  // Load data
  useEffect(() => {
    const allEntries = getEntries().filter((e: any) => !e.draft);
    setEntries(allEntries);
    setJournals(getJournals());
  }, []);

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

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return {
        totalEntries: 0,
        totalWords: 0,
        avgWordsPerEntry: 0,
        mostUsedMood: null,
        longestStreak: 0,
        currentStreak: 0,
      };
    }

    // Total entries and words
    const totalEntries = filteredEntries.length;
    const wordCounts = filteredEntries.map((e: any) => {
      const plainText = e.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return plainText.split(/\s+/).filter((w: string) => w.length > 0).length;
    });
    const totalWords = wordCounts.reduce((sum: number, count: number) => sum + count, 0);
    const avgWordsPerEntry = Math.round(totalWords / totalEntries);

    // Most used mood
    const moodCounts: Record<string, number> = {};
    filteredEntries.forEach((e: any) => {
      if (e.mood) {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      }
    });
    const mostUsedMood = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || null;

    // Calculate streaks
    const sortedEntries = [...filteredEntries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    let longestStreak = 0;
    let currentStreak = 0;
    let tempStreak = 1;
    let lastDate: Date | null = null;

    sortedEntries.forEach((e: any, index: number) => {
      const entryDate = new Date(e.createdAt);
      entryDate.setHours(0, 0, 0, 0);

      if (lastDate) {
        const daysDiff = Math.floor((entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          tempStreak++;
        } else if (daysDiff > 1) {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      lastDate = entryDate;
    });
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastEntry = sortedEntries[sortedEntries.length - 1];
    if (lastEntry) {
      const lastEntryDate = new Date(lastEntry.createdAt);
      lastEntryDate.setHours(0, 0, 0, 0);
      const daysSinceLastEntry = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastEntry <= 1) {
        // Count backwards from today/yesterday
        let streakDate = new Date(lastEntryDate);
        currentStreak = 0;
        
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
      avgWordsPerEntry,
      mostUsedMood,
      longestStreak,
      currentStreak,
    };
  }, [filteredEntries]);

  // Entries over time data
  const entriesOverTime = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredEntries.forEach((e: any) => {
      const date = new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped[date] = (grouped[date] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .slice(-30); // Last 30 data points
  }, [filteredEntries]);

  // Word count over time
  const wordCountOverTime = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredEntries.forEach((e: any) => {
      const date = new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const plainText = e.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const wordCount = plainText.split(/\s+/).filter((w: string) => w.length > 0).length;
      grouped[date] = (grouped[date] || 0) + wordCount;
    });
    return Object.entries(grouped)
      .map(([date, words]) => ({ date, words }))
      .slice(-30);
  }, [filteredEntries]);

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

  // Mood trend over time
  const moodTrend = useMemo(() => {
    const grouped: Record<string, { total: number; count: number }> = {};
    filteredEntries.forEach((e: any) => {
      if (e.mood) {
        const date = new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (!grouped[date]) grouped[date] = { total: 0, count: 0 };
        grouped[date].total += moodScores[e.mood] || 3;
        grouped[date].count += 1;
      }
    });
    return Object.entries(grouped)
      .map(([date, { total, count }]) => ({ date, score: (total / count).toFixed(1) }))
      .slice(-30);
  }, [filteredEntries]);

  // Most mentioned people
  const topPeople = useMemo(() => {
    const peopleCounts: Record<string, number> = {};
    filteredEntries.forEach((e: any) => {
      if (e.extractedPeople && Array.isArray(e.extractedPeople)) {
        e.extractedPeople.forEach((person: string) => {
          peopleCounts[person] = (peopleCounts[person] || 0) + 1;
        });
      }
    });
    return Object.entries(peopleCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredEntries]);

  // Most mentioned topics
  const topTopics = useMemo(() => {
    const topicCounts: Record<string, number> = {};
    filteredEntries.forEach((e: any) => {
      if (e.extractedTopics && Array.isArray(e.extractedTopics)) {
        e.extractedTopics.forEach((topic: string) => {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        });
      }
    });
    return Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredEntries]);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistics & Insights</h1>
        <p className="text-gray-600">Visualize your journaling journey with detailed analytics</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* Journal Filter */}
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

        {/* Time Range Filter */}
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

      {filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No entries found for the selected filters.</p>
          <p className="text-gray-500 text-sm mt-2">Start journaling to see your statistics!</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-blue-100 text-sm font-medium mb-1">Total Entries</p>
              <p className="text-4xl font-bold">{stats.totalEntries}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-green-100 text-sm font-medium mb-1">Total Words</p>
              <p className="text-4xl font-bold">{stats.totalWords.toLocaleString()}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-purple-100 text-sm font-medium mb-1">Current Streak</p>
              <p className="text-4xl font-bold">{stats.currentStreak} 🔥</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-orange-100 text-sm font-medium mb-1">Longest Streak</p>
              <p className="text-4xl font-bold">{stats.longestStreak} 🏆</p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Entries Over Time */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📝 Entries Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={entriesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Word Count Over Time */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">✍️ Word Count Over Time</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wordCountOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="words" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Distribution */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">😊 Mood Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    dataKey="count"
                    nameKey="mood"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry: any) => `${entry.mood} ${entry.count}`}
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.fullMood] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Mood Trend */}
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Mood Trend (1-5 scale)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <YAxis domain={[1, 5]} stroke="#6b7280" style={{ fontSize: "12px" }} />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="score" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: "#8B5CF6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top People Mentioned */}
            {topPeople.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Most Mentioned People</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPeople} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                    <Bar dataKey="count" fill="#EC4899" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Topics */}
            {topTopics.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">🏷️ Most Mentioned Topics</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topTopics} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <YAxis dataKey="topic" type="category" width={100} stroke="#6b7280" style={{ fontSize: "12px" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }} />
                    <Bar dataKey="count" fill="#14B8A6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Additional Stats */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg. Words per Entry</h3>
              <p className="text-4xl font-bold text-blue-600">{stats.avgWordsPerEntry}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Most Used Mood</h3>
              <p className="text-4xl">{stats.mostUsedMood ? moodMap[stats.mostUsedMood] : "—"}</p>
              <p className="text-sm text-gray-600 mt-1 capitalize">{stats.mostUsedMood?.replace("-", " ") || "N/A"}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">People Mentioned</h3>
              <p className="text-4xl font-bold text-pink-600">{topPeople.length}</p>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
