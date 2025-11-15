// settings state management - manages user settings
// ai settings, appearance, blacklist, prompt preferences
//
// WHAT WE'RE CREATING:
// - A Zustand store that remembers all user settings
// - Appearance settings: page color, lined paper, weather auto-fill
// - AI settings: AI toggle, prompt count, tone, blacklist
// - Settings are persisted to IndexedDB (loaded on app start)
// - When settings change, all components using them update automatically
//
// OWNERSHIP:
// - Aadil creates store structure and appearance settings first
// - Michael adds AI settings (on separate branch, merge after Aadil)
//
// COORDINATION NOTES:
// - Aadil creates file first with appearance settings
// - Michael creates branch: `git checkout -b michael/ai-settings`
// - Michael adds AI settings, coordinates merge with Aadil
//
// CONTEXT FOR AI ASSISTANTS:
// - This store manages app settings (not journal entries or habits)
// - Settings are persisted to IndexedDB (loaded on app start)
// - Includes: PIN preferences, AI toggle, prompt count, tone, appearance, blacklist
//
// DEVELOPMENT NOTES:
// - Settings are loaded from database on mount (use useEffect in components)
// - Changes are saved to database immediately (don't wait for "save" button)
// - Blacklist is an array of strings (topics/people to exclude from prompts)
// - Appearance settings: pageColor (string), linedPaper (boolean)
//
// COORDINATION NOTES:
// - Aadil creates store structure and appearance settings first
// - Michael adds AI settings (use Git branch, merge after Aadil)
// - Use Git branches to avoid conflicts, coordinate merges
//
// TODO: implement zustand store
//
// STATE:
// Appearance settings (Aadil):
// - pageColor: string - journal page background color (hex code)
// - linedPaper: boolean - whether to show lined paper background
// - weatherAutoFill: boolean - whether to auto-fill weather in entries
//
// AI settings (Michael adds these on separate branch after Aadil creates store):
// - aiEnabled: boolean - whether AI prompts are enabled
// - promptCount: number - number of prompts to show (1-3)
// - tone: "cozy" | "neutral" - prompt tone preference
// - blacklist: string[] - items to exclude from prompts
// - usedPrompts: string[] - prompts used in CURRENT entry being written (temporary, cleared when entry is saved)
//   NOTE: With auto-insert approach, this may not be needed - prompts reset naturally when entry is saved
//
// ACTIONS:
// Aadil:
// - loadSettings(profileId: number): load settings from database
// - updateSetting(key: string, value: any): update single setting and save to database
//
// Michael (adds these on separate branch after Aadil creates store):
// - addToBlacklist(item: string): add item to blacklist
// - removeFromBlacklist(item: string): remove item from blacklist
// - markPromptAsUsed(prompt: string): mark prompt as used for current entry (add to usedPrompts)
// - clearUsedPrompts(): clear used prompts when entry is saved (temporary tracking, not permanent)
//
// SYNTAX:
// import { create } from "zustand";
// import { getSettings, updateSettings } from "@/lib/db/repo";
//
// export const useSettingsStore = create<SettingsState>((set, get) => ({
//   // state
//   loadSettings: async (profileId) => {
//     const settings = await getSettings(profileId);
//     set({ ...settings });
//   },
//   // actions
// }));


// TODO: implement settings store

