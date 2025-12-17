"use client";

import { useState, useEffect } from "react";

export default function LockScreen() {
    const [isLocked, setIsLocked] = useState(false);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // Check if app is locked
        const locked = localStorage.getItem("appLocked");
        const hasPassword = localStorage.getItem("appPassword");

        if (locked === "true" && hasPassword) {
            setIsLocked(true);
        }
    }, []);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const savedPassword = localStorage.getItem("appPassword");

        if (password === savedPassword) {
            localStorage.removeItem("appLocked");
            setIsLocked(false);
            setPassword("");
        } else {
            setError("Incorrect password. Please try again.");
            setPassword("");
        }
    };

    if (!isLocked) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex items-center justify-center">
            <div className="rounded-lg shadow-xl p-8 max-w-md w-full mx-4" style={{ backgroundColor: "var(--background, #ffffff)" }}>
                <div className="text-center mb-6">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">App Locked</h2>
                    <p className="text-gray-600">Enter your password to unlock</p>
                </div>

                <form onSubmit={handleUnlock} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            autoFocus
                            maxLength={12}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400 text-center text-lg"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Unlock
                    </button>
                </form>
            </div>
        </div>
    );
}
