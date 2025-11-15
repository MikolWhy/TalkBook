# TypeScript & Tailwind CSS Tutorial for React Beginners

## 📚 Part 1: Understanding TypeScript in React

### What is TypeScript?
TypeScript is JavaScript with **types**. Think of types as labels that tell you what kind of data something is.

**JavaScript (no types):**
```javascript
let name = "John";  // Could be anything!
name = 123;  // This works, but might break your code
```

**TypeScript (with types):**
```typescript
let name: string = "John";  // Must be a string
name = 123;  // ❌ Error! TypeScript catches this mistake
```

### Why Use TypeScript?
1. **Catches errors early** - Before you run your code
2. **Better IDE help** - Auto-complete knows what you're working with
3. **Self-documenting** - Types show what data a function expects

---

## 🎯 Part 2: TypeScript Basics for React

### 1. Basic Types

```typescript
// String - text
const greeting: string = "Hello";

// Number - any number (integer or decimal)
const age: number = 25;
const price: number = 19.99;

// Boolean - true or false
const isActive: boolean = true;

// Array - list of items
const names: string[] = ["Alice", "Bob"];  // Array of strings
const numbers: number[] = [1, 2, 3];      // Array of numbers

// Object - key-value pairs
const person: { name: string; age: number } = {
  name: "John",
  age: 30
};
```

### 2. Interfaces (Defining Object Shapes)

Instead of writing `{ name: string; age: number }` everywhere, create an interface:

```typescript
// Define the shape once
interface Person {
  name: string;
  age: number;
  email?: string;  // ? means optional
}

// Use it everywhere
const user: Person = {
  name: "John",
  age: 30
  // email is optional, so we can skip it
};
```

**Key Points:**
- `interface` = blueprint for an object
- `?` = optional property (can be missing)
- Reusable across your codebase

### 3. React Component Types

**Function Component:**
```typescript
// Component that takes props
interface ButtonProps {
  text: string;
  onClick: () => void;  // Function that returns nothing
}

function Button({ text, onClick }: ButtonProps) {
  return <button onClick={onClick}>{text}</button>;
}
```

**Breaking it down:**
- `ButtonProps` = interface defining what props this component needs
- `{ text, onClick }` = destructuring (extracting from props object)
- `: ButtonProps` = TypeScript type annotation

### 4. useState Hook with TypeScript

```typescript
import { useState } from "react";

// TypeScript infers the type from initial value
const [count, setCount] = useState(0);  // count is number

// Or explicitly type it
const [name, setName] = useState<string>("");  // name is string
const [items, setItems] = useState<string[]>([]);  // items is string array
```

### 5. useEffect Hook

```typescript
import { useEffect, useState } from "react";

function MyComponent() {
  const [data, setData] = useState<string[]>([]);

  // useEffect runs after component renders
  useEffect(() => {
    // This code runs when component first loads
    fetchData();
  }, []);  // Empty array = run once on mount

  const fetchData = async () => {
    // Fetch data here
  };

  return <div>{/* Your JSX */}</div>;
}
```

**Key Points:**
- `useEffect` = side effect (data fetching, subscriptions, etc.)
- `[]` = dependency array (empty = run once)
- `async` = function that uses promises (like fetching data)

---

## 🎨 Part 3: Understanding Tailwind CSS

### What is Tailwind CSS?
Tailwind is a **utility-first** CSS framework. Instead of writing custom CSS, you use pre-made classes.

**Traditional CSS:**
```css
.my-button {
  background-color: blue;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
}
```

**Tailwind CSS:**
```html
<button className="bg-blue-500 text-white px-6 py-3 rounded-lg">
  Click me
</button>
```

### Tailwind Class Structure

**Format:** `property-size-value`

Examples:
- `bg-blue-500` = background color blue, shade 500
- `text-white` = text color white
- `px-6` = padding horizontal (left/right) 6 units
- `py-3` = padding vertical (top/bottom) 3 units
- `rounded-lg` = border radius large

### Common Tailwind Classes

#### Colors
```typescript
// Background colors
bg-blue-500    // Blue background
bg-gray-100    // Light gray background
bg-white       // White background

// Text colors
text-gray-800  // Dark gray text
text-blue-600  // Blue text
text-white     // White text
```

#### Spacing
```typescript
// Padding (inside spacing)
p-4      // padding all sides: 1rem (16px)
px-6     // padding left/right: 1.5rem (24px)
py-3     // padding top/bottom: 0.75rem (12px)
pt-2     // padding top only

// Margin (outside spacing)
m-4      // margin all sides
mx-auto  // margin left/right: auto (centers horizontally)
my-8     // margin top/bottom
mb-4     // margin bottom
```

#### Layout
```typescript
// Flexbox
flex              // display: flex
flex-col          // flex-direction: column
items-center      // align-items: center
justify-between   // justify-content: space-between
gap-4             // gap between items

// Grid
grid              // display: grid
grid-cols-3       // 3 columns
gap-6             // gap between grid items

// Width/Height
w-full            // width: 100%
w-1/2             // width: 50%
h-screen          // height: 100vh (full screen height)
min-h-screen      // minimum height: 100vh
```

#### Typography
```typescript
text-4xl          // font-size: 2.25rem (36px)
text-2xl          // font-size: 1.5rem (24px)
font-bold         // font-weight: 700
font-semibold     // font-weight: 600
text-center       // text-align: center
```

#### Responsive Design
```typescript
// Mobile first - base styles apply to mobile
text-lg           // Base: large text on mobile

// Breakpoints (add prefix for larger screens)
md:text-xl        // Medium screens (768px+): extra large text
lg:text-2xl       // Large screens (1024px+): 2xl text
lg:grid-cols-3    // Large screens: 3 columns

// Common breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
```

#### Effects
```typescript
rounded-lg        // border-radius: 0.5rem
shadow-md         // box-shadow: medium
hover:bg-blue-600 // On hover: darker blue
transition        // Smooth transitions
```

---

## 🏗️ Part 4: Building the Home Page Step-by-Step

### Step 1: Understanding What We're Building

Our home page needs:
1. **Header** - Welcome message
2. **Quick Actions** - Buttons to navigate (New Entry, Journal, Habits, Stats, Settings)
3. **Recent Entries** - Preview of last few journal entries
4. **Summary Stats** - Word count, streak, etc.

### Step 2: Setting Up the Component Structure

```typescript
"use client";  // Required for React hooks in Next.js App Router

export default function HomePage() {
  return (
    <div>
      {/* Content goes here */}
    </div>
  );
}
```

**Why "use client"?**
- Next.js has Server Components (default) and Client Components
- Server Components can't use React hooks (useState, useEffect)
- Since we'll use hooks, we need `"use client"`

### Step 3: Adding Basic Layout with Tailwind

```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 md:p-8">
      {/* min-h-screen = full height
          bg-gradient-to-br = gradient from top-left to bottom-right
          from-blue-50 to-purple-50 = light blue to light purple
          p-6 = padding on mobile, md:p-8 = more padding on medium+ screens */}
      
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Welcome to TalkBook
      </h1>
    </div>
  );
}
```

### Step 4: Adding State (TypeScript + React)

```typescript
import { useState, useEffect } from "react";

export default function HomePage() {
  // State for recent entries
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  // TypeScript: Entry[] means "array of Entry objects"
  
  // State for loading
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // TypeScript: boolean means true or false

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 md:p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Welcome to TalkBook
      </h1>
    </div>
  );
}
```

**Understanding useState:**
- `useState<Entry[]>([])` = state that holds an array of Entry objects, starts empty
- `[recentEntries, setRecentEntries]` = current value + function to update it
- `useState<boolean>(true)` = state that holds true/false, starts as true

### Step 5: Fetching Data with useEffect

```typescript
useEffect(() => {
  // This function runs when component loads
  async function loadData() {
    try {
      setIsLoading(true);
      // TODO: Fetch entries from database
      // const entries = await getRecentEntries();
      // setRecentEntries(entries);
    } catch (error) {
      console.error("Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  }

  loadData();
}, []);  // Empty array = run once on mount
```

**Understanding useEffect:**
- Runs after component renders
- `async function` = can use `await` for promises
- `try/catch` = handles errors gracefully
- `finally` = always runs (even if error)
- `[]` = dependency array (empty = run once)

### Step 6: Creating Quick Action Buttons

```typescript
import Link from "next/link";

// Define the button data structure
interface QuickAction {
  label: string;
  href: string;
  icon: string;  // Emoji for now, can be icon component later
  color: string; // Tailwind color class
}

const quickActions: QuickAction[] = [
  { label: "New Entry", href: "/journal/new", icon: "✍️", color: "bg-blue-500 hover:bg-blue-600" },
  { label: "Journal", href: "/journal", icon: "📝", color: "bg-purple-500 hover:bg-purple-600" },
  { label: "Habits", href: "/habits", icon: "✅", color: "bg-green-500 hover:bg-green-600" },
  { label: "Stats", href: "/stats", icon: "📊", color: "bg-orange-500 hover:bg-orange-600" },
  { label: "Settings", href: "/settings", icon: "⚙️", color: "bg-gray-500 hover:bg-gray-600" },
];
```

**Understanding the code:**
- `interface QuickAction` = defines shape of each action object
- `const quickActions: QuickAction[]` = array of QuickAction objects
- Each action has: label (text), href (link), icon (emoji), color (Tailwind class)

### Step 7: Rendering Quick Actions

```typescript
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
  {/* grid = display: grid
      grid-cols-2 = 2 columns on mobile
      md:grid-cols-3 = 3 columns on medium screens
      lg:grid-cols-5 = 5 columns on large screens
      gap-4 = space between items
      mb-8 = margin bottom */}
  
  {quickActions.map((action) => (
    <Link
      key={action.href}
      href={action.href}
      className={`${action.color} text-white rounded-lg p-4 text-center transition shadow-md hover:shadow-lg`}
    >
      <div className="text-2xl mb-2">{action.icon}</div>
      <div className="font-semibold">{action.label}</div>
    </Link>
  ))}
</div>
```

**Understanding the code:**
- `map()` = loops through array, creates element for each item
- `key={action.href}` = React needs unique key for list items
- `` `${action.color}` `` = template literal (inserts variable)
- `Link` = Next.js component for client-side navigation

### Step 8: Creating Entry Preview Component

```typescript
interface Entry {
  id: number;
  date: string;
  content: string;
  mood?: string;
}

// Helper component to display one entry
function EntryPreview({ entry }: { entry: Entry }) {
  // Truncate content to 100 characters
  const preview = entry.content.length > 100 
    ? entry.content.substring(0, 100) + "..." 
    : entry.content;

  return (
    <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition">
      <div className="text-sm text-gray-500 mb-2">{entry.date}</div>
      <p className="text-gray-800">{preview}</p>
    </div>
  );
}
```

**Understanding the code:**
- `{ entry }: { entry: Entry }` = destructured props with TypeScript type
- `substring(0, 100)` = gets first 100 characters
- Conditional rendering with ternary operator (`? :`)

### Step 9: Rendering Recent Entries Section

```typescript
<section className="mb-8">
  <h2 className="text-2xl font-semibold text-gray-800 mb-4">
    Recent Entries
  </h2>
  
  {isLoading ? (
    <div className="text-gray-500">Loading...</div>
  ) : recentEntries.length === 0 ? (
    <div className="bg-white rounded-lg p-8 text-center text-gray-500">
      <p className="text-lg mb-2">No entries yet</p>
      <p className="text-sm">Start your journaling journey!</p>
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {recentEntries.map((entry) => (
        <EntryPreview key={entry.id} entry={entry} />
      ))}
    </div>
  )}
</section>
```

**Understanding conditional rendering:**
- `isLoading ? ... : ...` = if loading, show "Loading...", else show entries
- `recentEntries.length === 0` = check if array is empty
- Nested ternary = multiple conditions in one expression

---

## 🎓 Part 5: Complete Example (Putting It All Together)

Here's the complete home page with all concepts combined:

```typescript
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Define types/interfaces
interface Entry {
  id: number;
  date: string;
  content: string;
  mood?: string;
}

interface QuickAction {
  label: string;
  href: string;
  icon: string;
  color: string;
}

// Quick actions data
const quickActions: QuickAction[] = [
  { label: "New Entry", href: "/journal/new", icon: "✍️", color: "bg-blue-500 hover:bg-blue-600" },
  { label: "Journal", href: "/journal", icon: "📝", color: "bg-purple-500 hover:bg-purple-600" },
  { label: "Habits", href: "/habits", icon: "✅", color: "bg-green-500 hover:bg-green-600" },
  { label: "Stats", href: "/stats", icon: "📊", color: "bg-orange-500 hover:bg-orange-600" },
  { label: "Settings", href: "/settings", icon: "⚙️", color: "bg-gray-500 hover:bg-gray-600" },
];

// Entry preview component
function EntryPreview({ entry }: { entry: Entry }) {
  const preview = entry.content.length > 100 
    ? entry.content.substring(0, 100) + "..." 
    : entry.content;

  return (
    <Link href={`/journal/${entry.id}`}>
      <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition cursor-pointer">
        <div className="text-sm text-gray-500 mb-2">{entry.date}</div>
        <p className="text-gray-800">{preview}</p>
      </div>
    </Link>
  );
}

// Main component
export default function HomePage() {
  // State
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // TODO: Uncomment when repo.ts is ready
        // const entries = await getRecentEntries(5);
        // setRecentEntries(entries);
        
        // Temporary mock data for development
        setRecentEntries([
          { id: 1, date: "2024-01-15", content: "Today was a great day!" },
          { id: 2, date: "2024-01-14", content: "Worked on the project..." },
        ]);
      } catch (error) {
        console.error("Failed to load entries:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Welcome to TalkBook
        </h1>
        <p className="text-gray-600">
          Your personal journaling companion
        </p>
      </header>

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} text-white rounded-lg p-4 text-center transition shadow-md hover:shadow-lg`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="font-semibold">{action.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Entries */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Recent Entries
        </h2>
        
        {isLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : recentEntries.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500">
            <p className="text-lg mb-2">No entries yet</p>
            <p className="text-sm">Start your journaling journey!</p>
            <Link 
              href="/journal/new"
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Create Your First Entry
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentEntries.map((entry) => (
              <EntryPreview key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

---

## 🎯 Key Takeaways

### TypeScript Concepts:
1. **Types** = Labels for data (`string`, `number`, `boolean`)
2. **Interfaces** = Blueprints for objects
3. **Generics** = `<Entry[]>` means "array of Entry"
4. **Type annotations** = `: Type` after variable names

### Tailwind Concepts:
1. **Utility classes** = Pre-made CSS classes
2. **Responsive** = Mobile-first with breakpoints (`md:`, `lg:`)
3. **Spacing** = `p-4`, `m-4`, `gap-4` for padding/margin/gap
4. **Colors** = `bg-blue-500`, `text-gray-800`

### React Concepts:
1. **useState** = Store data that changes
2. **useEffect** = Run code after render (data fetching)
3. **Components** = Reusable UI pieces
4. **Props** = Data passed to components

---

## 🚀 Next Steps

1. **Practice** - Try modifying colors, spacing, layout
2. **Experiment** - Add new sections, change layouts
3. **Learn** - Read Tailwind docs for more classes
4. **Build** - Apply these concepts to other pages

Remember: **Learning is iterative!** Start simple, add complexity gradually.

