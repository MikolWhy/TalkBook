// home page - dashboard view
// displays recent journal entries, quick actions, and summary stats
//
// WHAT WE'RE CREATING:
// - The landing page after PIN verification
// - Shows recent journal entries preview
// - Quick action buttons (new entry, journal, habits, stats, settings)
// - Summary statistics (word count, streak, etc.)
//
// OWNERSHIP:
// - Aadil implements this completely
//
// COORDINATION NOTES:
// - Uses repo.ts entry functions (Aadil creates)
// - No conflicts - Aadil owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This is the landing page after PIN verification
// - Shows overview of user's journaling activity
// - Provides quick access to common actions (new entry, view journal, habits, stats)
// - Displays recent entries preview
// - Shows summary statistics (word count, streak, etc.)
//
// DEVELOPMENT NOTES:
// - Fetch recent entries (last 5-10) for preview
// - Show quick action cards/buttons (new entry, journal, habits, stats, settings)
// - Display summary stats (total entries, current streak, words written this week)
// - Make it visually appealing with cards, gradients, icons
// - Responsive design (mobile-friendly)
//
// TODO: implement home dashboard
//
// FUNCTIONALITY:
// - Load recent entries from database
// - Display entry previews (date, mood, truncated content)
// - Quick action buttons (links to other pages)
// - Summary statistics display
// - Loading state while fetching data
//
// UI:
// - Header with app name/logo
// - Quick action cards (gradient backgrounds, icons, hover effects)
// - Recent entries list (cards with preview)
// - Stats summary (word count, streak, etc.)
// - Clean, modern design
//
// SYNTAX:
// "use client";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { getRecentEntries } from "@/lib/db/repo";
//
// export default function HomePage() {
//   const [entries, setEntries] = useState([]);
//   // implementation
// }

"use client";


// TODO: implement home dashboard
