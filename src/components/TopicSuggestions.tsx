"use client";

import { Brain } from "lucide-react";
import { TopicSuggestion } from "../lib/nlp/prompts";

interface TopicSuggestionsProps {
  suggestions: TopicSuggestion[];
}

export default function TopicSuggestions({ suggestions }: TopicSuggestionsProps) {
  // Always show the section, even if empty (will show default topics from prompts.ts)
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 mb-6 shadow-sm" style={{ backgroundColor: "var(--background, #ffffff)" }}>
      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-500" />
        Maybe you want to talk about
      </h3>
      {suggestions.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-2 items-center">
            {suggestions.map((suggestion, index) => (
              <span
                key={`${suggestion.word}-${index}`}
                className="px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 text-gray-800 rounded-lg text-sm font-semibold border-2 border-purple-100"
              >
                {suggestion.word}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Non-name topics from your last 3 entries. These are not clickable - just for inspiration!
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-500 italic">
          Start writing entries to see topic suggestions here!
        </p>
      )}
    </div>
  );
}

