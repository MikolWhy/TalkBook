"use client";

import { useEffect, useState } from "react";
import { getUserStats } from "../../src/lib/gamification/xp";

export default function XPProgressBar() {
  const [stats, setStats] = useState({
    totalXP: 0,
    level: 1,
    currentLevelXP: 0,
    nextLevelXP: 500,
    progress: 0,
  });

  useEffect(() => {
    // Load stats on mount and set up listener
    const loadStats = () => {
      const userStats = getUserStats();
      setStats(userStats);
    };

    loadStats();

    // Listen for XP updates
    const handleXPUpdate = () => {
      loadStats();
    };

    window.addEventListener("xp-updated", handleXPUpdate);

    return () => {
      window.removeEventListener("xp-updated", handleXPUpdate);
    };
  }, []);

  return (
    <div 
      className="rounded-2xl p-6 md:p-8 shadow-xl border-2"
      style={{ 
        backgroundColor: "var(--background, #ffffff)",
        borderColor: "rgba(0, 0, 0, 0.1)"
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <span className="text-3xl">⚡</span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Level {stats.level}</h2>
            <p className="text-sm text-gray-600">
              {stats.currentLevelXP.toLocaleString()} / {stats.nextLevelXP.toLocaleString()} XP
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-600 font-medium">Total XP</p>
          <p className="text-2xl font-bold text-indigo-600">{stats.totalXP.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out flex items-center justify-end pr-3"
            style={{ width: `${Math.min(stats.progress, 100)}%` }}
          >
            {stats.progress > 10 && (
              <span className="text-white text-xs font-bold drop-shadow-md">
                {Math.round(stats.progress)}%
              </span>
            )}
          </div>
        </div>
        {/* Percentage below bar if progress is too small */}
        {stats.progress <= 10 && stats.progress > 0 && (
          <p className="text-xs text-gray-600 mt-1 text-right">{Math.round(stats.progress)}%</p>
        )}
      </div>

      {/* Next Level Info */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium">Next:</span>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-semibold">
            Level {stats.level + 1}
          </span>
        </div>
        <p className="text-gray-600">
          <span className="font-semibold text-indigo-600">
            {(stats.nextLevelXP - stats.currentLevelXP).toLocaleString()} XP
          </span>{" "}
          to go
        </p>
      </div>
    </div>
  );
}

