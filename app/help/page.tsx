"use client";

import DashboardLayout from "../components/DashboardLayout";

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Help & Support</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to TalkBook</h2>
            <p className="text-gray-700 mb-6">
              TalkBook is your personal journaling companion designed to help you reflect, 
              track habits, and gain insights into your daily life.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Getting Started</h3>
            <p className="text-gray-700 mb-4">
              Start by creating your first journal entry. Click on "Journal" in the sidebar 
              and then "New Entry" to begin writing.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Features</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li><strong>Journal Entries:</strong> Write about your day, thoughts, and experiences</li>
              <li><strong>Habit Tracking:</strong> Track your daily habits and build consistency</li>
              <li><strong>AI Prompts:</strong> Get personalized writing prompts based on your entries</li>
              <li><strong>Statistics:</strong> View insights and trends from your journaling</li>
              <li><strong>Password Protection:</strong> Keep your entries secure with a password</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Settings</h3>
            <p className="text-gray-700 mb-4">
              Customize your experience in the Settings page. You can:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Set up password protection</li>
              <li>Manage blacklisted words for prompt extraction</li>
              <li>Create custom prompt templates</li>
              <li>Adjust AI prompt settings</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Need More Help?</h3>
            <p className="text-gray-700">
              More detailed documentation and tutorials will be available here soon. 
              Check back for updates!
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

