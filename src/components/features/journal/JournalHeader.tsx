"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Settings, PenTool } from "lucide-react";

interface Journal {
    id: string;
    name: string;
}

interface JournalHeaderProps {
    journals: Journal[];
    activeJournalId: string;
    onSetActiveJournal: (id: string) => void;
    onManageJournals: () => void;
}

export default function JournalHeader({
    journals,
    activeJournalId,
    onSetActiveJournal,
    onManageJournals,
}: JournalHeaderProps) {
    const [isJournalDropdownOpen, setIsJournalDropdownOpen] = useState(false);
    const journalDropdownRef = useRef<HTMLDivElement>(null);

    // Click-outside detection for journal dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (journalDropdownRef.current && !journalDropdownRef.current.contains(event.target as Node)) {
                setIsJournalDropdownOpen(false);
            }
        };

        if (isJournalDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isJournalDropdownOpen]);

    const activeJournal = journals.find(j => j.id === activeJournalId) || { name: "Journal-1" };

    return (
        <div className="flex items-center justify-between mb-6">
            {/* Journal Selector Dropdown */}
            <div className="relative" ref={journalDropdownRef}>
                <button
                    onClick={() => setIsJournalDropdownOpen(!isJournalDropdownOpen)}
                    className="flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                >
                    {activeJournal.name}
                    <span className="text-lg">
                        {isJournalDropdownOpen ? "▲" : "▼"}
                    </span>
                </button>

                {isJournalDropdownOpen && (
                    <div className="absolute z-20 mt-2 w-64 border-2 border-gray-100 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] overflow-hidden" style={{ backgroundColor: "var(--background, #ffffff)" }}>
                        <div className="max-h-60 overflow-y-auto">
                            {journals.map((journal) => (
                                <button
                                    key={journal.id}
                                    onClick={() => {
                                        onSetActiveJournal(journal.id);
                                        setIsJournalDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${activeJournalId === journal.id
                                        ? "bg-blue-50 font-semibold text-gray-900"
                                        : "text-gray-700"
                                        }`}
                                >
                                    {journal.name}
                                </button>
                            ))}
                        </div>
                        <div className="border-t-2 border-gray-100">
                            <button
                                onClick={() => {
                                    onManageJournals();
                                    setIsJournalDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 text-left text-blue-600 hover:bg-blue-50 font-medium transition-colors flex items-center gap-2"
                            >
                                <Settings className="w-4 h-4" />
                                Manage Journals
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Entry Button */}
            <Link
                href="/journal/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
                <PenTool className="w-4 h-4" />
                new entry
            </Link>
        </div>
    );
}
