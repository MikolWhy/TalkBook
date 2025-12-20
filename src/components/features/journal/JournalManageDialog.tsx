"use client";

import { useState } from "react";
import { type Journal, createJournal, renameJournal, deleteJournal, getJournals, getActiveJournalId } from "@/lib/journals/manager";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

interface JournalManageDialogProps {
    isOpen: boolean;
    onClose: () => void;
    journals: Journal[];
    // Callback when journals are modified so parent can refresh its list
    onJournalsUpdated: () => void;
    activeJournalId: string;
    onSetActiveJournal: (id: string) => void;
}

export default function JournalManageDialog({
    isOpen,
    onClose,
    journals,
    onJournalsUpdated,
    activeJournalId,
    onSetActiveJournal,
}: JournalManageDialogProps) {
    const [newJournalName, setNewJournalName] = useState("");
    const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
    const [editingJournalName, setEditingJournalName] = useState("");

    // Delete confirmation modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [journalToDelete, setJournalToDelete] = useState<{ id: string; name: string } | null>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col" style={{ backgroundColor: "var(--background, #ffffff)" }}>
                <div className="p-6 border-b-2 border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Manage Journals</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Create New Journal */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Create New Journal
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newJournalName}
                                onChange={(e) => setNewJournalName(e.target.value)}
                                placeholder="Journal name..."
                                maxLength={30}
                                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                            />
                            <button
                                onClick={() => {
                                    if (newJournalName.trim()) {
                                        try {
                                            createJournal(newJournalName);
                                            onJournalsUpdated();
                                            setNewJournalName("");
                                        } catch (error: any) {
                                            alert(error.message);
                                        }
                                    }
                                }}
                                disabled={!newJournalName.trim() || journals.length >= 15}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Create
                            </button>
                        </div>
                        {journals.length >= 15 && (
                            <p className="text-xs text-red-500">Maximum of 15 journals reached</p>
                        )}
                    </div>

                    {/* Existing Journals */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            Your Journals ({journals.length}/15)
                        </label>
                        <div className="space-y-2">
                            {journals.map((journal) => (
                                <div
                                    key={journal.id}
                                    className="flex items-center gap-2 p-3 border-2 border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
                                >
                                    {editingJournalId === journal.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editingJournalName}
                                                onChange={(e) => setEditingJournalName(e.target.value)}
                                                maxLength={30}
                                                className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => {
                                                    if (editingJournalName.trim()) {
                                                        renameJournal(journal.id, editingJournalName);
                                                        onJournalsUpdated();
                                                        setEditingJournalId(null);
                                                    }
                                                }}
                                                className="px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => setEditingJournalId(null)}
                                                className="px-2 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                                            >
                                                ✕
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 font-medium text-gray-900">
                                                {journal.name}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditingJournalId(journal.id);
                                                    setEditingJournalName(journal.name);
                                                }}
                                                className="px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium"
                                            >
                                                Rename
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (journals.length > 1) {
                                                        setJournalToDelete({ id: journal.id, name: journal.name });
                                                        setIsDeleteModalOpen(true);
                                                    } else {
                                                        alert("Cannot delete the last journal");
                                                    }
                                                }}
                                                disabled={journals.length === 1}
                                                className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm font-medium disabled:text-gray-300 disabled:cursor-not-allowed"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t-2 border-gray-100">
                    <button
                        onClick={() => {
                            onClose();
                            setEditingJournalId(null);
                        }}
                        className="w-full px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-semibold"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setJournalToDelete(null);
                }}
                onConfirm={() => {
                    if (!journalToDelete) return;
                    
                    try {
                        deleteJournal(journalToDelete.id);
                        onJournalsUpdated();
                        // Update active journal logic should be handled by onJournalsUpdated or parent?
                        // Actually deleteJournal might affect active journal if it was the active one.
                        // Parent should re-fetch active journal.
                        const newActiveId = getActiveJournalId(); // It auto-updates in manager
                        onSetActiveJournal(newActiveId);
                        setIsDeleteModalOpen(false);
                        setJournalToDelete(null);
                    } catch (error: any) {
                        alert(error.message || "Failed to delete journal. Please try again.");
                    }
                }}
                title="Delete Journal?"
                message={`Are you sure you want to delete "${journalToDelete?.name}"? All entries in this journal will be permanently deleted. This cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
            />
        </div>
    );
}
