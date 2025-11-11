// prompt generation - generates personalized ai prompts based on journal history
// analyzes past entries to create relevant follow-up prompts
//
// WHAT WE'RE CREATING:
// - A function that generates writing prompts to help users continue journaling
// - Prompts are personalized based on what users have written about before
// - Examples: "Tell me more about Sarah", "How did work go?", "What happened yesterday?"
// - Prompts are automatically inserted as headers when new entry page loads
//
// OWNERSHIP:
// - Michael implements this completely
//
// COORDINATION NOTES:
// - Uses entities from repo.ts (Michael adds entity functions)
// - Uses settings from settingsStore.ts (Michael adds AI settings)
// - Called from app/journal/new/page.tsx (Aadil creates page, Michael adds prompt logic)
//
// CONTEXT FOR AI ASSISTANTS:
// - This file generates prompts that help users continue journaling
// - Prompts are personalized based on what users have written about before
// - Uses extracted entities (people, topics) from past entries
// - Respects user's blacklist (topics they don't want prompts about)
// - Supports different tones (cozy, neutral) for prompt style
//
// HOW IT WORKS:
// 1. Fetch entities from recent entries (last 7 days by default)
// 2. Analyze which people/topics appear frequently
// 3. Generate prompts using tone templates
// 4. Filter out blacklisted items
// 5. Return array of prompt strings
//
// DEVELOPMENT NOTES:
// - Prompts should feel natural and conversational
// - Use relative dates ("yesterday", "2 days ago") for better UX
// - Avoid repetitive prompts - track which prompts have been used
// - Consider entry frequency - if user writes daily, prompts can reference recent entries
// - If user writes weekly, prompts should be more general
//
// TONE PACKS:
// - "cozy": warm, friendly, personal prompts (e.g., "How did your conversation with Sarah go?")
// - "neutral": straightforward, factual prompts (e.g., "Tell me more about the project you mentioned")
//
// TODO: implement generatePrompts function
// - Input: count (1-3), tone ("cozy" | "neutral"), blacklist (string[]), profileId
// - Fetch entities from recent entries (use getEntitiesForPrompts from repo.ts)
// - Create tone-specific prompt templates
// - Generate prompts based on most mentioned people/topics
// - Filter out blacklisted items
// - Return array of prompt strings
// - NOTE: Prompts are auto-inserted as headers when new entry page loads. Used prompts are temporary
//   (for current entry only) and reset when entry is saved. If a topic appears in recent entries,
//   it can be suggested again.
//
// TODO: implement getRelativeDate helper
// - Converts date to relative string ("yesterday", "2 days ago", etc.)
// - Used in prompt templates for natural language
//
// SYNTAX:
// export async function generatePrompts(
//   count: number,
//   tone: "cozy" | "neutral",
//   blacklist: string[],
//   profileId: number
// ): Promise<string[]> {
//   // implementation
// }

// TODO: implement generatePrompts function and helpers

