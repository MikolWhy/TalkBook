"use client";

import { TopicSuggestion } from "../lib/nlp/prompts";

interface TopicSuggestionsProps {
  suggestions: TopicSuggestion[];
}

export default function TopicSuggestions({ suggestions }: TopicSuggestionsProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        💭 Maybe you want to talk about:
      </h3>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-gray-700 text-sm">Maybe you want to talk about:</span>
        {suggestions.map((suggestion, index) => (
          <span
            key={`${suggestion.word}-${index}`}
            className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
          >
            {suggestion.word}
          </span>
        ))}
        <span className="text-gray-700 text-sm">?</span>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Topics from your last 3 entries.
      </p>
    </div>
  );
}

