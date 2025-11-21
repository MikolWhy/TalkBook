"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import { getBlacklist, addToBlacklist, removeFromBlacklist } from "../../src/lib/blacklist/manager";
import { rebuildAllMetadata } from "../../src/lib/cache/rebuildCache";

export default function SettingsPage() {
  const router = useRouter();
  
  // Password settings
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [removePasswordInput, setRemovePasswordInput] = useState("");
  const [removePasswordError, setRemovePasswordError] = useState("");
  
  // Profile settings
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  
  // UI states
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  
  // Blacklist settings
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [blacklistInput, setBlacklistInput] = useState("");
  const [blacklistSuccess, setBlacklistSuccess] = useState("");
  
  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Rebuild cache state
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildMessage, setRebuildMessage] = useState("");

  useEffect(() => {
    // Load existing settings
    const savedPassword = localStorage.getItem("appPassword");
    const savedName = localStorage.getItem("userName");
    const savedPicture = localStorage.getItem("userProfilePicture");
    
    setHasPassword(!!savedPassword);
    setUserName(savedName || "");
    setProfilePicture(savedPicture);
    setBlacklist(getBlacklist());
  }, []);

  const handleSetPassword = () => {
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!password.trim()) {
      setPasswordError("Password cannot be empty");
      return;
    }

    if (password.length > 12) {
      setPasswordError("Password cannot exceed 12 characters");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Save password and immediately lock the app
    localStorage.setItem("appPassword", password);
    localStorage.setItem("appLocked", "true");
    
    // Reload to show lock screen
    window.location.reload();
  };

  const handleRemovePassword = () => {
    setRemovePasswordError("");
    setPasswordSuccess("");
    
    // Verify the password before removing
    const savedPassword = localStorage.getItem("appPassword");
    
    if (!removePasswordInput.trim()) {
      setRemovePasswordError("Please enter your current password");
      return;
    }
    
    if (removePasswordInput !== savedPassword) {
      setRemovePasswordError("Incorrect password");
      setRemovePasswordInput("");
      return;
    }
    
    // Password is correct, remove it
    localStorage.removeItem("appPassword");
    localStorage.removeItem("appLocked");
    setHasPassword(false);
    setRemovePasswordInput("");
    setPasswordSuccess("Password removed successfully!");
  };

  const handleSaveProfile = () => {
    setProfileSuccess("");
    
    // Save name (max 20 characters to fit sidebar)
    const trimmedName = userName.trim().substring(0, 20);
    if (trimmedName) {
      localStorage.setItem("userName", trimmedName);
    } else {
      localStorage.removeItem("userName");
    }

    setProfileSuccess("Profile updated successfully!");
    
    // Force sidebar to re-render
    window.dispatchEvent(new Event('storage'));
  };

  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfilePicture(base64String);
      localStorage.setItem("userProfilePicture", base64String);
      setProfileSuccess("Profile picture updated!");
      window.dispatchEvent(new Event('storage'));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePicture = () => {
    setProfilePicture(null);
    localStorage.removeItem("userProfilePicture");
    setProfileSuccess("Profile picture removed!");
    window.dispatchEvent(new Event('storage'));
  };

  // Blacklist handlers
  const handleAddToBlacklist = () => {
    const word = blacklistInput.trim();
    if (word && !blacklist.includes(word.toLowerCase())) {
      addToBlacklist(word);
      setBlacklist(getBlacklist());
      setBlacklistInput("");
      setBlacklistSuccess(`"${word}" added to blacklist`);
      setTimeout(() => setBlacklistSuccess(""), 3000);
    }
  };

  const handleRemoveFromBlacklist = (word: string) => {
    removeFromBlacklist(word);
    setBlacklist(getBlacklist());
    setBlacklistSuccess(`"${word}" removed from blacklist`);
    setTimeout(() => setBlacklistSuccess(""), 3000);
  };

  // Reset all data
  const handleResetAllData = () => {
    // Clear all localStorage except password and profile settings
    localStorage.removeItem("journalEntries");
    localStorage.removeItem("talkbook-used-prompts");
    localStorage.removeItem("talkbook-blacklist");
    localStorage.removeItem("talkbook-journals");
    localStorage.removeItem("talkbook-active-journal");
    
    // Reinitialize with default journal
    localStorage.setItem("talkbook-journals", JSON.stringify([{
      id: "journal-1",
      name: "Journal-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]));
    localStorage.setItem("talkbook-active-journal", "journal-1");
    
    setBlacklist([]);
    setShowResetConfirm(false);
    alert("All journal data has been reset. Your profile and password settings were preserved.");
    
    // Redirect to journal page
    router.push("/journal");
  };

  const handleRebuildCache = async () => {
    setIsRebuilding(true);
    setRebuildMessage("Rebuilding cache... This may take a moment.");
    
    try {
      const result = await rebuildAllMetadata();
      setRebuildMessage(`✅ Successfully rebuilt cache! Updated ${result.updated} entries.`);
      
      // Reload page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error rebuilding cache:", error);
      setRebuildMessage("❌ Error rebuilding cache. Please try again.");
      setIsRebuilding(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Profile Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
          
          {/* Profile Picture */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img 
                    src={profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl">👤</span>
                )}
              </div>
              <div className="flex gap-2">
                <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition cursor-pointer">
                  Upload Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureUpload}
                    className="hidden"
                  />
                </label>
                {profilePicture && (
                  <button
                    onClick={handleRemovePicture}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Max size: 2MB. Supported: JPG, PNG, GIF</p>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max 20 characters ({userName.length}/20)
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Save Profile
          </button>

          {profileSuccess && (
            <p className="text-green-600 text-sm mt-2">✓ {profileSuccess}</p>
          )}
        </div>

        {/* Password Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Password Protection</h2>
          
          {hasPassword ? (
            <div>
              <p className="text-green-600 mb-4">✓ Password is currently set</p>
              <p className="text-gray-600 mb-4">
                Your app is password protected. Use the Lock button in the sidebar to lock the app.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Current Password to Remove
                </label>
                <input
                  type="password"
                  value={removePasswordInput}
                  onChange={(e) => setRemovePasswordInput(e.target.value)}
                  maxLength={12}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {removePasswordError && (
                <p className="text-red-600 text-sm mb-4">✕ {removePasswordError}</p>
              )}

              <button
                onClick={handleRemovePassword}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Remove Password
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Set a password to protect your journal from unauthorized access.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={12}
                  placeholder="Enter password (max 12 characters)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  maxLength={12}
                  placeholder="Confirm password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {passwordError && (
                <p className="text-red-600 text-sm mb-4">✕ {passwordError}</p>
              )}

              <button
                onClick={handleSetPassword}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Set Password
              </button>
            </div>
          )}

          {passwordSuccess && (
            <p className="text-green-600 text-sm mt-4">✓ {passwordSuccess}</p>
          )}
        </div>

        {/* Blacklist Settings */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Word Blacklist</h2>
          <p className="text-sm text-gray-600 mb-4">
            Words added to the blacklist will not appear in prompts or topic suggestions, even if extracted from your entries.
          </p>

          {/* Add to Blacklist */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Word to Blacklist
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={blacklistInput}
                onChange={(e) => setBlacklistInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleAddToBlacklist();
                  }
                }}
                placeholder="Enter a word..."
                maxLength={30}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
              />
              <button
                onClick={handleAddToBlacklist}
                disabled={!blacklistInput.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Blacklist Display */}
          {blacklist.length > 0 ? (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Blacklisted Words ({blacklist.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {blacklist.map((word) => (
                  <div
                    key={word}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 border-2 border-gray-200 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-900">{word}</span>
                    <button
                      onClick={() => handleRemoveFromBlacklist(word)}
                      className="text-red-600 hover:text-red-700 font-bold text-sm"
                      title="Remove from blacklist"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No blacklisted words yet</p>
          )}

          {blacklistSuccess && (
            <p className="text-green-600 text-sm mt-3">✓ {blacklistSuccess}</p>
          )}
        </div>

        {/* Rebuild Cache */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-blue-900 mb-4">🔄 Rebuild Metadata Cache</h2>
          <p className="text-sm text-blue-700 mb-4">
            If you see non-name words in prompts (like "Today", "Soccer"), click this to re-extract metadata from all entries using the latest logic. 
            This fixes entries saved with old extraction rules.
          </p>
          
          <button
            onClick={handleRebuildCache}
            disabled={isRebuilding}
            className={`px-6 py-2 rounded-lg transition-colors font-semibold ${
              isRebuilding
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isRebuilding ? "Rebuilding..." : "Rebuild Cache"}
          </button>

          {rebuildMessage && (
            <p className="text-sm mt-3 text-blue-900 font-medium">
              {rebuildMessage}
            </p>
          )}
        </div>

        {/* Reset Data */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-900 mb-4">⚠️ Reset All Data</h2>
          <p className="text-sm text-red-700 mb-4">
            This will permanently delete all journal entries, extracted data, prompts, and journals. 
            Your profile settings and password will be preserved.
          </p>
          
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Reset All Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-bold text-red-900">
                Are you absolutely sure? This action cannot be undone!
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetAllData}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Yes, Reset Everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
