"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import IOSList, { IOSListItem } from "@/components/ui/IOSList";
import { type JournalEntry } from "@/lib/cache/entriesCache";

// Helpers
const stripHtml = (html: string): string => {
    if (typeof window === "undefined") return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

const formatDate = (dateString: string): string => {
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

const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
};

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

const cardColorOptions: Record<string, { bgClass: string; borderClass: string }> = {
    default: { bgClass: "bg-white", borderClass: "border-gray-200" },
    mint: { bgClass: "bg-emerald-50", borderClass: "border-emerald-200" },
    blue: { bgClass: "bg-blue-50", borderClass: "border-blue-200" },
    pink: { bgClass: "bg-pink-50", borderClass: "border-pink-200" },
    red: { bgClass: "bg-red-50", borderClass: "border-red-200" },
    purple: { bgClass: "bg-purple-50", borderClass: "border-purple-200" },
    orange: { bgClass: "bg-orange-50", borderClass: "border-orange-200" },
    yellow: { bgClass: "bg-amber-50", borderClass: "border-amber-200" },
    rose: { bgClass: "bg-rose-50", borderClass: "border-rose-200" },
    indigo: { bgClass: "bg-indigo-50", borderClass: "border-indigo-200" },
};

interface JournalListSidebarProps {
    entries: JournalEntry[];
    selectedEntryId: string | number | null;
    onSelectEntry: (id: string | number | null) => void;
}

export default function JournalListSidebar({
    entries,
    selectedEntryId,
    onSelectEntry,
}: JournalListSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isFilterDropdownOpen &&
                filterDropdownRef.current &&
                !filterDropdownRef.current.contains(event.target as Node)
            ) {
                setIsFilterDropdownOpen(false);
            }
        };

        if (isFilterDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isFilterDropdownOpen]);

    // Derived state: All Tags
    const allTags = useMemo(() => {
        return Array.from(
            new Set(
                entries.flatMap((entry) => entry.tags || [])
            )
        ).sort();
    }, [entries]);

    // Derived state: Filtered Entries
    const filteredEntries = useMemo(() => {
        return entries.filter((entry) => {
            // Search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const titleMatch = (entry.title || "").toLowerCase().includes(query);
                const contentText = stripHtml(entry.content || "").toLowerCase();
                const contentMatch = contentText.includes(query);
                const tagMatch = (entry.tags || []).some((tag: string) =>
                    tag.toLowerCase().includes(query)
                );

                if (!titleMatch && !contentMatch && !tagMatch) {
                    return false;
                }
            }

            // Tag filter
            if (selectedTagFilter) {
                if (!entry.tags || !entry.tags.includes(selectedTagFilter)) {
                    return false;
                }
            }

            return true;
        });
    }, [entries, searchQuery, selectedTagFilter]);

    // Map to List Items
    const listItems: IOSListItem[] = filteredEntries.map((entry) => {
        const moodEmoji = entry.mood ? moodMap[entry.mood] || "😐" : "😐";
        const contentPreview = truncateText(stripHtml(entry.content || ""));
        const displayTitle = entry.title || formatDate(entry.createdAt);
        const isDraft = entry.draft === true;
        const colorConfig = cardColorOptions[entry.cardColor as string] || cardColorOptions.default;

        return {
            id: entry.id,
            title: displayTitle,
            description: contentPreview || "No content",
            bgColor: colorConfig.bgClass,
            borderColor: colorConfig.borderClass,
            tags: entry.tags && entry.tags.length > 0 ? (
                <>
                    {entry.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                            key={tag}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border shadow-sm ${getTagColor(
                                index
                            )}`}
                        >
                            {tag}
                        </span>
                    ))}
                    {entry.tags.length > 3 && (
                        <span className="text-[11px] text-gray-500 font-medium">+{entry.tags.length - 3} more</span>
                    )}
                </>
            ) : undefined,
            endContent: (
                <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl leading-none transition-transform hover:scale-110">
                        {moodEmoji}
                    </div>
                    {isDraft && (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full border border-amber-200 shadow-sm">
                            DRAFT
                        </span>
                    )}
                </div>
            ),
            onClick: () => {
                onSelectEntry(entry.id);
            },
        };
    });

    return (
        <div className="w-1/3 flex flex-col border-r border-gray-200 pr-4">
            {/* Search and Filter Section */}
            <div className="mb-4 space-y-3">
                {/* Search Input */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search entries..."
                    className="w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                />

                {/* Filter by Tag Dropdown */}
                <div className="relative" ref={filterDropdownRef}>
                    <button
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-between"
                        style={{ backgroundColor: "var(--background, #ffffff)" }}
                    >
                        <span>
                            {selectedTagFilter ? (
                                <span className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(
                                        allTags.indexOf(selectedTagFilter)
                                    )}`}>
                                        {selectedTagFilter}
                                    </span>
                                </span>
                            ) : (
                                <span className="text-gray-400">Filter by tag...</span>
                            )}
                        </span>
                        <span className="text-gray-400">
                            {isFilterDropdownOpen ? "▲" : "▼"}
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {isFilterDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ backgroundColor: "var(--background, #ffffff)" }}>
                            <button
                                onClick={() => {
                                    setSelectedTagFilter(null);
                                    setIsFilterDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors ${selectedTagFilter === null ? "bg-blue-50 font-medium text-gray-900" : "text-gray-400"
                                    }`}
                            >
                                All Entries
                            </button>
                            {allTags.length > 0 ? (
                                allTags.map((tag, index) => (
                                    <button
                                        key={tag}
                                        onClick={() => {
                                            setSelectedTagFilter(tag);
                                            setIsFilterDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors flex items-center gap-2 ${selectedTagFilter === tag ? "bg-blue-50 font-medium" : ""
                                            }`}
                                    >
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTagColor(
                                            index
                                        )}`}>
                                            {tag}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-gray-500 text-sm">
                                    No tags available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Clear filters button */}
                {(searchQuery || selectedTagFilter) && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedTagFilter(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Scrollable iOS-style List */}
            <div className="flex-1 min-h-0" >
                <IOSList
                    items={listItems}
                    onItemClick={(item) => {
                        onSelectEntry(item.id);
                    }}
                    selectedKeys={selectedEntryId ? new Set([String(selectedEntryId)]) : new Set()}
                    emptyMessage={
                        searchQuery || selectedTagFilter
                            ? "No entries match your filters."
                            : "No journal entries yet. Create your first entry!"
                    }
                />
            </div>
        </div>
    );
}
