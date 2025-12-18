"use client";

/**
 * Dashboard Home
 * 
 * The main landing page showing user progress, habit streaks, and recent activity.
 * 
 * Architecture:
 * - Renders inside `DashboardLayout`.
 * - Aggregates data from local `entriesCache` and the database repository.
 * - Uses dynamic imports for DB logic to keep everything client-side.
 * - Connects to the `/api/quote` endpoint for the daily inspiration.
 * 
 * @module app/page.tsx
 */

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getEntries } from "@/lib/cache/entriesCache";
import {
  FileText,
  Flame,
  Calendar,
  PenTool,
  Sparkles,
  Star,
  BarChart,
  CheckCircle2,
  Dumbbell,
  Plus,
  RefreshCw,
  ArrowRight,
  Quote
} from "lucide-react";


interface NavItem {
  // label: string = navigation link text (e.g., "Home", "Journal")
  label: string;

  // href: string = URL path (e.g., "/", "/journal")
  href: string;

  // icon: string = emoji or icon character (e.g., "🏠", "📝")
  icon: string;

  // isActive?: boolean = optional, true if this nav item is currently selected
  // The ? means this property is optional (can be missing)
  isActive?: boolean;

  // badge?: string = optional, shows a badge like "New"
  badge?: string;
}

interface HabitCard {
  id: number;
  name: string;
  duration: string;
  icon: string;
  color: string;
}

// ============================================================================

//
// EXAMPLE: To add a new nav item, add this line:
// { label: "Settings", href: "/settings", icon: "⚙️" },

// Navigation items moved to Sidebar component
// Insight items moved to Sidebar component

//placeholder code for now (NON-FUNCTIONAL)
const habitCards: HabitCard[] = [
  // Array of habit cards displayed horizontally
  // Each card has: id (unique), name, duration, icon, and color
  // To change colors, use Tailwind classes: bg-purple-100, bg-pink-100, etc.
  // Available colors: purple, pink, yellow, blue, green, red, orange, etc.
  { id: 1, name: "Workout", duration: "1 hour", icon: "💪", color: "bg-purple-100" },
  { id: 2, name: "Running", duration: "4 miles", icon: "🏃", color: "bg-pink-100" },
  { id: 3, name: "Read a Book", duration: "1 hour", icon: "📚", color: "bg-yellow-100" },
  { id: 4, name: "Drink Water", duration: "2 Liters", icon: "💧", color: "bg-blue-100" },
  // ADD MORE HABITS HERE:
  // { id: 5, name: "Meditate", duration: "10 min", icon: "🧘", color: "bg-green-100" },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
//
// WHAT IS A COMPONENT?
// A component = a reusable piece of UI (like a function that returns HTML)
// This component is the homepage - it returns all the JSX (HTML-like code)
//
// SYNTAX EXPLANATION:
// export default function ComponentName() {
//   // Component code here
//   return ( <div>...</div> );
// }
//
// - export default = makes this the main export (Next.js uses it as the page)
// - function = JavaScript function
// - ComponentName = must start with capital letter (React convention)
// - () = no parameters (but you can add props here if needed)
// - return = what gets displayed on the page
//
// HOW TO MODIFY:
// - Change component name: Rename function AND file name must match
// - Add state: Use useState hook (see selectedTab example below)
// - Add functions: Define them inside the component
// - Change layout: Modify the JSX inside return()

interface Quote {
  quoteText: string;
  quoteAuthor: string;
}

export default function HomePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("Your Name");
  const [todayHabitLogs, setTodayHabitLogs] = useState<Record<number, any>>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(true);

  const fetchQuote = async () => {
    try {
      setQuoteLoading(true);
      const response = await fetch('/api/quote');

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();
      setQuote({
        quoteText: data.quoteText || '',
        quoteAuthor: data.quoteAuthor || 'Unknown'
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Fallback quote if API fails
      setQuote({
        quoteText: "The journey of a thousand miles begins with one step.",
        quoteAuthor: "Lao Tzu"
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  useEffect(() => {
    const loadedEntries = getEntries().filter((e: any) => !e.draft);
    setEntries(loadedEntries);

    // Load user name from localStorage
    const storedName = typeof window !== "undefined" ? localStorage.getItem("talkbook-profile-name") : null;
    if (storedName) {
      setUserName(storedName);
    }

    // Load habits data
    loadHabitsData();

    // Fetch inspirational quote
    fetchQuote();
  }, []);

  const loadHabitsData = async () => {
    try {
      const { getActiveHabits, getHabitLogs } = await import("@/lib/db/repo");
      const habitsData = await getActiveHabits(1);
      setHabits(habitsData);

      // Load today's logs
      const today = new Date().toISOString().split('T')[0];
      const logsData: Record<number, any> = {};
      for (const habit of habitsData) {
        if (habit.id) {
          const logs = await getHabitLogs(habit.id, today, today);
          if (logs.length > 0) {
            logsData[habit.id] = logs[0];
          }
        }
      }
      setTodayHabitLogs(logsData);
    } catch (error) {
      console.error("Failed to load habits:", error);
    }
  };

  // Calculate quick stats
  const stats = useMemo(() => {
    const totalEntries = entries.length;

    // Calculate current streak (consecutive days with at least 1 entry)
    // Get unique dates that have at least one entry
    const datesWithEntries = new Set<string>();
    entries.forEach((entry) => {
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

    // Total words
    const totalWords = entries.reduce((sum, e) => {
      const plainText = e.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      return sum + plainText.split(/\s+/).filter((w: string) => w.length > 0).length;
    }, 0);

    return { totalEntries, currentStreak, totalWords };
  }, [entries]);

  // Calculate habit stats
  const habitStats = useMemo(() => {
    const totalHabits = habits.length;
    const completedToday = Object.values(todayHabitLogs).filter((log: any) => log?.value > 0).length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return { totalHabits, completedToday, completionRate };
  }, [habits, todayHabitLogs]);

  // ========================================================================
  // RETURN STATEMENT (JSX - What Gets Displayed)
  // ========================================================================
  //
  // WHAT IS JSX?
  // JSX = JavaScript XML (HTML-like syntax in JavaScript)
  // It looks like HTML but it's actually JavaScript
  //
  // JSX RULES:
  // 1. Must return ONE root element (or use React Fragment <>)
  // 2. Use className instead of class (class is reserved in JavaScript)
  // 3. Use {} to insert JavaScript expressions
  // 4. Self-closing tags need /> (like <div /> or <img />)
  //
  // SYNTAX:
  // return (
  //   <div>
  //     <h1>Title</h1>
  //     {variableName} {/* JavaScript expression */}
  //   </div>
  // );

  return (
    <DashboardLayout>
      {/* ====================================================================
            WELCOME CARD - Main Focus (Header)
            ====================================================================
        */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-2xl p-8 md:p-12 relative overflow-hidden border-2 border-purple-200 shadow-xl">
          <div className="relative z-10">
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {userName === "Your Name" ? "Welcome!" : `Welcome back, ${userName}!`}
              </h1>
              <p className="text-xl text-gray-700 font-medium">
                1 Page 1 Habit 1 Step at a time. Consistency is key !
              </p>
            </div>

            {/* Inspirational Quote Section */}
            <div className="mt-6 pt-6 border-t border-purple-200">
              {quoteLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-pulse text-gray-400">Loading inspiration...</div>
                </div>
              ) : quote ? (
                <div
                  onClick={fetchQuote}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  title="Click for a new quote"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Quote className="w-6 h-6 text-purple-500 mt-1 flex-shrink-0" />
                    <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
                      {quote.quoteText}
                    </p>
                  </div>
                  {quote.quoteAuthor && quote.quoteAuthor !== 'Unknown' && (
                    <p className="text-base text-gray-600 font-semibold text-right">
                      — {quote.quoteAuthor}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Unable to load quote
                </div>
              )}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute right-8 top-8 opacity-20">
            <Sparkles className="w-12 h-12 text-purple-400" />
          </div>
          <div className="absolute right-20 bottom-8 opacity-20">
            <Star className="w-10 h-10 text-pink-400" />
          </div>
          <div className="absolute left-8 bottom-8 opacity-10">
            <Star className="w-16 h-16 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* ====================================================================
            QUICK ACTIONS SECTION
            ====================================================================
        */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="/habits/new"
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-md border-2 border-purple-100 hover:border-purple-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Add New Habit</h3>
                <p className="text-sm text-gray-600">Start tracking a new habit today</p>
              </div>
            </div>
          </a>

          <a
            href="/journal/new"
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-md border-2 border-blue-100 hover:border-blue-300 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">New Journal Entry</h3>
                <p className="text-sm text-gray-600">Write about your day</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* ====================================================================
            STATS SECTION - Today's Progress + Current Habits
            ====================================================================
        */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Today's Progress Card - Larger Graph */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-xl border border-gray-700 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Today's Progress</h2>
            <a href="/stats" className="text-gray-400 hover:text-white transition">
              <BarChart className="w-5 h-5" />
            </a>
          </div>

          {/* Circular Progress - Habit Completion Rate - Larger */}
          <div className="flex flex-col items-center mb-6 flex-1 justify-center">
            <div className="relative w-32 h-32 mb-3">
              <svg className="transform -rotate-90 w-32 h-32">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="10"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#10B981"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - habitStats.completionRate / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              {/* Percentage Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-black text-green-400">{habitStats.completionRate}%</div>
                  <div className="text-xs text-gray-400 font-medium">Habits</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-300 text-center">
              {habitStats.completedToday} of {habitStats.totalHabits} completed
            </p>
          </div>

          {/* Vertical Stats - Moved to Bottom */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-700 mt-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-gray-400">Entry Streak</span>
              </div>
              <div className="text-base font-bold text-orange-400">{stats.currentStreak}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-400">Total Entries</span>
              </div>
              <div className="text-base font-bold text-blue-400">{stats.totalEntries}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-gray-400">Active Habits</span>
              </div>
              <div className="text-base font-bold text-purple-400">{habitStats.totalHabits}</div>
            </div>
          </div>
        </div>

        {/* Current Habits */}
        <div className="bg-white rounded-xl p-6 shadow-md border-2 border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Current Habits</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {habits.length === 0 ? (
              <div className="text-center py-8">
                <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No habits yet</p>
              </div>
            ) : (
              habits.slice(0, 5).map((habit) => {
                const todayLog = todayHabitLogs[habit.id!];
                const isCompleted = todayLog?.value > 0;
                const progressValue = habit.type === 'numeric' && habit.target
                  ? Math.min(100, (todayLog?.value || 0) / habit.target * 100)
                  : isCompleted ? 100 : 0;

                return (
                  <a
                    key={habit.id}
                    href="/habits"
                    className="block rounded-lg p-3 transition-all hover:bg-gray-50 cursor-pointer border border-gray-100"
                    style={{
                      borderLeft: `3px solid ${habit.color}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm">{habit.name}</h3>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {habit.type === 'numeric' ? (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">
                          {todayLog?.value || 0} / {habit.target || '∞'} {habit.unit || 'units'}
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                              width: `${progressValue}%`,
                              backgroundColor: habit.color,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-600">
                        {isCompleted ? '✓ Completed today' : 'Not done yet'}
                      </p>
                    )}
                  </a>
                );
              })
            )}
          </div>
          {habits.length > 5 && (
            <a
              href="/habits"
              className="block text-center mt-4 text-sm text-purple-600 hover:text-purple-700 font-semibold"
            >
              View All Habits <ArrowRight className="w-4 h-4 inline ml-1" />
            </a>
          )}
        </div>
      </div>


    </DashboardLayout>
  );
}

