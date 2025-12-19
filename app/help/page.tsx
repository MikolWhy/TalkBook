"use client";

/**
 * Help & Documentation Page
 * 
 * Description: Serves as the primary onboarding and reference hub for end-users, 
 * detailing core features like smart extraction, habits, and privacy disclosures.
 * 
 * Flow & Connections:
 * - Content: Static documentation sections supported by `lucide-react` iconography.
 * - Layout: Wrapped in `DashboardLayout` for consistent navigation.
 * 
 * @module app/help/page.tsx
 */

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Rocket, FileText, Bot, CheckCircle2, BarChart, Settings, Lock, Lightbulb, BookOpen, TrendingUp } from "lucide-react";

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Help & Documentation</h1>

        {/* Getting Started */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Getting Started
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Welcome to TalkBook! This is your personal journal that learns from what you write and helps you keep track of your thoughts, habits, and progress.
            </p>
            <p>
              When you write entries, TalkBook automatically picks up on the people you mention, topics you discuss, and uses that to suggest writing prompts for future entries. Everything runs on your device - nothing gets sent to any servers.
            </p>
          </div>
        </div>

        {/* Journals */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Journals
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Creating and Managing Journals</h3>
              <p>
                You can create multiple journals to organize your entries. Click the journal dropdown at the top of the journal page, then select "Manage Journals" to create new ones, rename them, or delete them.
              </p>
              <p className="mt-2">
                You can have up to 15 journals total. Each journal keeps its own separate entries, but prompts and topic suggestions are shared across all journals since they're based on your overall writing history.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Switching Between Journals</h3>
              <p>
                Use the dropdown menu in the journal header to switch between journals. The active journal is highlighted, and all new entries you create will go into the currently selected journal.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Deleting Journals</h3>
              <p>
                When you delete a journal, all entries in that journal are also deleted. This can't be undone, so make sure you really want to delete it before confirming.
              </p>
            </div>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Writing Entries
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Writing Prompts</h3>
              <p>
                When you create a new entry, you'll see clickable writing prompts at the top. These are generated from people you've mentioned in your previous entries. Click any prompt to insert it as a heading in your entry - you can edit it after inserting if you want.
              </p>
              <p className="mt-2">
                Prompts that come from extracted names (not the default prompts) will expire after 7 days if you don't use them. Once you save an entry with a prompt, that prompt won't show up again. If you delete a prompt from your entry before saving, it'll reappear in the suggestions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Topic Suggestions</h3>
              <p>
                Below the prompts, you'll see topic suggestions from your last 3 entries. These are just keywords to give you ideas - they're not clickable, just there to spark inspiration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Moods and Tags</h3>
              <p>
                You can select a mood for each entry and add tags to help organize them. Moods help track your emotional patterns over time, and tags make it easier to find related entries later.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Drafts</h3>
              <p>
                If you start writing but don't finish, your entry is saved as a draft automatically. You can come back to it later and continue writing. Drafts don't count toward your stats or XP until you save them.
              </p>
            </div>
          </div>
        </div>

        {/* Smart Extraction */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bot className="w-6 h-6" />
            How Smart Extraction Works
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">What Gets Extracted</h3>
              <p>
                TalkBook automatically finds and remembers:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Names:</strong> People you mention in your entries (like Sarah, Michael, Mom)</li>
                <li><strong>Topics:</strong> Important words and themes that come up in your writing</li>
              </ul>
              <p className="mt-2">
                This happens automatically as you write - you don't need to do anything special. The system looks at your last few entries to generate relevant prompts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Prompt Expiry</h3>
              <p>
                Prompts created from extracted names expire after 7 days if you don't use them. This keeps your prompt list fresh and relevant. If someone you mentioned shows up in recent entries again, a new prompt will be created for them.
              </p>
              <p className="mt-2">
                Default prompts (the generic ones like "How are you feeling?") don't expire - they're always available as fallbacks.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Blacklist</h3>
              <p>
                If the system keeps extracting words that aren't actually names (like common words that happen to be capitalized), you can add them to a blacklist in Settings. Blacklisted words won't be used to create prompts.
              </p>
            </div>
          </div>
        </div>

        {/* XP and Levels */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            XP and Levels
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">How XP Works</h3>
              <p>
                You earn experience points (XP) for writing entries and completing habits. As you accumulate XP, you level up. Your current level and XP progress are shown in the sidebar.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Earning XP from Entries</h3>
              <p>
                Every entry you save gives you XP based on:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Base XP:</strong> 25 XP per entry</li>
                <li><strong>Word count:</strong> 1 XP per word you write</li>
                <li><strong>Daily bonus:</strong> 100 bonus XP for your first entry of the day</li>
                <li><strong>Streak multiplier:</strong> Your total XP gets multiplied if you're on a writing streak (1.5x at 7 days, up to 2x at 60 days)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Earning XP from Habits</h3>
              <p>
                Completing habits also gives you XP:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Checkbox habits:</strong> 2 XP each</li>
                <li><strong>Numeric habits:</strong> 1 XP per unit logged</li>
                <li><strong>Bonus XP:</strong> Extra XP for completing 3+ or 5+ habits in a day</li>
                <li><strong>All habits bonus:</strong> 50 bonus XP if you complete all your habits in one day (once per day)</li>
                <li><strong>Habit streak multiplier:</strong> Your habit XP gets multiplied based on your habit streak (2x at 7 days, up to 6x at 90 days)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Leveling Up</h3>
              <p>
                Early levels (1-10) are easier to reach, then it gradually gets harder. The XP needed increases as you level up, so higher levels take more time and effort to achieve.
              </p>
            </div>
          </div>
        </div>

        {/* Habits */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Habits
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Creating Habits</h3>
              <p>
                You can create two types of habits: checkbox habits (simple yes/no) and numeric habits (track a number like "miles run" or "glasses of water"). Each habit can have a color, and you can set a target for numeric habits.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Tracking Habits</h3>
              <p>
                Check off or log your habits each day on the habits page. Your progress is saved automatically. You can uncheck a habit if you made a mistake - just click it again.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Streaks</h3>
              <p>
                Each habit tracks its own streak (consecutive days completed). There's also a global habit streak that counts days where you completed at least one habit. Streaks help you earn more XP through multipliers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">One-Time Habits</h3>
              <p>
                You can mark a habit as "one-time" if it's something you only need to do once (like "Get a passport"). Once you complete it, it'll disappear from your active habits list.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Reordering Habits</h3>
              <p>
                Drag and drop habits to reorder them on the habits page. Your preferred order is saved automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart className="w-6 h-6" />
            Statistics & Insights
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">What's Tracked</h3>
              <p>
                The stats page shows your level, total XP, entry count, writing streaks, habit completions, habit streaks, and more. You can filter by journal and time range (last 7 days, 30 days, 90 days, a year, or all time).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Charts and Graphs</h3>
              <p>
                You'll see visualizations of your journal and habit activity over time, mood trends, mood distribution, and when you typically write (morning, afternoon, evening, or night).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Insights</h3>
              <p>
                The system automatically generates insights based on your patterns, like "Great start!" if you've been writing regularly, or mood trend analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Profile</h3>
              <p>
                Set your display name (up to 20 characters) and upload a profile picture (max 2MB). Your name appears in the sidebar, and the picture shows up in your profile section.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Password Protection</h3>
              <p>
                You can set a password (up to 12 characters) to lock your journal. Once set, use the "Lock App" button in the sidebar to lock it. You'll need to enter your password to unlock it again.
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Once unlocked, the app stays unlocked until you manually lock it again. To remove the password, go to Settings and enter your current password to remove it.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Background Color</h3>
              <p>
                Customize the background color of the entire app. Choose from several preset colors that are designed to keep text readable. Your choice applies everywhere - journal pages, settings, stats, everything.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Blacklist</h3>
              <p>
                If the extraction system keeps picking up words that aren't actually names, you can add them to the blacklist. Blacklisted words won't be used to create prompts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Rebuild Cache</h3>
              <p>
                If you notice prompts or topic suggestions seem off, you can rebuild the extraction cache. This re-extracts names and topics from all your entries. It doesn't delete anything - just refreshes the data used for generating prompts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Reset All Data</h3>
              <p>
                This deletes everything: all entries, journals, habits, XP, and level progress. Your profile (name and picture) and password are kept. This can't be undone, so be careful.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Privacy & Data
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Everything stays on your device.</strong> All your entries, the extraction process, habit tracking, and everything else happens locally in your browser. Nothing is sent to any servers or external services.
            </p>
            <p>
              Your data is stored in your browser's local storage and IndexedDB. If you clear your browser data, you'll lose your entries and settings. If you want to back up your data, you'd need to export it manually (this feature isn't built in yet).
            </p>
            <p>
              Since everything is local, you can use TalkBook completely offline. No internet connection needed once the app is loaded.
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="border border-gray-200 rounded-lg p-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            Tips & Tricks
          </h2>
          <div className="space-y-4 text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Mention people by name in your entries to get personalized prompts about them later</li>
              <li>Write regularly to build streaks - longer streaks give you XP multipliers</li>
              <li>Use the mood selector to track patterns in how you're feeling over time</li>
              <li>Add tags to entries to make them easier to find and organize</li>
              <li>You can edit prompt headings after clicking them - they'll still count as "used" when you save</li>
              <li>If you close the page without saving, your entry is saved as a draft and prompts won't be marked as used</li>
              <li>Complete all your habits in a day for a bonus 50 XP (once per day)</li>
              <li>For longer time ranges in stats, the chart aggregates data by week to keep it readable</li>
              <li>You can have multiple journals to organize different types of entries (work, personal, etc.)</li>
              <li>If a prompt expires but you mention that person again in recent entries, a new prompt will be created</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
