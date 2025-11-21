"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PinGateProps {
  children: React.ReactNode;
}

export default function PinGate({ children }: PinGateProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if app has password protection enabled
    const appPassword = localStorage.getItem("appPassword");
    const appLocked = localStorage.getItem("appLocked");

    if (!appPassword) {
      // No password set, allow access
      setIsLocked(false);
      setIsLoading(false);
    } else if (appLocked === "true") {
      // Password set and app is locked
      setIsLocked(true);
      setIsLoading(false);
    } else {
      // Password set but app is unlocked
      setIsLocked(false);
      setIsLoading(false);
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const savedPassword = localStorage.getItem("appPassword");
    
    if (password === savedPassword) {
      // Correct password - unlock the app
      localStorage.setItem("appLocked", "false");
      setIsLocked(false);
      setPassword("");
      
      // Replace history entry to prevent back button from returning to lock screen
      window.history.pushState(null, "", window.location.href);
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  // Prevent back button from returning to lock screen
  useEffect(() => {
    if (!isLocked && !isLoading) {
      const preventBackToLock = () => {
        window.history.pushState(null, "", window.location.href);
      };
      
      window.addEventListener("popstate", preventBackToLock);
      
      return () => {
        window.removeEventListener("popstate", preventBackToLock);
      };
    }
  }, [isLocked, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <span className="text-4xl">🔒</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TalkBook</h1>
            <p className="text-gray-600">Enter your password to unlock</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoFocus
                maxLength={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">✕ {error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold"
            >
              Unlock
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Your journal is password protected
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
