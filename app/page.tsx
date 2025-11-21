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

import { useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
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

//placeholder code for now (NON-FUNCTIONAL)
const dates = [
  // Array of dates for the date selector
  // isSelected: true marks which date is currently selected
  { day: 21, weekday: "Sun" },
  { day: 20, weekday: "Sat", isSelected: true },
  { day: 19, weekday: "Fri" },
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
  // ========================================================================
  // STATE MANAGEMENT (React Hooks)
  // ========================================================================
  //
  // WHAT IS STATE?
  // State = data that can change and causes the page to re-render
  // When state changes, React automatically updates the UI
  //
  // useState SYNTAX:
  // const [variableName, setVariableName] = useState(initialValue);
  //
  // - variableName = current value (read this)
  // - setVariableName = function to update value (call this to change it)
  // - useState(initialValue) = starting value
  //
  // HOW TO USE:
  // - Read: {selectedTab} (displays current value)
  // - Update: setSelectedTab("Daily") (changes the value)
  //
  // EXAMPLE: Adding sidebar collapse state
  // const [sidebarOpen, setSidebarOpen] = useState(true);
  // Then use: sidebarOpen ? "w-64" : "w-0" in className
  
  // State for tab selection (Daily, Weekly, Monthly)
  // Initial value: "Daily" (this tab is selected by default)
  const [selectedTab, setSelectedTab] = useState("Daily");

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
            TOP SECTION - Two Cards Side by Side
            ====================================================================
            
            Grid Layout:
            - grid = creates grid container
            - grid-cols-1 = 1 column on mobile
            - lg:grid-cols-2 = 2 columns on large screens
            - gap-6 = space between cards
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
          <div className="bg-pink-50 rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col gap-4 relative z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                How to Build a New Habit
              </h2>
              <p className="text-gray-700">
                This is essential for making progress in your health, happiness, and your life.
              </p>
              <a 
                href="/help"
                className="w-fit bg-white text-pink-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-100 transition inline-block"
              >
                Learn more
              </a>
              
              {/* Pagination Dots */}
              <div className="flex gap-2 mt-4">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            
            {/* Illustration Placeholder (Positioned Absolutely) */}
            <div className="absolute right-0 bottom-0 w-32 h-32 opacity-50">
              <div className="bg-blue-200 rounded-full w-full h-full flex items-center justify-center">
                <span className="text-4xl">🚀</span>
              </div>
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
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Statistics</h2>
              <button className="text-gray-400 hover:text-white">⋯</button>
            </div>
            
            {/* Circular Progress */}
            <div className="flex flex-col items-center mb-6">
              {/* Progress Circle (Simplified) */}
              <div className="relative w-32 h-32 mb-4">
                <svg className="transform -rotate-90 w-32 h-32">
                  {/* Background circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle (75%) */}
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="white"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * 0.25}`}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Percentage Text (Centered) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">75%</div>
                    <div className="text-xs text-gray-400">Overall Progress</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="text-2xl font-bold">7</div>
                </div>
                <div className="text-xs text-gray-400">Best Streaks</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="text-2xl font-bold">8</div>
                </div>
                <div className="text-xs text-gray-400">Perfect Days</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-2xl font-bold">24</div>
                </div>
                <div className="text-xs text-gray-400">Habits Done</div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            BOTTOM SECTION - Tabs, Date Selector, Habit Cards
            ====================================================================
            
            Flexbox Layout:
            - flex flex-col = vertical stack
            - gap-6 = space between tabs and content
        */}
        <div className="flex flex-col gap-6">
          
          {/* ================================================================
              TAB NAVIGATION
              ================================================================
              
              ARRAY LITERAL IN JSX:
              {["Daily", "Weekly", "Monthly"].map((tab) => (...))}
              - Creates array inline: ["Daily", "Weekly", "Monthly"]
              - .map() loops through it, creates button for each
              - tab = current string value ("Daily", then "Weekly", etc.)
              
              EVENT HANDLER EXPLANATION:
              onClick={() => setSelectedTab(tab)}
              - onClick = event handler (runs when button is clicked)
              - () => = arrow function (what happens on click)
              - setSelectedTab(tab) = updates state to selected tab
              - When state changes, React re-renders with new className
              
              CONDITIONAL STYLING:
              selectedTab === tab ? "active-style" : "inactive-style"
              - === = strict equality (checks if values are equal)
              - If selectedTab equals current tab, use active styles
              - Active: border-b-2 (underline), dark text, bold
              - Inactive: gray text, no underline
              
              TO ADD MORE TABS:
              - Add to array: ["Daily", "Weekly", "Monthly", "Yearly"]
              - The map() will automatically create a button for it
              
              TO CHANGE TAB STYLES:
              - Modify the className strings in the ternary operator
              - Active: border-b-2 border-gray-900 (underline, dark)
              - Inactive: text-gray-500 (gray text)
          */}
          <div className="flex gap-4 border-b border-gray-200">
            {/* 
              Inline array: ["Daily", "Weekly", "Monthly"]
              .map() creates a button for each tab name
              onClick updates selectedTab state, which triggers re-render
            */}
            {["Daily", "Weekly", "Monthly"].map((tab) => (
              <button
                key={tab} // React needs unique key
                onClick={() => setSelectedTab(tab)} // Update state on click
                className={
                  // Check if this tab is selected
                  selectedTab === tab
                    ? "px-4 py-2 border-b-2 border-gray-900 text-gray-900 font-semibold"
                    : "px-4 py-2 text-gray-500 hover:text-gray-900 transition"
                }
              >
                {tab} {/* Display tab name */}
              </button>
            ))}
          </div>

          {/* ================================================================
              CONTENT ROW - Date Selector + Habit Cards
              ================================================================
              
              Grid Layout:
              - grid = creates grid
              - grid-cols-[auto_1fr] = left column auto-width, right takes remaining
              - gap-6 = space between columns
          */}
          <div className="grid grid-cols-[auto_1fr] gap-6">
            
            {/* ================================================================
                DATE SELECTOR (Left Column)
                ================================================================
                
                Flexbox for Vertical Stack:
                - flex flex-col = vertical layout
                - gap-2 = small gap between date cards
                - items-center = centers horizontally
            */}
            <div className="flex flex-col gap-2 items-center">
              {/* Up Arrow */}
              <button className="text-gray-400 hover:text-gray-600">▲</button>
              
              {/* Date Cards */}
              {dates.map((date, index) => (
                <div
                  key={index}
                  className={
                    date.isSelected
                      ? "w-16 py-3 bg-gray-900 text-white rounded-lg text-center"
                      : "w-16 py-3 bg-gray-100 text-gray-600 rounded-lg text-center"
                  }
                >
                  <div className="text-sm font-semibold">{date.day}</div>
                  <div className="text-xs">{date.weekday}</div>
                </div>
              ))}
              
              {/* Down Arrow */}
              <button className="text-gray-400 hover:text-gray-600">▼</button>
            </div>

            {/* ================================================================
                HABIT CARDS (Right Column - Horizontal Scroll)
                ================================================================
                
                HORIZONTAL SCROLLING SETUP:
                - overflow-x-auto = allows horizontal scrolling when content overflows
                - pb-2 = padding-bottom (gives space for scrollbar)
                
                INNER CONTAINER:
                - flex = horizontal layout (cards side by side)
                - gap-4 = space between cards: 1rem (16px)
                - min-w-max = minimum width: max-content (prevents cards from shrinking)
                
                TEMPLATE LITERAL IN className:
                className={`${habit.color} rounded-xl p-6 ...`}
                - Backticks `` = template literal (allows variable insertion)
                - ${habit.color} = inserts the color value (e.g., "bg-purple-100")
                - This is how we use dynamic Tailwind classes
                
                MAP FUNCTION:
                {habitCards.map((habit) => (...))}
                - Loops through habitCards array
                - Creates a card div for each habit
                - habit = current HabitCard object
                
                CARD STRUCTURE:
                - habit.color = background color (from data)
                - rounded-xl = extra rounded corners
                - p-6 = padding inside card
                - min-w-[200px] = minimum width: 200px (prevents cards from being too narrow)
                - flex flex-col = vertical stack inside card
                
                TO ADD MORE HABIT CARDS:
                - Add to habitCards array at top of file
                - The map() will automatically create a card for it
                
                TO CHANGE CARD COLORS:
                - Modify color property in habitCards array
                - Use Tailwind: bg-purple-100, bg-pink-100, bg-blue-100, etc.
                
                TO CHANGE CARD SIZE:
                - Modify min-w-[200px] to min-w-[300px] (wider) or min-w-[150px] (narrower)
            */}
            <div className="overflow-x-auto pb-2">
              {/* Inner container for horizontal layout */}
              <div className="flex gap-4 min-w-max">
                {/* 
                  Loop through habitCards array
                  Creates a card for each habit
                  Template literal ${habit.color} inserts the color class
                */}
                {habitCards.map((habit) => (
                  <div
                    key={habit.id} // React needs unique key (using habit.id)
                    className={`${habit.color} rounded-xl p-6 min-w-[200px] flex flex-col gap-2`}
                  >
                    <div className="text-3xl mb-2">{habit.icon}</div> {/* Icon emoji */}
                    <h3 className="font-bold text-gray-900">{habit.name}</h3> {/* Habit name */}
                    <p className="text-sm text-gray-600">{habit.duration}</p> {/* Duration */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
}
