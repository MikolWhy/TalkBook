"use client";

import Link from "next/link";
import { FileText as FileTextIcon } from "lucide-react";
import { type JournalEntry } from "@/lib/cache/entriesCache";
// Actually page.tsx uses 'any' for entries mostly in state 'setEntries(useState<any[]>([]))'
// But I should try to use types if available.
// I'll define a local interface or use 'any' if strictly needed to avoid type errors with existing code.
// I'll use 'any' for 'entry' prop for now to avoid breaking if schema is loose, but typing it is better.
// Checking page.tsx, it uses 'any'.

// Replicating helpers
const moodMap: Record<string, string> = {
    "very-happy": "😄",
    "happy": "😊",
    "neutral": "😐",
    "sad": "😢",
    "very-sad": "😭",
    "excited": "🤩",
    "calm": "😌",
    "anxious": "😰",
    "angry": "😠",
    "grateful": "🙏",
};

const tagColors = [
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-green-100 text-green-800 border-green-300",
    "bg-purple-100 text-purple-800 border-purple-300",
    "bg-pink-100 text-pink-800 border-pink-300",
    "bg-yellow-100 text-yellow-800 border-yellow-300",
    "bg-red-100 text-red-800 border-red-300",
    "bg-indigo-100 text-indigo-800 border-indigo-300",
    "bg-teal-100 text-teal-800 border-teal-300",
    "bg-orange-100 text-orange-800 border-orange-300",
    "bg-cyan-100 text-cyan-800 border-cyan-300",
];

const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
};

const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    const timePart = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    return `${datePart} at ${timePart}`;
};

interface JournalEntryViewProps {
    entry: JournalEntry | null; // using any to match existing usage pattern for now
    onDelete: (id: string) => void;
}

export default function JournalEntryView({ entry, onDelete }: JournalEntryViewProps) {
    return (
        <div className="w-2/3 flex flex-col">
            <div className="flex-1 border-2 border-gray-100 rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-y-auto" style={{ backgroundColor: "var(--background, #ffffff)" }}>
                {entry ? (
                    <div className="space-y-6">
                        <div className="flex items-start justify-between pb-6 border-b-2 border-gray-100 sticky top-0 bg-white z-10">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                                    {entry.title || "Untitled Entry"}
                                </h2>
                                <p className="text-sm text-gray-500 mt-2 font-medium">
                                    {formatDate(entry.createdAt)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                                <span className="text-5xl leading-none" title={entry.mood || "neutral"}>
                                    {entry.mood ? (moodMap[entry.mood] || "😐") : "😐"}
                                </span>
                            </div>
                        </div>
                        {entry.tags && entry.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {entry.tags.map((tag: string, index: number) => (
                                    <span
                                        key={tag}
                                        className={`px-4 py-2 rounded-full text-sm font-semibold border-2 shadow-sm transition-transform hover:scale-105 ${getTagColor(
                                            index
                                        )}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div className="prose max-w-none entry-content">
                            {entry.content ? (
                                <div
                                    className="text-gray-700 text-[15px] leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: entry.content }}
                                />
                            ) : (
                                <p className="text-gray-400 italic text-center py-8">No content</p>
                            )}
                        </div>
                        <div className="pt-6 border-t-2 border-gray-100 flex gap-3">
                            <Link
                                href={`/journal/${entry.id}`}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:scale-95 transition-all font-semibold shadow-sm hover:shadow-md"
                            >
                                Edit Entry
                            </Link>
                            <button
                                onClick={() => onDelete(entry.id)}
                                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 active:scale-95 transition-all font-semibold shadow-sm hover:shadow-md"
                            >
                                Delete Entry
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <FileTextIcon className="w-16 h-16 mb-4 opacity-20 text-gray-400" />
                        <p className="text-gray-400 text-lg font-medium">Select an entry to view</p>
                        <p className="text-gray-300 text-sm mt-2">Choose from the list on the left</p>
                    </div>
                )}
            </div>
        </div>
    );
}
