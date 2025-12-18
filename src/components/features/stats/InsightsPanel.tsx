"use client";

/**
 * Insights Panel Component
 * 
 * Displays AI-generated insights about mood patterns and writing habits.
 * Provides encouraging, actionable feedback for mental health journaling.
 * 
 * Features:
 * - Mood trend analysis (positive/neutral/suggestion types)
 * - Writing consistency insights
 * - Color-coded cards based on insight type
 * - Automatically limits to top 4 most relevant insights
 * 
 * @module src/components/features/stats/InsightsPanel.tsx
 */

import { useMemo } from "react";
import { Lightbulb, TrendingUp, Heart, Target } from "lucide-react";
import {
    generateMoodInsights,
    generateWritingInsights,
    generateMoodActivityCorrelation,
    generateComparativeMetrics,
    type Insight
} from "@/lib/analytics/insights";

interface InsightsPanelProps {
    entries: any[];
    timeRange: number;
}

export default function InsightsPanel({ entries, timeRange }: InsightsPanelProps) {
    const insights = useMemo(() => {
        const moodInsights = generateMoodInsights(entries, timeRange);
        const writingInsights = generateWritingInsights(entries, timeRange);
        const correlationInsights = generateMoodActivityCorrelation(entries);
        const comparativeInsights = generateComparativeMetrics(entries);

        // Combine all insights and show top 6
        return [...comparativeInsights, ...moodInsights, ...correlationInsights, ...writingInsights].slice(0, 6);
    }, [entries, timeRange]);

    const getIconComponent = (type: Insight["type"]) => {
        switch (type) {
            case "positive":
                return Heart;
            case "suggestion":
                return Target;
            default:
                return TrendingUp;
        }
    };

    const getColorClasses = (type: Insight["type"]) => {
        switch (type) {
            case "positive":
                return "from-green-50 to-emerald-50 border-green-200";
            case "suggestion":
                return "from-blue-50 to-indigo-50 border-blue-200";
            default:
                return "from-purple-50 to-pink-50 border-purple-200";
        }
    };

    if (insights.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg">
                    <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Insights & Patterns</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((insight, index) => {
                    const IconComponent = getIconComponent(insight.type);
                    const colorClasses = getColorClasses(insight.type);

                    return (
                        <div
                            key={index}
                            className={`bg-gradient-to-br ${colorClasses} rounded-xl p-6 shadow-lg border-2`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="text-4xl flex-shrink-0">{insight.icon}</div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900 text-lg mb-2">{insight.title}</h3>
                                    <p className="text-gray-700 text-sm leading-relaxed">{insight.description}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
