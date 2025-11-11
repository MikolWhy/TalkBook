// ============================================================================
// HOME PAGE - COMPLETE EDUCATIONAL EXAMPLE
// ============================================================================
// This file teaches you how to build a React component in Next.js with
// TypeScript and Tailwind CSS. Every line is explained!
// ============================================================================

// ----------------------------------------------------------------------------
// STEP 1: "use client" DIRECTIVE
// ----------------------------------------------------------------------------
// WHY: Next.js 13+ uses Server Components by default (components that run
//      on the server). But we need client-side features like:
//      - useState (React state)
//      - useEffect (side effects like fetching data)
//      - Event handlers (onClick, onChange)
//      - Browser APIs (localStorage, IndexedDB)
//
// HOW WE KNOW: Next.js documentation says "use client" is needed for any
//              component that uses React hooks or browser APIs.
//
// SYNTAX: "use client" must be the FIRST line (before any imports)
//         It's a special directive that tells Next.js "this runs in browser"
//
// ALTERNATIVE: If you don't need client features, you can make it a Server
//              Component (no "use client"). Server Components can fetch data
//              directly without useEffect, but can't use hooks or event handlers.
"use client";

// ----------------------------------------------------------------------------
// STEP 2: IMPORT STATEMENTS
// ----------------------------------------------------------------------------
// WHY: We need to bring in code from other files and libraries
//
// SYNTAX BREAKDOWN:
//   import { thing1, thing2 } from "package-name"
//   - "import" = keyword to bring in code
//   - { thing1, thing2 } = named imports (specific things from package)
//   - "from" = keyword
//   - "package-name" = where to get it from
//
//   import Something from "./local-file"
//   - Something = default import (the main export from that file)
//   - "./local-file" = relative path (same folder or subfolder)
//
//   import { Something } from "@/lib/db/repo"
//   - "@/lib/db/repo" = path alias (configured in tsconfig.json)
//   - "@/" maps to "./src/" folder
//   - This is cleaner than "../../../lib/db/repo"

// React hooks - functions that let components "remember" things and react to changes
// WHY: useState = remember data that can change (like entries list)
//      useEffect = do something when component loads or data changes
import { useEffect, useState } from "react";

// Next.js Link component - for navigation between pages
// WHY: Better than <a> tags because:
//      - Pre-loads pages in background (faster)
//      - Doesn't reload entire page (smoother)
//      - Works with Next.js routing
import Link from "next/link";

// Database functions - to fetch journal entries
// WHY: We put all database code in one file (repo.ts) so we don't repeat code
//      This is called "separation of concerns" - database logic separate from UI
import { getRecentEntries } from "@/lib/db/repo";

// Type definitions - TypeScript types for our data
// WHY: TypeScript needs to know what shape our data has
//      This prevents bugs (like trying to access entry.nonexistentField)
//      Also gives us autocomplete in our code editor
import type { Entry } from "@/lib/db/schema";

// ----------------------------------------------------------------------------
// STEP 3: TYPE DEFINITIONS (TypeScript)
// ----------------------------------------------------------------------------
// WHY: TypeScript lets us define what data looks like BEFORE we use it
//      This catches errors before code runs (like trying to use entry.title
//      when Entry doesn't have a title field)
//
// SYNTAX:
//   type Name = { field: type; optionalField?: type }
//   - "type" = keyword to create a type definition
//   - Name = name of the type (capitalized by convention)
//   - { } = object shape
//   - field: type = required field
//   - optionalField?: type = optional field (the ? makes it optional)
//
// ALTERNATIVE: You could use "interface" instead of "type"
//   interface Stats { totalEntries: number; }
//   They're mostly the same, but "type" is more flexible for unions
//
// WHY THIS TYPE: We want to show stats on the homepage, so we define what
//                stats we'll display (total entries, word count, etc.)
type HomeStats = {
  totalEntries: number;      // Required: number of entries
  wordsThisWeek: number;     // Required: word count for this week
  currentStreak: number;     // Required: days in a row journaling
  lastEntryDate: string | null; // Optional: date of most recent entry (or null if none)
};

// ----------------------------------------------------------------------------
// STEP 4: THE COMPONENT FUNCTION
// ----------------------------------------------------------------------------
// WHY: In React, everything is a component (a reusable piece of UI)
//      Components are just functions that return JSX (HTML-like code)
//
// SYNTAX:
//   export default function ComponentName() { return <div>...</div>; }
//   - "export default" = makes this the main thing this file exports
//                        (Next.js looks for "default export" for pages)
//   - "function" = keyword to create a function
//   - ComponentName = name (must start with capital letter - React convention)
//   - () = function parameters (none in this case)
//   - { } = function body
//   - return = what the component renders
//
// ALTERNATIVE: You could use arrow function syntax:
//   const HomePage = () => { return <div>...</div>; }
//   export default HomePage;
//   Both work the same, but "export default function" is more common for pages
export default function HomePage() {
  // --------------------------------------------------------------------------
  // STEP 5: STATE MANAGEMENT (useState hook)
  // --------------------------------------------------------------------------
  // WHY: Components need to "remember" data that can change
  //      When data changes, React automatically re-renders the component
  //      (shows the new data on screen)
  //
  // SYNTAX:
  //   const [variableName, setVariableName] = useState(initialValue);
  //   - "const" = constant (can't reassign, but can modify contents)
  //   - [ ] = array destructuring (gets two things from useState)
  //   - variableName = the current value
  //   - setVariableName = function to update the value
  //   - useState(initialValue) = React hook that creates state
  //
  // HOW IT WORKS:
  //   1. First render: entries = [] (empty array)
  //   2. We call setEntries([...]) with new data
  //   3. React sees state changed, re-renders component
  //   4. Component shows new data
  //
  // TYPE ANNOTATION:
  //   useState<Entry[]>([])
  //   - <Entry[]> = TypeScript generic (tells TypeScript what type is in array)
  //   - Entry[] = array of Entry objects
  //   - [] = initial value (empty array)
  //
  // WHY EMPTY ARRAY INITIALLY: We don't have data yet, so start with empty
  //                            We'll fetch data in useEffect (next step)
  //
  // ALTERNATIVE: You could use a state management library like Zustand for
  //              global state (shared across components), but for component-
  //              local state, useState is perfect and simpler.
  const [entries, setEntries] = useState<Entry[]>([]);
  
  // Loading state - tracks if we're currently fetching data
  // WHY: We want to show "Loading..." while fetching, then show data when done
  //      This prevents showing empty page while data loads
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // SYNTAX: <boolean> = TypeScript type (true or false)
  //         true = initial value (we start in loading state)
  
  // Stats state - stores calculated statistics
  // WHY: We calculate stats from entries, so we store them in state
  //      When entries change, we'll recalculate stats
  const [stats, setStats] = useState<HomeStats>({
    totalEntries: 0,
    wordsThisWeek: 0,
    currentStreak: 0,
    lastEntryDate: null,
  });
  // SYNTAX: { } = object literal (creates an object)
  //         field: value = sets initial values for each field

  // --------------------------------------------------------------------------
  // STEP 6: SIDE EFFECTS (useEffect hook)
  // --------------------------------------------------------------------------
  // WHY: We need to fetch data when component first loads
  //      useEffect runs code AFTER component renders to screen
  //
  // SYNTAX:
  //   useEffect(() => { code }, [dependencies])
  //   - useEffect = React hook for side effects
  //   - () => { } = arrow function (the code to run)
  //   - [dependencies] = array of things to watch
  //                    If any dependency changes, run the code again
  //                    Empty [] = only run once (when component mounts)
  //
  // HOW IT WORKS:
  //   1. Component renders first time (shows loading state)
  //   2. useEffect runs (fetches data)
  //   3. Data arrives, we call setEntries() and setIsLoading(false)
  //   4. Component re-renders (shows data)
  //
  // WHY ASYNC FUNCTION INSIDE: We need to use "await" for async operations
  //                            (fetching from database is async - takes time)
  //                            But useEffect callback can't be async directly,
  //                            so we create async function inside and call it
  //
  // ALTERNATIVE: You could use .then() instead of async/await:
  //   useEffect(() => {
  //     getRecentEntries(5).then((data) => setEntries(data));
  //   }, []);
  //   But async/await is cleaner and easier to read
  useEffect(() => {
    // Create async function to fetch data
    // WHY: We need "async" keyword to use "await" inside
    async function loadData() {
      try {
        // Set loading to true (in case we're re-fetching)
        setIsLoading(true);
        
        // Fetch recent entries from database
        // WHY: getRecentEntries is async (returns Promise), so we "await" it
        //      This pauses execution until data arrives
        // SYNTAX: await = keyword that waits for Promise to resolve
        //         const variableName = await asyncFunction();
        const recentEntries = await getRecentEntries(5);
        // WHY 5: We only want to show 5 most recent entries on homepage
        //        (not all entries - that would be too much)
        
        // Update state with fetched data
        // WHY: setEntries() tells React "data changed, re-render component"
        //      React then updates the screen to show new data
        setEntries(recentEntries);
        
        // Calculate statistics from entries
        // WHY: We want to show stats (total entries, word count, etc.)
        //      We calculate them from the entries we fetched
        const calculatedStats = calculateStats(recentEntries);
        setStats(calculatedStats);
        
        // Stop showing loading state
        setIsLoading(false);
        
      } catch (error) {
        // Error handling
        // WHY: Things can go wrong (database error, network issue, etc.)
        //      We catch errors so app doesn't crash
        // SYNTAX: catch (error) = catches any errors from try block
        console.error("Failed to load entries:", error);
        // WHY console.error: Shows error in browser console for debugging
        
        // Still stop loading (even if error occurred)
        setIsLoading(false);
      }
    }
    
    // Call the async function
    // WHY: We defined the function, now we need to actually run it
    loadData();
    
    // Empty dependency array = only run once when component mounts
    // WHY: We only want to fetch data once when page loads
    //      If we put [entries] here, it would fetch every time entries change
    //      (which would cause infinite loop!)
  }, []); // Empty array = run once on mount

  // --------------------------------------------------------------------------
  // STEP 7: HELPER FUNCTIONS
  // --------------------------------------------------------------------------
  // WHY: We break complex logic into smaller functions
  //      Makes code easier to read, test, and reuse
  //
  // SYNTAX:
  //   function functionName(param: type): returnType { return value; }
  //   - "function" = keyword (or use arrow function: const fn = () => {})
  //   - functionName = name (camelCase by convention)
  //   - (param: type) = parameters with TypeScript types
  //   - : returnType = what the function returns (TypeScript)
  //   - { } = function body
  //   - return = what to give back
  //
  // WHY INSIDE COMPONENT: This function uses component state, so it needs
  //                       to be inside component (has access to entries, stats)
  //
  // ALTERNATIVE: Could move to separate file (utils.ts) if used elsewhere
  function calculateStats(entries: Entry[]): HomeStats {
    // Count total entries
    // WHY: Simple count - just get array length
    const totalEntries = entries.length;
    
    // Calculate words this week
    // WHY: We want to show how much user wrote this week
    //      This is motivating (shows progress)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    // SYNTAX: new Date() = creates current date/time
    //         setDate() = changes the date
    //         getDate() - 7 = subtracts 7 days
    
    const weekEntries = entries.filter((entry) => {
      // Filter entries from last 7 days
      // WHY: filter() creates new array with only items that pass test
      // SYNTAX: array.filter((item) => condition)
      //         condition must be true/false
      const entryDate = new Date(entry.date);
      return entryDate >= oneWeekAgo;
    });
    
    // Count words in week entries
    // WHY: We want total word count, not just entry count
    // SYNTAX: reduce() = combines all items into one value
    //         (sum, entry) => sum + value = adds up all values
    //         0 = starting value (initial sum)
    const wordsThisWeek = weekEntries.reduce((sum, entry) => {
      // Strip HTML tags and count words
      // WHY: Entry content is HTML (from rich text editor)
      //      We need plain text to count words
      //      This is a simplified version - you'd use a proper HTML stripper
      const text = entry.content.replace(/<[^>]*>/g, ""); // Remove HTML tags
      const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
      return sum + words.length;
    }, 0);
    
    // Calculate streak (simplified - you'd check consecutive days)
    // WHY: Streaks are motivating (shows consistency)
    //      This is a simplified version - real streak needs to check consecutive days
    const currentStreak = entries.length > 0 ? 1 : 0; // Placeholder
    
    // Get most recent entry date
    // WHY: Show when user last journaled
    const lastEntryDate = entries.length > 0 ? entries[0].date : null;
    // WHY entries[0]: Entries are sorted newest first, so first one is most recent
    
    // Return stats object
    // WHY: Function needs to return the calculated stats
    return {
      totalEntries,
      wordsThisWeek,
      currentStreak,
      lastEntryDate,
    };
  }

  // --------------------------------------------------------------------------
  // STEP 8: RENDER (JSX)
  // --------------------------------------------------------------------------
  // WHY: JSX lets us write HTML-like code in JavaScript
  //      React converts JSX into real HTML for the browser
  //
  // SYNTAX:
  //   return ( <div>content</div> );
  //   - return = what component displays
  //   - ( ) = parentheses allow multi-line JSX
  //   - <div> = HTML element (div = container)
  //   - </div> = closing tag (must close all tags)
  //
  // JSX RULES:
  //   1. Must return single element (or fragment: <>...</>)
  //   2. Use className instead of class (class is reserved word in JS)
  //   3. Use camelCase for attributes (onClick, not onclick)
  //   4. Use {} to insert JavaScript expressions
  //
  // ALTERNATIVE: You could use React.createElement() instead of JSX:
  //   return React.createElement("div", { className: "..." }, "content");
  //   But JSX is much easier to read and write
  return (
    // Main container div
    // WHY: We need a wrapper element (React rule - single root element)
    //      This div contains all our page content
    //
    // TAILWIND CLASSES EXPLAINED:
    //   min-h-screen = minimum height 100vh (full viewport height)
    //   bg-gradient-to-br = gradient background (to bottom-right)
    //   from-blue-50 = start color (light blue)
    //   to-purple-50 = end color (light purple)
    //   p-6 = padding 1.5rem (24px) on all sides
    //   md:p-8 = padding 2rem (32px) on medium screens and up
    //
    // WHY TAILWIND: Instead of writing CSS files, we use utility classes
    //               Faster development, consistent spacing, responsive by default
    //
    // ALTERNATIVE: You could write custom CSS:
    //   <div className="home-container"> (then define .home-container in CSS file)
    //   But Tailwind is faster and more consistent
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 md:p-8">
      {/* Header Section */}
      {/* WHY: Comments in JSX use {/* */} syntax (not //) */}
      <header className="mb-8">
        {/* WHY mb-8: margin-bottom 2rem (32px) - space below header */}
        
        {/* App Title */}
        {/* WHY h1: Semantic HTML - main heading (good for accessibility) */}
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {/* WHY text-4xl: Large text (2.25rem / 36px) */}
          {/* WHY font-bold: Makes text bold (font-weight: 700) */}
          {/* WHY text-gray-800: Dark gray color */}
          {/* WHY mb-2: Small margin below (0.5rem / 8px) */}
          Welcome to TalkBook
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-600">
          {/* WHY text-gray-600: Medium gray (softer than title) */}
          Your personal journaling companion
        </p>
      </header>

      {/* Loading State */}
      {/* WHY: Show loading message while fetching data */}
      {/* SYNTAX: {condition && <element>} = conditional rendering */}
      {/*         If condition is true, show element. If false, show nothing */}
      {/*         This is React's way of showing/hiding things */}
      {isLoading && (
        <div className="text-center py-12">
          {/* WHY text-center: Centers text horizontally */}
          {/* WHY py-12: Padding top/bottom 3rem (48px) */}
          <p className="text-gray-500 text-lg">Loading your journal...</p>
        </div>
      )}

      {/* Main Content (only show if not loading) */}
      {/* WHY: Don't show content while loading (prevents flash of empty content) */}
      {/* SYNTAX: !isLoading = "not loading" (inverts the boolean) */}
      {!isLoading && (
        <>
          {/* React Fragment - invisible wrapper */}
          {/* WHY: We need to return single element, but want multiple sections */}
          {/*      Fragment (<>...</>) doesn't create extra DOM element */}
          {/*      Alternative: Could use <div> but fragment is cleaner */}
          
          {/* Quick Actions Section */}
          <section className="mb-8">
            {/* WHY section: Semantic HTML - groups related content */}
            
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              {/* WHY text-2xl: Medium-large text (1.5rem / 24px) */}
              {/* WHY font-semibold: Medium weight (600) - lighter than bold */}
              Quick Actions
            </h2>
            
            {/* Action Cards Grid */}
            {/* WHY: Grid layout for action buttons */}
            {/* TAILWIND GRID: */}
            {/*   grid = display: grid */}
            {/*   grid-cols-2 = 2 columns on mobile */}
            {/*   md:grid-cols-3 = 3 columns on medium screens */}
            {/*   lg:grid-cols-5 = 5 columns on large screens */}
            {/*   gap-4 = space between grid items (1rem / 16px) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Action Card - New Entry */}
              {/* WHY: Link component for navigation (Next.js way) */}
              {/* SYNTAX: <Link href="/path">content</Link> */}
              {/*        href = where to navigate (relative to app folder) */}
              <Link
                href="/journal/new"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-center"
                // WHY bg-white: White background
                // WHY rounded-lg: Rounded corners (0.5rem / 8px)
                // WHY p-4: Padding 1rem (16px)
                // WHY shadow-md: Medium shadow (elevation effect)
                // WHY hover:shadow-lg: Larger shadow on hover (interactive feedback)
                // WHY transition-shadow: Smooth shadow animation
                // WHY text-center: Center text inside
              >
                <div className="text-3xl mb-2">📝</div>
                {/* WHY text-3xl: Large emoji/text (1.875rem / 30px) */}
                {/* WHY mb-2: Space below emoji */}
                <p className="text-sm font-medium text-gray-700">New Entry</p>
                {/* WHY text-sm: Small text (0.875rem / 14px) */}
              </Link>

              {/* More action cards (same pattern) */}
              <Link
                href="/journal"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl mb-2">📖</div>
                <p className="text-sm font-medium text-gray-700">Journal</p>
              </Link>

              <Link
                href="/habits"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm font-medium text-gray-700">Habits</p>
              </Link>

              <Link
                href="/stats"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl mb-2">📊</div>
                <p className="text-sm font-medium text-gray-700">Stats</p>
              </Link>

              <Link
                href="/settings"
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow text-center"
              >
                <div className="text-3xl mb-2">⚙️</div>
                <p className="text-sm font-medium text-gray-700">Settings</p>
              </Link>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Your Stats
            </h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Stat Card */}
              {/* WHY: Show calculated statistics */}
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-gray-600 mb-1">Total Entries</p>
                {/* WHY mb-1: Tiny margin (0.25rem / 4px) */}
                <p className="text-2xl font-bold text-blue-600">
                  {/* WHY: Insert JavaScript value into JSX */}
                  {/* SYNTAX: {variable} = inserts variable value */}
                  {/*         TypeScript ensures stats.totalEntries is a number */}
                  {stats.totalEntries}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-gray-600 mb-1">Words This Week</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.wordsThisWeek}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.currentStreak} days
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-gray-600 mb-1">Last Entry</p>
                <p className="text-lg font-semibold text-gray-700">
                  {/* WHY: Conditional rendering with ternary operator */}
                  {/* SYNTAX: condition ? valueIfTrue : valueIfFalse */}
                  {/*         If lastEntryDate exists, format it. Otherwise show "Never" */}
                  {stats.lastEntryDate
                    ? new Date(stats.lastEntryDate).toLocaleDateString()
                    // WHY toLocaleDateString(): Formats date nicely (e.g., "1/15/2024")
                    : "Never"}
                </p>
              </div>
            </div>
          </section>

          {/* Recent Entries Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Recent Entries
            </h2>
            
            {/* WHY: Conditional rendering - show different content based on data */}
            {/* SYNTAX: entries.length === 0 = check if array is empty */}
            {entries.length === 0 ? (
              // Empty State (no entries yet)
              <div className="bg-white rounded-lg p-8 text-center shadow-md">
                <p className="text-gray-500 text-lg mb-2">
                  No entries yet. Start journaling!
                </p>
                <Link
                  href="/journal/new"
                  className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  // WHY inline-block: Makes link behave like button (can set width/height)
                  // WHY px-4 py-2: Padding horizontal 1rem, vertical 0.5rem
                  // WHY bg-blue-600: Blue background
                  // WHY text-white: White text (contrast)
                  // WHY hover:bg-blue-700: Darker blue on hover
                  // WHY transition-colors: Smooth color change
                >
                  Create Your First Entry
                </Link>
              </div>
            ) : (
              // Entries List
              <div className="space-y-4">
                {/* WHY space-y-4: Adds vertical spacing between children (1rem / 16px) */}
                
                {/* Map over entries array */}
                {/* WHY: We have array of entries, want to show each one */}
                {/* SYNTAX: array.map((item, index) => <element key={index} />) */}
                {/*        map() creates new array by transforming each item */}
                {/*        key prop is required by React (helps React track items) */}
                {/*        We use entry.id as key (unique identifier) */}
                {entries.map((entry) => (
                  // Entry Card
                  <Link
                    key={entry.id}
                    // WHY key: React needs unique key for each item in list
                    //          Helps React efficiently update DOM when list changes
                    //          Should be unique (entry.id is perfect - database ID)
                    href={`/journal/${entry.id}`}
                    // WHY: Template literal (backticks) for string interpolation
                    //      `/journal/${entry.id}` becomes "/journal/1", "/journal/2", etc.
                    className="block bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                    // WHY block: Makes link fill full width (not just text)
                  >
                    {/* Entry Header (date and mood) */}
                    <div className="flex items-center justify-between mb-2">
                      {/* WHY flex: Flexbox layout (horizontal by default) */}
                      {/* WHY items-center: Vertically centers items */}
                      {/* WHY justify-between: Space between items (date on left, mood on right) */}
                      
                      <span className="text-sm text-gray-600">
                        {/* WHY: Format date for display */}
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {/* SYNTAX: toLocaleDateString(locale, options) */}
                        {/*         Formats date as "Monday, January 15, 2024" */}
                      </span>
                      
                      {entry.mood && (
                        // WHY: Conditional rendering - only show if mood exists
                        <span className="text-2xl">{entry.mood}</span>
                        // WHY: Show mood emoji if entry has one
                      )}
                    </div>
                    
                    {/* Entry Preview (truncated content) */}
                    <p className="text-gray-700 line-clamp-2">
                      {/* WHY line-clamp-2: Tailwind utility - limits to 2 lines, adds "..." */}
                      {/*      This prevents long entries from taking too much space */}
                      {/* SYNTAX: We need to strip HTML tags first (entry.content is HTML) */}
                      {entry.content
                        .replace(/<[^>]*>/g, "")
                        // WHY: Remove HTML tags using regex
                        //      /<[^>]*>/g = matches <anything> globally
                        //      .replace() = replaces matches with "" (empty string)
                        .substring(0, 150)}
                      {/* WHY substring(0, 150): Takes first 150 characters */}
                      {/*      Prevents very long previews */}
                      {entry.content.length > 150 ? "..." : ""}
                      {/* WHY: Add "..." if content was truncated */}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}