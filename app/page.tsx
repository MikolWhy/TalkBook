// Dashboard Homepage - Sidebar + Main Content Layout
// REMOVE COMMENTS WHEN FINALIZING FOR PRODUCTION/SUBMISSION
// FILE STRUCTURE EXPLANATION:
// This file is a React component that renders the homepage.
// It's structured in sections:
// 1. Imports (what we need from other files)
// 2. Type definitions (TypeScript interfaces - what data looks like)
// 3. Data constants (arrays/objects with our data)
// 4. Main component (the actual page that gets displayed)

//
// This page contains:
// 1. Fixed sidebar navigation (left side) -> CHANGE TO MINIMIZABLE + PERSIST ACROSS SITE
// 2. Main content area (right side) with scrollable content
// 3. Dashboard cards: promotional banner, statistics, habit cards
// 4. Tab navigation and date selector
// 5. Horizontal scrolling for habit cards

// needed to use server components + required when using useState, useEffect, event handlers, etc
"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "./components/DashboardLayout";
import XPProgressBar from "./components/XPProgressBar";
import { getEntries } from "../src/lib/cache/entriesCache";
// useState = React hook for storing data that can change
// - Syntax: const [value, setValue] = useState(initialValue)
// - value = current value
// - setValue = function to update the value
// - Example: const [count, setCount] = useState(0)

// WHAT ARE INTERFACES?
// Interfaces = blueprints that describe what an object should look like
// eg:form: "This object must have these fields"
//
// WHY USE THEM?
// - TypeScript catches errors if you use wrong data types
// - IDE autocomplete knows what properties exist
// - Self-documenting code (shows what data structure is expected)
//
// SYNTAX EXPLANATION:
// interface Name {
//   property: type;        // Required property
//   property?: type;       // Optional property (? means optional)
// }
//

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
  // id: number = unique identifier for each habit card
  id: number;
  
  // name: string = habit name (e.g., "Workout", "Running")
  name: string;
  
  // duration: string = how long/time for the habit (e.g., "1 hour", "4 miles")
  duration: string;
  
  // icon: string = emoji for the habit (e.g., "💪", "🏃")
  icon: string;
  
  // color: string = Tailwind CSS class for background color (e.g., "bg-purple-100")
  // This is a string because we'll use it in className like: className={`${habit.color}`}
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

export default function HomePage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>("Your Name");
  const [todayHabitLogs, setTodayHabitLogs] = useState<Record<number, any>>({});

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
  }, []);

  const loadHabitsData = async () => {
    try {
      const { getActiveHabits, getHabitLogs } = await import("../src/lib/db/repo");
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
        {/* XP Progress Bar - Full Width */}
        <div className="mb-8">
          <XPProgressBar />
        </div>

        {/* Quick Stats - 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-md border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-1">Entries</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalEntries}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-xl">
                <span className="text-3xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 shadow-md border-2 border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-1">Streak</p>
                <p className="text-4xl font-bold text-gray-900">{stats.currentStreak} 🔥</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-xl">
                <span className="text-3xl">📅</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-md border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-semibold text-sm uppercase tracking-wide mb-1">Words</p>
                <p className="text-4xl font-bold text-gray-900">{stats.totalWords.toLocaleString()}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-xl">
                <span className="text-3xl">✍️</span>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            PROMOTIONAL BANNER + QUICK ACTION
            ====================================================================
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* ================================================================
              PROMOTIONAL BANNER CARD (Left)
              ================================================================
              
              Card Design:
              - bg-pink-50 = light pink background
              - rounded-xl = extra rounded corners
              - p-6 = padding inside card
              - relative = allows absolute positioning of illustration
              - overflow-hidden = clips content that overflows
              
              Flexbox for Content:
              - flex flex-col = vertical stack
              - gap-4 = space between elements
          */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 relative overflow-hidden border-2 border-purple-100 shadow-md">
            <div className="flex flex-col gap-3 relative z-10">
              <h2 className="text-3xl font-bold text-gray-900">
                {userName === "Your Name" ? "Welcome!" : `Welcome back, ${userName}!`}
              </h2>
              <p className="text-gray-700 text-lg font-medium">
                1 Page 1 Habit 1 Step at a time. Consistency is key !
              </p>
              
              <div className="flex gap-3 mt-2">
                <a 
                  href="/journal/new"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition inline-block shadow-md"
                >
                  ✍️ New Entry
                </a>
                <a 
                  href="/habits/new"
                  className="text-purple-600 border-2 border-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition inline-block"
                  style={{ backgroundColor: "var(--background, #ffffff)" }}
                >
                  ➕ Create New Habit
                </a>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute right-4 top-4 text-6xl opacity-20">
              ✨
            </div>
            <div className="absolute right-16 bottom-4 text-5xl opacity-20">
              🌟
            </div>
          </div>

          {/* ================================================================
              STATISTICS CARD (Right)
              ================================================================
              
              Dark Card:
              - bg-gray-900 = dark background
              - text-white = white text
              
              Circular Progress:
              - We'll create a simple circular progress indicator
              - Using SVG or CSS for the circle
          */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Today's Progress</h2>
              <a href="/stats" className="text-gray-400 hover:text-white transition">
                📊
              </a>
            </div>
            
            {/* Circular Progress - Habit Completion Rate */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-36 h-36 mb-4">
                <svg className="transform -rotate-90 w-36 h-36">
                  {/* Background circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="#10B981"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 64}`}
                    strokeDashoffset={`${2 * Math.PI * 64 * (1 - habitStats.completionRate / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                {/* Percentage Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-black text-green-400">{habitStats.completionRate}%</div>
                    <div className="text-xs text-gray-400 font-medium">Habits Done</div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-300 text-center">
                {habitStats.completedToday} of {habitStats.totalHabits} completed
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{stats.currentStreak}</div>
                <div className="text-xs text-gray-400 mt-1">Entry Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{stats.totalEntries}</div>
                <div className="text-xs text-gray-400 mt-1">Total Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{habitStats.totalHabits}</div>
                <div className="text-xs text-gray-400 mt-1">Active Habits</div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            HABIT CARDS SECTION
            ====================================================================
        */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Habits</h2>
            <a
              href="/habits"
              className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
            >
              View All →
            </a>
          </div>
          
          <div className="overflow-x-auto pb-2">
              <div className="flex gap-4 min-w-max">
                {habits.length === 0 ? (
                  // Empty state
                  <div className="flex items-center justify-center w-full py-12 px-6">
                    <div className="text-center">
                      <p className="text-6xl mb-4">💪</p>
                      <p className="text-gray-900 font-semibold text-lg mb-2">No habits yet</p>
                      <p className="text-gray-600 mb-4">Start building better habits today!</p>
                      <a
                        href="/habits/new"
                        className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
                      >
                        Create Your First Habit
                      </a>
                    </div>
                  </div>
                ) : (
                  // Real habit cards
                  habits.slice(0, 6).map((habit) => {
                    const todayLog = todayHabitLogs[habit.id!];
                    const isCompleted = todayLog?.value > 0;
                    const progressValue = habit.type === 'numeric' && habit.target 
                      ? Math.min(100, (todayLog?.value || 0) / habit.target * 100)
                      : isCompleted ? 100 : 0;

                    return (
                      <a
                        key={habit.id}
                        href="/habits"
                        className="block min-w-[220px] rounded-xl p-6 transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
                        style={{
                          backgroundColor: habit.color + '20',
                          borderLeft: `4px solid ${habit.color}`,
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-gray-900 text-lg">{habit.name}</h3>
                          {isCompleted && (
                            <span className="text-2xl">✅</span>
                          )}
                        </div>
                        
                        {habit.type === 'numeric' ? (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">
                              {todayLog?.value || 0} / {habit.target || '∞'} {habit.unit || 'units'}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                  width: `${progressValue}%`,
                                  backgroundColor: habit.color,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600">
                            {isCompleted ? '✓ Completed today' : 'Not done yet'}
                          </p>
                        )}
                      </a>
                    );
                  })
                )}
                
                {/* Add new habit card */}
                {habits.length > 0 && habits.length < 6 && (
                  <a
                    href="/habits/new"
                    className="min-w-[220px] rounded-xl p-6 border-2 border-dashed border-gray-300 hover:border-purple-500 transition-all flex items-center justify-center cursor-pointer hover:bg-purple-50"
                  >
                    <div className="text-center">
                      <p className="text-4xl mb-2">➕</p>
                      <p className="text-gray-600 font-semibold">Add Habit</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
        </div>
    </DashboardLayout>
  );
}
