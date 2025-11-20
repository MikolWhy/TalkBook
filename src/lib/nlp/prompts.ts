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

// Import types
import { extractMetadata } from "./extract";

// Prompt template types
type Tone = "cozy" | "neutral";
type EntityType = "person" | "topic" | "date";

// Interface for extracted metadata
interface ExtractedMetadata {
  people: string[];
  topics: string[];
  dates: Date[];
  sentiment: number;
  originalText?: string; // Optional: original text for context-aware prompts
}

// Interface for a prompt
export interface Prompt {
  id: string; // Unique ID for tracking
  text: string; // The prompt text
  entity?: string; // The entity it's based on (person name, topic, etc.)
  type?: EntityType; // Type of entity
  used: boolean; // Whether this prompt has been used
  createdAt: Date; // When this prompt was generated (for expiry tracking)
}

// Default prompts when no extracted data is available
const DEFAULT_PROMPTS = [
  "How was your day?",
  "What's on your mind?",
  "What are you grateful for today?",
  "What challenged you today?",
  "What made you smile today?",
];

// Helper: Check if a topic should use "your" (possessive context)
// Topics like "project", "work", "meeting" work better with "your"
function shouldUsePossessive(topic: string, originalText?: string): boolean {
  const possessiveTopics = new Set([
    "project", "projects", "work", "meeting", "meetings", "plan", "plans",
    "goal", "goals", "task", "tasks", "assignment", "assignments",
    "part", "parts", "role", "roles", "job", "jobs",
  ]);
  
  const lowerTopic = topic.toLowerCase();
  if (possessiveTopics.has(lowerTopic)) return true;
  
  // Check if original text contains possessive context
  if (originalText) {
    const lowerText = originalText.toLowerCase();
    // Check for patterns like "my project", "our project", "your project"
    const possessivePatterns = [
      new RegExp(`(my|our|your)\\s+${lowerTopic}`, "i"),
      new RegExp(`${lowerTopic}\\s+(of|for)\\s+(mine|ours|yours)`, "i"),
    ];
    
    if (possessivePatterns.some(pattern => pattern.test(lowerText))) {
      return true;
    }
  }
  
  return false;
}

// Helper: Determine topic category for better template selection
function getTopicCategory(topic: string): "work" | "personal" | "activity" | "general" {
  const lowerTopic = topic.toLowerCase();
  
  // Work-related topics
  const workTopics = ["project", "meeting", "work", "task", "assignment", "deadline", "presentation", "report"];
  if (workTopics.some(w => lowerTopic.includes(w))) return "work";
  
  // Activity-related topics
  const activityTopics = ["meeting", "conversation", "discussion", "talk", "call"];
  if (activityTopics.some(a => lowerTopic.includes(a))) return "activity";
  
  // Personal topics
  const personalTopics = ["feeling", "emotion", "mood", "thought", "idea"];
  if (personalTopics.some(p => lowerTopic.includes(p))) return "personal";
  
  return "general";
}

// Prompt templates organized by tone, entity type, and context
// These templates are designed to be natural, conversational, and context-aware
const PROMPT_TEMPLATES = {
  cozy: {
    person: [
      "How did things go with {entity}?",
      "What happened with {entity}?",
      "Tell me more about {entity}.",
      "How's {entity} doing?",
      "What's on your mind about {entity}?",
    ],
    topic: {
      possessive: [ // For topics that work with "your" (project, work, meeting, etc.)
        "How's your {entity} going?",
        "Any updates on your {entity}?",
        "Tell me more about your {entity}.",
        "What's happening with your {entity}?",
        "How did your {entity} go?",
      ],
      work: [ // Work-related topics
        "How's {entity} going?",
        "Any progress on {entity}?",
        "Tell me more about {entity}.",
        "What's the status of {entity}?",
        "How did {entity} go?",
      ],
      activity: [ // Activity-related topics
        "How did {entity} go?",
        "Tell me more about {entity}.",
        "What happened during {entity}?",
        "How was {entity}?",
      ],
      general: [ // General topics
        "Tell me more about {entity}.",
        "How's {entity} going?",
        "What's happening with {entity}?",
        "Any updates on {entity}?",
      ],
    },
    date: [
      "Tell me about {entity}.",
      "What happened on {entity}?",
      "How did {entity} go?",
      "You mentioned {entity}. What happened?",
    ],
  },
  neutral: {
    person: [
      "How did your interaction with {entity} go?",
      "Tell me more about {entity}.",
      "What's new with {entity}?",
      "Any updates on {entity}?",
    ],
    topic: {
      possessive: [
        "Any updates on your {entity}?",
        "How's your {entity} going?",
        "What's the status of your {entity}?",
        "Tell me more about your {entity}.",
      ],
      work: [
        "Any updates on {entity}?",
        "How's {entity} going?",
        "What's the status of {entity}?",
        "Progress on {entity}?",
      ],
      activity: [
        "How did {entity} go?",
        "What happened during {entity}?",
        "Tell me more about {entity}.",
      ],
      general: [
        "Tell me more about {entity}.",
        "Any updates on {entity}?",
        "How's {entity} going?",
      ],
    },
    date: [
      "Tell me about {entity}.",
      "What happened on {entity}?",
      "Any updates on {entity}?",
    ],
  },
};

// Helper: Format date to relative string
function formatDate(date: Date): string {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays === -1) return "yesterday";
  if (diffDays > 0) return `in ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}

// #2: Generate Stable Prompt ID from Text Hash
// WHY: Original approach used template index in ID (e.g., "person-sarah-0"), but template
//      selection uses rotation, so same entity got different template indices on different runs.
//      This caused same prompt text to get different IDs, so used prompts weren't filtered correctly.
// HOW: Hash the prompt text itself using a simple string hash algorithm (djb2-like).
//      Same prompt text = same hash = same ID, regardless of which template was used.
// SYNTAX BREAKDOWN:
//   - function generatePromptId(promptText: string): string
//     - TypeScript function signature: parameter type (string) and return type (string)
//   - let hash = 0 - Initialize hash accumulator (let allows reassignment)
//   - for (let i = 0; i < promptText.length; i++) - Standard for loop iterating string characters
//   - promptText.charCodeAt(i) - JavaScript String method, returns Unicode value of character at index i
//     - Returns number (0-65535) representing the character code
//   - hash << 5 - Bitwise left shift operator, shifts bits 5 positions left (multiplies by 32)
//   - hash & hash - Bitwise AND operator (here used to ensure 32-bit integer, though redundant)
//     - Actually: hash = hash & 0xFFFFFFFF would be more explicit for 32-bit
//   - Math.abs(hash) - JavaScript Math method, returns absolute value (ensures positive number)
//   - .toString(36) - Number method, converts to base-36 string (0-9, a-z)
//     - Base36 is more compact than decimal (e.g., 1000 = "rs" in base36)
//   - Template literal: `prompt-${...}` - String interpolation with backticks
// REFERENCES:
//   - charCodeAt: JavaScript String.prototype.charCodeAt() - MDN Web Docs
//   - Bitwise operators: JavaScript bitwise operators (<<, &) - MDN Web Docs
//   - toString(36): JavaScript Number.prototype.toString(radix) - MDN Web Docs
//   - This is a simplified djb2 hash algorithm (common string hashing approach)
// APPROACH: Synchronous hash function (no async needed) - simple bit manipulation.
//           Base36 encoding makes IDs shorter and URL-safe.
//           This is conventional - text-based hashing for stable IDs.
// CONNECTION: Used when creating Prompt objects in generatePromptsFromMetadata().
//             Ensures markPromptAsUsed() and filterUsedPrompts() work correctly.
function generatePromptId(promptText: string): string {
  // Generate ID from prompt text hash (synchronous fallback for compatibility)
  // This ensures same prompt text always gets same ID
  let hash = 0;
  for (let i = 0; i < promptText.length; i++) {
    const char = promptText.charCodeAt(i); // Get Unicode value of character
    hash = ((hash << 5) - hash) + char; // Bit shift left 5, subtract original, add char code
    // Equivalent to: hash = hash * 31 + char (but bitwise is faster)
    hash = hash & hash; // Convert to 32-bit integer (bitwise AND with itself)
  }
  return `prompt-${Math.abs(hash).toString(36)}`; // Base36 encoding for shorter ID
}

// Helper: Check if a topic makes sense in a template
// Filters out prompts that would create awkward sentences
function isValidPrompt(topic: string, template: string, type: EntityType): boolean {
  const lowerTopic = topic.toLowerCase();
  
  // Skip very short topics
  if (topic.length < 3) return false;
  
  // Skip common words that don't work as topics
  const invalidTopics = new Set([
    "great", "good", "bad", "nice", "fine", "okay", "ok", "well", "better", "best",
    "our", "your", "my", "his", "her", "their", "its",
    "today", "tomorrow", "yesterday", "now", "then", "here", "there",
    "this", "that", "these", "those", "what", "which", "who", "where", "when",
    "and", "or", "but", "so", "if", "with", "for", "of", "in", "on", "at", "to",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  ]);
  
  if (invalidTopics.has(lowerTopic)) return false;
  
  // For topics, check if the template makes grammatical sense
  if (type === "topic") {
    // Templates like "How's {topic} going?" don't work well with adjectives
    // Check if topic sounds like a noun (simple heuristic)
    const testPrompt = template.replace("{entity}", topic);
    
    // Skip if it creates obviously awkward phrases
    const awkwardPatterns = [
      /how's \w+ going\?/i, // "How's great going?" - awkward
      /what's happening with \w+\?/i, // "What's happening with today?" - awkward
    ];
    
    // Only check if template matches these patterns
    if (awkwardPatterns.some(pattern => pattern.test(testPrompt))) {
      // For these templates, prefer noun-like topics (longer, more specific)
      // Skip single-word adjectives/adverbs
      if (topic.length < 5) return false;
    }
  }
  
  return true;
}

// Helper: Select the best template for an entity
// Chooses templates that work best for the entity type, context, and characteristics
function selectBestTemplate(
  entity: string,
  templates: string[] | { possessive?: string[]; work?: string[]; activity?: string[]; general?: string[] },
  type: EntityType,
  sentiment: number = 0,
  index: number = 0,
  originalText?: string
): string {
  // Handle array templates (for people and dates)
  if (Array.isArray(templates)) {
    const rotationIndex = index % templates.length;
    
    // For people, prefer supportive templates if sentiment is negative
    if (type === "person" && sentiment < -0.2) {
      const supportive = templates.find(t => 
        t.includes("How did things go") || t.includes("How's") || t.includes("What happened")
      );
      if (supportive) return supportive;
    }
    
    // Rotate through templates for variety
    return templates[rotationIndex];
  }
  
  // Handle object templates (for topics - context-aware)
  if (type === "topic") {
    const topicCategory = getTopicCategory(entity);
    const usePossessive = shouldUsePossessive(entity, originalText);
    
    // Determine which template set to use
    let templateSet: string[] = templates.general || [];
    
    if (usePossessive && templates.possessive) {
      templateSet = templates.possessive;
    } else if (topicCategory === "work" && templates.work) {
      templateSet = templates.work;
    } else if (topicCategory === "activity" && templates.activity) {
      templateSet = templates.activity;
    } else if (templates.general) {
      templateSet = templates.general;
    }
    
    // Select template with rotation
    const rotationIndex = index % templateSet.length;
    return templateSet[rotationIndex];
  }
  
  // Fallback
  return Array.isArray(templates) ? templates[0] : templates.general?.[0] || "";
}

// Helper: Get prompts from extracted metadata
function generatePromptsFromMetadata(
  metadata: ExtractedMetadata,
  tone: Tone,
  count: number
): Prompt[] {
  const prompts: Prompt[] = [];
  const templates = PROMPT_TEMPLATES[tone];
  
  // #3: Ensure Mix of People and Topic Prompts (Not Just People)
  // WHY: Original logic prioritized people first and filled all slots with people if available.
  //      This meant if there were 5+ people, no topic prompts were shown, even if topics existed.
  //      User noticed when saving draft, only people prompts appeared, not topics from the entry.
  // HOW: Calculate max counts upfront - ~60% people, ~40% topics (rounded).
  //      Generate up to peopleCount people prompts, then up to topicsCount topic prompts.
  //      This ensures both types are represented even if many people exist.
  // SYNTAX BREAKDOWN:
  //   - const peopleCount = Math.min(...) - Math.min() returns the smallest of its arguments
  //     - Math.min(a, b) - JavaScript Math object method (built-in, no import needed)
  //   - Math.ceil(count * 0.6) - Math.ceil() rounds UP to nearest integer
  //     - Example: Math.ceil(5 * 0.6) = Math.ceil(3.0) = 3
  //     - Example: Math.ceil(5 * 0.6) = Math.ceil(3.0) = 3, but Math.ceil(3.1) = 4
  //   - Math.floor(count * 0.4) - Math.floor() rounds DOWN to nearest integer
  //     - Example: Math.floor(5 * 0.4) = Math.floor(2.0) = 2
  //   - metadata.people.length - Array.length property (JavaScript built-in)
  //   - count - number parameter passed to function (from generatePromptsFromMetadata call)
  //   - count - peopleCount - Simple subtraction to ensure we don't exceed total count
  // REFERENCES:
  //   - Math.min, Math.ceil, Math.floor: JavaScript Math object methods - MDN Web Docs
  //   - Array.length: JavaScript Array.prototype.length property - MDN Web Docs
  //   - metadata: ExtractedMetadata type (defined in extract.ts, imported at top of file)
  // APPROACH: Pre-calculate limits before generation - prevents filling all slots with one type.
  //           This is a simple fix - not over-engineered, just ensures fair distribution.
  // CONNECTION: Used when generating prompts for new entries - ensures variety in suggestions.
  // Priority: People > Topics > Dates
  // BUT: Ensure we get a mix - don't fill all slots with people
  // Strategy: Generate ~60% people, ~40% topics (rounded)
  const peopleCount = Math.min(
    Math.ceil(count * 0.6), // ~60% for people (rounded up)
    metadata.people.length // Don't exceed available people
  );
  const topicsCount = Math.min(
    Math.floor(count * 0.4), // ~40% for topics (rounded down)
    metadata.topics.length, // Don't exceed available topics
    count - peopleCount // Don't exceed total count
  );
  
  // Generate prompts for people first - ensure they use person templates
  let promptIndex = 0;
  for (let i = 0; i < peopleCount && prompts.length < count; i++) {
    const person = metadata.people[i];
    const personTemplates = templates.person;
    
    // Select best template based on sentiment, context, and rotation
    const template = selectBestTemplate(
      person, 
      personTemplates, 
      "person", 
      metadata.sentiment, 
      promptIndex,
      metadata.originalText
    );
    const promptText = template.replace("{entity}", person);
    
    prompts.push({
      id: generatePromptId(promptText), // FIXED: Use prompt text for stable ID
      text: promptText,
      entity: person,
      type: "person",
      used: false,
      createdAt: new Date(),
    });
    promptIndex++;
  }
  
  // Then topics - with validation, ensure they use context-aware topic templates
  // Generate up to topicsCount prompts for topics
  for (let i = 0; i < topicsCount && prompts.length < count; i++) {
    const topic = metadata.topics[i];
    
    // Skip invalid topics
    if (!isValidPrompt(topic, "", "topic")) continue;
    
    const topicTemplates = templates.topic;
    // Select best template for this topic with context awareness
    const template = selectBestTemplate(
      topic, 
      topicTemplates, 
      "topic", 
      metadata.sentiment, 
      promptIndex,
      metadata.originalText
    );
    
    // Replace {entity} in template (handles both "your {entity}" and "{entity}" formats)
    const promptText = template.replace("{entity}", topic);
    
    // Double-check the final prompt makes sense
    if (!isValidPrompt(topic, template, "topic")) continue;
    
      prompts.push({
        id: generatePromptId(promptText), // FIXED: Use prompt text for stable ID
        text: promptText,
        entity: topic,
        type: "topic",
        used: false,
        createdAt: new Date(),
      });
    promptIndex++;
  }
  
  // Finally dates - ensure they use date templates
  for (let i = 0; i < metadata.dates.length && prompts.length < count; i++) {
    const date = metadata.dates[i];
    const dateStr = formatDate(date);
    const dateTemplates = templates.date;
    
    // Select best template for this date with rotation
    const template = selectBestTemplate(
      dateStr, 
      dateTemplates, 
      "date", 
      metadata.sentiment, 
      promptIndex,
      metadata.originalText
    );
    const promptText = template.replace("{entity}", dateStr);
    
    prompts.push({
      id: generatePromptId(promptText), // FIXED: Use prompt text for stable ID
      text: promptText,
      entity: dateStr,
      type: "date",
      used: false,
      createdAt: new Date(),
    });
    promptIndex++;
  }
  
  return prompts.slice(0, count);
}

// Helper: Get default prompts
function getDefaultPrompts(count: number): Prompt[] {
  const now = new Date();
  return DEFAULT_PROMPTS.slice(0, count).map((text, index) => ({
    id: `default-${index}`,
    text,
    used: false,
    createdAt: now,
  }));
}

// Main function: Generate prompts based on extracted metadata
// If no metadata or queue is empty, returns default prompts
export async function generatePrompts(
  extractedData: ExtractedMetadata | null,
  tone: Tone = "cozy",
  count: number = 3,
  originalText?: string
): Promise<Prompt[]> {
  // If no extracted data, return default prompts
  if (!extractedData) {
    return getDefaultPrompts(count);
  }
  
  // Add original text to metadata for context-aware prompts
  const metadataWithContext: ExtractedMetadata = {
    ...extractedData,
    originalText: originalText || extractedData.originalText,
  };
  
  // Check if we have any entities
  const hasEntities =
    metadataWithContext.people.length > 0 ||
    metadataWithContext.topics.length > 0 ||
    metadataWithContext.dates.length > 0;
  
  if (!hasEntities) {
    return getDefaultPrompts(count);
  }
  
  // Generate prompts from extracted data with context
  const prompts = generatePromptsFromMetadata(metadataWithContext, tone, count);
  
  // If we don't have enough prompts, fill with defaults
  if (prompts.length < count) {
    const defaultPrompts = getDefaultPrompts(count - prompts.length);
    prompts.push(...defaultPrompts);
  }
  
  return prompts.slice(0, count);
}

// Helper: Load used prompts from localStorage
export function getUsedPrompts(): Set<string> {
  if (typeof window === "undefined") return new Set();
  
  try {
    const stored = localStorage.getItem("talkbook-used-prompts");
    if (!stored) return new Set();
    const promptIds = JSON.parse(stored) as string[];
    return new Set(promptIds);
  } catch (error) {
    console.error("Error loading used prompts:", error);
    return new Set();
  }
}

// Helper: Save used prompt to localStorage
export function markPromptAsUsed(promptId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const usedPrompts = getUsedPrompts();
    usedPrompts.add(promptId);
    localStorage.setItem("talkbook-used-prompts", JSON.stringify([...usedPrompts]));
  } catch (error) {
    console.error("Error saving used prompt:", error);
  }
}

// Helper: Filter out used prompts from a list
export function filterUsedPrompts(prompts: Prompt[]): Prompt[] {
  const usedPrompts = getUsedPrompts();
  return prompts.filter((prompt) => !usedPrompts.has(prompt.id));
}

// Helper: Filter out expired prompts
// Prompts expire after a certain number of days if not used
export function filterExpiredPrompts(
  prompts: Prompt[],
  expiryDays: number = 7
): Prompt[] {
  const now = new Date();
  const expiryMs = expiryDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
  return prompts.filter((prompt) => {
    const age = now.getTime() - prompt.createdAt.getTime();
    return age < expiryMs; // Keep prompts that are younger than expiry period
  });
}

// Helper: Clear used prompts (called when entry is saved)
// Also useful for testing/debugging
export function clearUsedPrompts(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem("talkbook-used-prompts");
    console.log("✅ Cleared used prompts from localStorage");
  } catch (error) {
    console.error("Error clearing used prompts:", error);
  }
}

// Helper: Get count of used prompts (for debugging)
export function getUsedPromptsCount(): number {
  return getUsedPrompts().size;
}

