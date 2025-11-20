// edit habit page - update existing habit
// similar to new page but pre-fills with existing habit data
//
// WHAT WE'RE CREATING:
// - A page for editing existing habits
// - Pre-fills form with existing habit data (name, type, target, unit, color)
// - Same interface as new habit page but with update/archive actions
// - Handles habit not found (404 error)
//
// OWNERSHIP:
// - Zayn implements this completely
//
// COORDINATION NOTES:
// - Uses repo.ts habit functions (Zayn adds these)
// - No conflicts - Zayn owns this entirely
//
// CONTEXT FOR AI ASSISTANTS:
// - This page allows editing existing habits
// - Pre-fills form with existing habit data
// - Can update all fields (name, type, target, unit, color)
// - Can delete/archive habit from this page
//
// DEVELOPMENT NOTES:
// - Fetch habit by ID from URL params
// - Pre-fill form with existing data
// - Update habit on save
// - Archive habit (soft delete) with confirmation
// - Handle habit not found (404)
//
// TODO: implement habit editing form
//
// FUNCTIONALITY:
// - Load habit by ID from database
// - Pre-fill form with existing data
// - Update habit on save
// - Archive habit with confirmation
// - Navigate back to habits list after save/archive
// - Show 404 if habit not found
//
// UI:
// - Same as new habit page but with pre-filled data
// - Archive/delete button (in addition to save)
//
// SYNTAX:
// "use client";
// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { getHabitById, updateHabit, archiveHabit } from "@/lib/db/repo";
//
// export default function EditHabitPage() {
//   const params = useParams();
//   const habitId = parseInt(params.id as string);
//   // implementation
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getHabitById, updateHabit, archiveHabit } from "@/lib/db/repo";
import { Habit } from "@/lib/db/schema";

// TODO: implement habit editing form

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

export default function EditHabitPage() {
  const router = useRouter();
  const params = useParams();
  const habitId = parseInt(params.id as string);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "boolean" as "boolean" | "numeric",
    target: 1,
    unit: "",
    color: PRESET_COLORS[0],
    frequency: "daily" as "daily" | "weekly" | "monthly" | "one-time",
    weekDays: [1, 2, 3, 4, 5],
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHabit();
  }, [habitId]);

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

  const handleArchive = async () => {
    if (!confirm(`Are you sure you want to archive "${habit?.name}"? This will hide it from your habits list.`)) {
      return;
    }

    try {
      await archiveHabit(habitId);
      router.push("/habits");
    } catch (error) {
      console.error("Failed to archive habit:", error);
      alert("Failed to archive habit. Please try again.");
    }
  };

  const toggleWeekday = (day: number) => {
    setFormData(prev => ({
      ...prev,
      weekDays: prev.weekDays.includes(day)
        ? prev.weekDays.filter(d => d !== day)
        : [...prev.weekDays, day].sort((a, b) => a - b)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50 p-8">
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
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
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
                  Target
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
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="one-time">One time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Week Days - Available for all frequencies */}
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
                  className={`w-10 h-10 rounded-full font-medium transition-all ${
                    formData.weekDays.includes(day.value)
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
                  className={`w-10 h-10 rounded-full transition-all ${
                    formData.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:scale-105"
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
              onClick={handleArchive}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
            >
              Archive
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
    </div>
  );
}
