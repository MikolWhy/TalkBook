"use client";

/**
 * Edit Habit Page
 * 
 * Description: Facilitates the modification of existing habits, including tracking parameters, 
 * metadata, and archival status.
 * 
 * Flow & Connections:
 * - Routing: Extracts habit ID from URL parameters via `useParams`.
 * - Persistence: Syncs state with `getHabitById`, `updateHabit`, and `archiveHabit` repo functions.
 * - UX: Pre-populates form data based on current habit configuration and handles 404/error states.
 * 
 * @module app/habits/[id]/page.tsx
 */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getHabitById, updateHabit, deleteHabit } from "@/lib/db/repo";
import { Habit } from "@/lib/db/schema";
import ConfirmationModal from "@/components/ui/ConfirmationModal";

// TEMPORARY: Basic page structure to prevent navigation errors
// useParams = gets URL parameters (the [id] from the route)
const PRESET_COLORS = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#F59E0B", // orange
  "#EC4899", // pink
  "#10B981", // green
  "#8B5CF6", // purple
];

const WEEKDAYS = [
  { label: "S", value: 0 }, // Sunday
  { label: "M", value: 1 }, // Monday
  { label: "T", value: 2 }, // Tuesday
  { label: "W", value: 3 }, // Wednesday
  { label: "T", value: 4 }, // Thursday
  { label: "F", value: 5 }, // Friday
  { label: "S", value: 6 }, // Saturday
];

interface HabitFormData {
  name: string;
  type: "boolean" | "numeric";
  target: number;
  unit: string;
  color: string;
  frequency: "daily" | "weekly" | "monthly" | "one-time";
  weekDays: number[];
  description: string;
}

export default function EditHabitPage() {
  const router = useRouter();
  const params = useParams();
  const habitId = parseInt(params.id as string);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState<HabitFormData>({
    name: "",
    type: "boolean",
    target: 1,
    unit: "",
    color: PRESET_COLORS[0],
    frequency: "daily",
    weekDays: [1, 2, 3, 4, 5],
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    loadHabit();
  }, [habitId]);

  // Handle Escape key to go back
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/habits');
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [router]);

  const loadHabit = async () => {
    try {
      const habitData = await getHabitById(habitId);

      if (!habitData) {
        alert("Habit not found");
        router.push("/habits");
        return;
      }

      setHabit(habitData);
      setFormData({
        name: habitData.name,
        type: habitData.type,
        target: habitData.target || 1,
        unit: habitData.unit || "",
        color: habitData.color,
        frequency: habitData.frequency,
        weekDays: habitData.weekDays || [1, 2, 3, 4, 5],
        description: habitData.description || "",
      });
    } catch (error) {
      console.error("Failed to load habit:", error);
      alert("Failed to load habit");
      router.push("/habits");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a habit name");
      return;
    }

    if (formData.type === "numeric" && formData.target < 1) {
      alert("Target must be at least 1");
      return;
    }

    setSaving(true);
    try {
      await updateHabit(habitId, {
        name: formData.name.trim(),
        type: formData.type,
        target: formData.type === "numeric" ? formData.target : undefined,
        unit: formData.type === "numeric" && formData.unit ? formData.unit.trim() : undefined,
        color: formData.color,
        frequency: formData.frequency,
        weekDays: formData.weekDays.length > 0 ? formData.weekDays : undefined,
        description: formData.description.trim() || undefined,
      });

      router.push("/habits");
    } catch (error) {
      console.error("Failed to update habit:", error);
      alert("Failed to update habit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteHabit(habitId);
      router.push("/habits");
    } catch (error) {
      console.error("Failed to delete habit:", error);
      alert("Failed to delete habit. Please try again.");
    }
  };

  const toggleWeekday = (day: number) => {
    setFormData(prev => {
      const allDays = [0, 1, 2, 3, 4, 5, 6];
      const newWeekDays = prev.weekDays.includes(day)
        ? prev.weekDays.filter(d => d !== day)
        : [...prev.weekDays, day].sort((a, b) => a - b);

      // Auto-update frequency based on selected days
      let newFrequency = prev.frequency;
      if (newWeekDays.length === 7) {
        newFrequency = "daily";
      } else if (newWeekDays.length > 0 && newWeekDays.length < 7) {
        // If days are selected but not all, it's weekly
        if (prev.frequency === "daily") {
          newFrequency = "weekly";
        } else if (prev.frequency === "one-time") {
          newFrequency = "weekly";
        }
      } else if (newWeekDays.length === 0) {
        // If no days selected, could be one-time or monthly
        // Keep current frequency unless it was daily/weekly, then set to one-time
        if (prev.frequency === "daily" || prev.frequency === "weekly") {
          newFrequency = "one-time";
        }
      }

      return {
        ...prev,
        weekDays: newWeekDays,
        frequency: newFrequency
      };
    });
  };

  const handleFrequencyChange = (newFrequency: "daily" | "weekly" | "monthly" | "one-time") => {
    setFormData(prev => {
      let newWeekDays = prev.weekDays;

      if (newFrequency === "daily") {
        // Auto-select all days when daily is selected
        newWeekDays = [0, 1, 2, 3, 4, 5, 6];
      } else if (newFrequency === "weekly" && prev.frequency === "daily") {
        // When switching from daily to weekly, unselect one day (keep 6 days)
        newWeekDays = [0, 1, 2, 3, 4, 5]; // Remove Saturday (day 6)
      }

      return {
        ...prev,
        frequency: newFrequency,
        weekDays: newWeekDays
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center" style={{ backgroundColor: "var(--background, #ffffff)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading habit...</p>
        </div>
      </div>
    );
  }

  if (!habit) {
    return null;
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "var(--background, #ffffff)" }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Habit</h1>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg shadow p-6 space-y-6" style={{ backgroundColor: "var(--background, #ffffff)" }}>
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="e.g., Morning Exercise"
              maxLength={100}
            />
          </div>

          {/* Measurement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Measurement
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="numeric"
                  checked={formData.type === "numeric"}
                  onChange={() => setFormData({ ...formData, type: "numeric" })}
                  className="mr-2"
                />
                <span className="text-gray-700">Numeric (count, track progress)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="boolean"
                  checked={formData.type === "boolean"}
                  onChange={() => setFormData({ ...formData, type: "boolean" })}
                  className="mr-2"
                />
                <span className="text-gray-700">Checkbox (done/not done)</span>
              </label>
            </div>
          </div>

          {/* Target & Unit (only for numeric) */}
          {formData.type === "numeric" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit (optional)
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="e.g., pages, reps, km"
                  maxLength={20}
                />
              </div>
            </div>
          )}

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={formData.frequency}
              onChange={(e) => handleFrequencyChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              style={{ backgroundColor: "var(--background, #ffffff)" }}
            >
              <option value="one-time">One time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Week Days - Hidden for one-time frequency */}
          {formData.frequency !== "one-time" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Days
              </label>
              <div className="flex gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={`${day.label}-${day.value}`}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    className={`w-10 h-10 rounded-full font-medium transition-all ${formData.weekDays.includes(day.value)
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {formData.weekDays.length} day{formData.weekDays.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Tag/Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Color
            </label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-full transition-all ${formData.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
                    }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-900"
              rows={3}
              placeholder="Add notes about this habit..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
            >
              Delete
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Habit?"
        message={`Are you sure you want to delete "${habit?.name}"? This will permanently delete the habit and all its logs. This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
