"use client";

/**
 * Word Cloud Component
 * 
 * Visualizes the most frequently used words from journal entries.
 * Uses dynamic font sizing and color coding for visual impact.
 * 
 * Features:
 * - Extracts top 30 words using NLP (stop words filtered)
 * - Dynamic font sizing based on word frequency
 * - Color-coded words for visual variety
 * - Detailed breakdown of top 6 words with counts
 * - Helpful empty state for new users
 * 
 * @module src/components/features/stats/WordCloud.tsx
 */

import { useMemo } from "react";
import { Hash } from "lucide-react";
import { extractTopWords } from "@/lib/analytics/insights";

interface WordCloudProps {
    entries: any[];
}

export default function WordCloud({ entries }: WordCloudProps) {
    const topWords = useMemo(() => extractTopWords(entries, 30), [entries]);

    if (topWords.length === 0) {
        return (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 shadow-xl border-2 border-violet-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-violet-500 p-3 rounded-xl">
                        <Hash className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Most Used Words</h2>
                </div>
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                    <p className="text-center">Write more entries to see your most used words!</p>
                </div>
            </div>
        );
    }

    // Calculate font sizes based on frequency
    const maxCount = topWords[0].count;
    const minCount = topWords[topWords.length - 1].count;

    const getFontSize = (count: number) => {
        if (maxCount === minCount) return 20;
        const normalized = (count - minCount) / (maxCount - minCount);
        return 14 + normalized * 28; // Range from 14px to 42px
    };

    const getColor = (index: number) => {
        const colors = [
            "text-violet-600",
            "text-purple-600",
            "text-indigo-600",
            "text-blue-600",
            "text-cyan-600",
            "text-teal-600",
            "text-green-600",
            "text-emerald-600",
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-8 shadow-xl border-2 border-violet-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-violet-500 p-3 rounded-xl">
                    <Hash className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Most Used Words</h2>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-center min-h-[250px] p-4">
                {topWords.map((item, index) => (
                    <div
                        key={item.word}
                        className={`font-bold ${getColor(index)} hover:scale-110 transition-transform cursor-default`}
                        style={{ fontSize: `${getFontSize(item.count)}px` }}
                        title={`Used ${item.count} times`}
                    >
                        {item.word}
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-violet-200">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {topWords.slice(0, 6).map((item, index) => (
                        <div key={item.word} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                            <span className="font-medium text-gray-700 capitalize">{item.word}</span>
                            <span className="text-violet-600 font-bold">{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
