"use client";

import { useEffect } from "react";

// Background color options with readable black text
export const BACKGROUND_COLORS = {
  white: {
    name: "White",
    value: "#ffffff",
  },
  orange: {
    name: "Soft Orange",
    value: "#fff4e6", // Very light orange, readable with black text
  },
  pink: {
    name: "Soft Pink",
    value: "#fef2f2", // Very light pink, readable with black text
  },
  green: {
    name: "Soft Green",
    value: "#f0fdf4", // Very light green, readable with black text
  },
  blue: {
    name: "Soft Blue",
    value: "#eff6ff", // Very light blue, readable with black text
  },
} as const;

export type BackgroundColorKey = keyof typeof BACKGROUND_COLORS;

/**
 * BackgroundColorProvider - Applies the selected background color globally
 * 
 * This component reads the background color preference from localStorage
 * and applies it to the document body via CSS variables.
 */
export default function BackgroundColorProvider() {
  useEffect(() => {
    // Get the selected background color from localStorage
    const savedColor = localStorage.getItem("appBackgroundColor") as BackgroundColorKey | null;
    
    // Default to white if no preference is saved
    const colorKey = savedColor && savedColor in BACKGROUND_COLORS 
      ? savedColor 
      : "white";
    
    const selectedColor = BACKGROUND_COLORS[colorKey];
    
    // Apply the background color to the document
    document.documentElement.style.setProperty("--background", selectedColor.value);
    
    // Also update the body background directly for immediate effect
    document.body.style.backgroundColor = selectedColor.value;
  }, []);

  // Listen for changes to background color preference
  useEffect(() => {
    const handleStorageChange = () => {
      const savedColor = localStorage.getItem("appBackgroundColor") as BackgroundColorKey | null;
      const colorKey = savedColor && savedColor in BACKGROUND_COLORS 
        ? savedColor 
        : "white";
      const selectedColor = BACKGROUND_COLORS[colorKey];
      
      document.documentElement.style.setProperty("--background", selectedColor.value);
      document.body.style.backgroundColor = selectedColor.value;
    };

    // Listen for storage events (when localStorage changes in another tab/window)
    window.addEventListener("storage", handleStorageChange);
    
    // Listen for custom event (when localStorage changes in same tab)
    window.addEventListener("background-color-changed", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("background-color-changed", handleStorageChange);
    };
  }, []);

  return null; // This component doesn't render anything
}






