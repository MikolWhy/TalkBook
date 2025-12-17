"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Rocket, FileText, Bot, CheckCircle2, BarChart, Settings, Lock, Lightbulb } from "lucide-react";

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
              Welcome to TalkBook! Your personal journal with smart prompts.
            </p>
            <p>
              TalkBook helps you reflect on your day by extracting names, topics, and dates from your entries
              and generating thoughtful prompts and reminding you about topics for future writing.
            </p>
          </div>
        </div>

        {/* Journal */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Journal
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">Writing Prompts</h3>
              <p>
                When you create a new entry, you'll see personalized writing prompts based on people you've
                mentioned in previous entries. Click a prompt to insert it as a heading.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Topic Suggestions</h3>
              <p>
                Below the prompts, you'll find topic suggestions from your last 3 entries. These are
                non-clickable keywords to spark inspiration.
              </p>
            </div>
          </div>
        </div>

        {/* Name Extraction */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bot className="w-6 h-6" />
            Smart Extraction
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">How It Works</h3>
              <p>
                TalkBook uses natural language processing to automatically extract:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li><strong>Names:</strong> People you mention (e.g., Sarah, Michael)</li>
                <li><strong>Topics:</strong> Important nouns and themes</li>
                <li><strong>Dates:</strong> Time references (e.g., yesterday, next week)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Prompt Expiry</h3>
              <p>
                Unused prompts automatically expire after 7 days. Once you use a prompt (by saving an entry
                with it), it won't appear again.
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
            <p>
              Track daily habits and build streaks. Check off habits each day to maintain your momentum.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="border border-gray-200 rounded-lg p-6 mb-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart className="w-6 h-6" />
            Stats
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>
              View your journaling statistics, including entry count, streaks, mood trends, and more.
            </p>
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
              <h3 className="font-semibold text-lg mb-2">Profile Settings</h3>
              <p>
                Customize your display name and profile picture. Your name will appear in the sidebar
                (max 20 characters).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Password Protection</h3>
              <p>
                Set a password (up to 12 characters) to protect your journal. Once set, use the Lock button
                in the sidebar to lock the app. You'll need to enter your password to unlock it.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                <strong>Note:</strong> Once unlocked, the app stays unlocked until you manually lock it again.
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
              <strong>Your data stays on your device.</strong> All journal entries, extraction, and processing
              happen locally in your browser. Nothing is sent to external servers.
            </p>
            <p>
              Data is stored in your browser's local storage. Clearing your browser data will delete your entries.
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
              <li>Mention people by name to get personalized prompts in future entries</li>
              <li>Write regularly to build a streak and get better prompt suggestions</li>
              <li>Use the mood selector to track your emotional patterns over time</li>
              <li>Tag your entries for easy categorization and searching</li>
              <li>Edit prompt headings after clicking them - they stay marked as used when you save</li>
              <li>If you exit without saving, unused prompts will reappear next time</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
