"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

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

  useEffect(() => {
    // Load existing settings
    const savedPassword = localStorage.getItem("appPassword");
    const savedName = localStorage.getItem("userName");
    const savedPicture = localStorage.getItem("userProfilePicture");
    
    setHasPassword(!!savedPassword);
    setUserName(savedName || "");
    setProfilePicture(savedPicture);
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
      </div>
    </DashboardLayout>
  );
}
