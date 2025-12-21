"use client";

/**
 * Mood Selector Component
 * 
 * Reusable mood selection interface with emoji buttons and optional labels.
 * Provides a consistent UX for mood tracking across journal entry pages.
 * 
 * @module src/components/ui/MoodSelector.tsx
 */

import { motion } from "framer-motion";

export interface MoodOption {
    id: string;
    emoji: string;
    label: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
    { id: "very-happy", emoji: "😄", label: "Very Happy" },
    { id: "happy", emoji: "😊", label: "Happy" },
    { id: "neutral", emoji: "😐", label: "Neutral" },
    { id: "sad", emoji: "😢", label: "Sad" },
    { id: "very-sad", emoji: "😭", label: "Very Sad" },
    { id: "excited", emoji: "🤩", label: "Excited" },
    { id: "calm", emoji: "😌", label: "Calm" },
    { id: "anxious", emoji: "😰", label: "Anxious" },
    { id: "angry", emoji: "😠", label: "Angry" },
];

interface MoodSelectorProps {
    value: string | null;
    onChange: (mood: string | null) => void;
    showLabels?: boolean;
}

export default function MoodSelector({ value, onChange, showLabels = true }: MoodSelectorProps) {
    return (
        <div className="flex flex-wrap gap-3">
            {MOOD_OPTIONS.map((moodOption) => {
                const isSelected = value === moodOption.id;

                return (
                    <motion.button
                        key={moodOption.id}
                        type="button"
                        onClick={() => onChange(value === moodOption.id ? null : moodOption.id)}
                        className={`flex flex-col items-center justify-center ${showLabels ? 'w-20 h-20' : 'w-16 h-16'
                            } rounded-lg border-2 transition-all ${isSelected
                                ? "border-blue-500 bg-blue-50 shadow-lg scale-105"
                                : "border-gray-300 hover:border-gray-400 hover:shadow-md"
                            }`}
                        style={!isSelected ? { backgroundColor: "var(--background, #ffffff)" } : undefined}
                        title={moodOption.label}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className={showLabels ? "text-3xl" : "text-2xl"}>{moodOption.emoji}</span>
                        {showLabels && (
                            <span className="text-xs text-gray-600 mt-1 font-medium text-center px-1">
                                {moodOption.label}
                            </span>
                        )}
                    </motion.button>
                );
            })}
        </div>
    );
}
