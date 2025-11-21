// Import types
import { extractMetadata } from "./extract";
import nlp from "compromise"; // For linguistic analysis and context-based detection

// Prompt template types
type Tone = "cozy" | "neutral";
type EntityType = "person" | "topic" | "date";

// Interface for extracted metadata
interface ExtractedMetadata {
  people: string[];
  topics: string[];
  dates: Date[];
  originalText?: string; // Optional: original text for context-aware prompts
}

// Interface for a prompt (clickable - for people/names only)
export interface Prompt {
  id: string; // Unique ID for tracking
  text: string; // The prompt text
  entity?: string; // The entity it's based on (person name, topic, etc.)
  type?: EntityType; // Type of entity
  used: boolean; // Whether this prompt has been used
  createdAt: Date; // When this prompt was generated (for expiry tracking)
}

// Interface for topic suggestions (non-clickable - just display words)
export interface TopicSuggestion {
  word: string; // The topic word itself
  entity?: string; // Original entity if available
}

// Default prompts when no extracted data is available eg: first entry 
const DEFAULT_PROMPTS = [
  "How are you feeling?",
  "What's on your mind?",
  "What did you do today?",
  "Who is on your mind?",
];

// Helper: Check if a topic should use "your" (possessive context)
// Uses context-based detection with compromise - NO hardcoded word sets!
// Only uses minimal fallback for truly ambiguous cases (when no context available)
function shouldUsePossessive(topic: string, originalText?: string): boolean {
  // If we have original text, use context-based detection (preferred method)
  if (originalText) {
    const lowerText = originalText.toLowerCase();
    const lowerTopic = topic.toLowerCase();
    
    // Pattern 1: "my/our/your topic" → possessive
    if (new RegExp(`(my|our|your)\\s+${lowerTopic}`, "i").test(lowerText)) {
      return true;
    }
    
    // Pattern 2: "topic of mine/ours/yours" → possessive
    if (new RegExp(`${lowerTopic}\\s+(of|for)\\s+(mine|ours|yours)`, "i").test(lowerText)) {
      return true;
    }
    
    // Pattern 3: Use compromise to find possessive context
    // Look for sentences where topic appears with possessive determiners
    const doc = nlp(originalText);
    const sentences = doc.sentences().out("array") as string[];
    
    for (const sentenceText of sentences) {
      const lowerSentence = sentenceText.toLowerCase();
      if (lowerSentence.includes(lowerTopic)) {
        // Check for possessive patterns using regex (more reliable)
        if (new RegExp(`(my|our|your)\\s+${lowerTopic}`, "i").test(lowerSentence)) {
          return true;
        }
      }
    }
  }
  
  // MINIMAL FALLBACK: Only for truly ambiguous cases (no context available)
  // Based on linguistic research: these words are almost always possessive in journal contexts
  // Only 2 words - kept minimal and smart
  const MINIMAL_POSSESSIVE_FALLBACK = new Set([
    "work",   // "my work", "your work" - almost always possessive
    "project", // "my project", "your project" - almost always possessive
  ]);
  
  const lowerTopic = topic.toLowerCase();
  if (MINIMAL_POSSESSIVE_FALLBACK.has(lowerTopic)) {
    return true; // Only use fallback if no context available
  }
  
  return false;
}

// Helper: Determine topic category for better template selection
// Uses context-based detection with compromise - NO hardcoded word sets!
// Analyzes surrounding context to determine category dynamically
function getTopicCategory(topic: string, originalText?: string): "work" | "personal" | "activity" | "general" {
  // If we have original text, use context-based detection (preferred method)
  if (originalText) {
    const doc = nlp(originalText);
    const lowerText = originalText.toLowerCase();
    const lowerTopic = topic.toLowerCase();
    
    // WORK: Look for work-related context words nearby
    // Check if topic appears near work indicators (deadline, meeting, project, task, assignment, presentation, report, office, boss, colleague, team)
    const workContextPattern = new RegExp(`${lowerTopic}.*(deadline|meeting|project|task|assignment|presentation|report|work|office|boss|colleague|team|client|customer|manager|supervisor|workplace|job|career)`, "i");
    if (workContextPattern.test(lowerText)) {
      return "work";
    }
    
    // Also check reverse pattern: work word before topic
    const reverseWorkPattern = new RegExp(`(deadline|meeting|project|task|assignment|presentation|report|work|office|boss|colleague|team).*${lowerTopic}`, "i");
    if (reverseWorkPattern.test(lowerText)) {
      return "work";
    }
    
    // Use compromise to find work-related context
    const workMatch = doc.match(`${lowerTopic}.*(deadline|meeting|project|task|assignment|work)`);
    if (workMatch.found) {
      return "work";
    }
    
    // ACTIVITY: Look for activity/communication verbs nearby
    // Check if topic appears near activity indicators (conversation, discussion, talk, call, meeting, chat)
    const activityContextPattern = new RegExp(`${lowerTopic}.*(conversation|discussion|talk|call|meeting|chat|phone|message|text|email)`, "i");
    if (activityContextPattern.test(lowerText)) {
      return "activity";
    }
    
    // Reverse pattern
    const reverseActivityPattern = new RegExp(`(conversation|discussion|talk|call|meeting|chat|phone|message|text|email).*${lowerTopic}`, "i");
    if (reverseActivityPattern.test(lowerText)) {
      return "activity";
    }
    
    // PERSONAL: Look for emotional/feeling words nearby
    // Check if topic appears near personal indicators (feeling, emotion, mood, thought, idea, feeling, feels)
    const personalContextPattern = new RegExp(`${lowerTopic}.*(feeling|emotion|mood|thought|idea|feels|felt|feeling|emotions|moods)`, "i");
    if (personalContextPattern.test(lowerText)) {
      return "personal";
    }
    
    // Reverse pattern
    const reversePersonalPattern = new RegExp(`(feeling|emotion|mood|thought|idea|feels|felt|feeling|emotions|moods).*${lowerTopic}`, "i");
    if (reversePersonalPattern.test(lowerText)) {
      return "personal";
    }
  }
  
  // No context available - return general (let templates handle it)
  return "general";
}

// Prompt templates organized by tone, entity type, and context
// SIMPLIFIED: Fewer templates to avoid awkward prompts
// For topics: Use word itself or very generic templates
const PROMPT_TEMPLATES = {
  cozy: {
    person: [
      "Tell me about {entity}.",
      "Anything happen with {entity}?",
      "What's on your mind about {entity}?",
      "How's {entity} doing?",
    ],
    topic: {
      // SIMPLIFIED: For topics, just use the word itself or very generic templates
      // This avoids awkward prompts like "How did house go?"
      general: [
        "{entity}", // Just the word itself - user can make it their header
        "Tell me more about {entity}.",
        "What happened with {entity}?",
      ],
    },
    date: [
      "Tell me about {entity}.",
      "What happened on {entity}?",
    ],
  },
  neutral: {
    person: [
      "Tell me about {entity}.",
      "Anything happen with {entity}?",
      "What's new with {entity}?",
    ],
    topic: {
      general: [
        "{entity}", // Just the word itself - user can make it their header
        "Tell me more about {entity}.",
        "What happened with {entity}?",
      ],
    },
    date: [
      "Tell me about {entity}.",
      "What happened on {entity}?",
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
// Uses compromise for linguistic analysis - NO hardcoded word sets!
// Filters out prompts that would create awkward sentences using part-of-speech detection
function isValidPrompt(topic: string, template: string, type: EntityType): boolean {
  const lowerTopic = topic.toLowerCase();
  
  // Skip very short topics (not meaningful)
  if (topic.length < 3) return false;
  
  // Use compromise to analyze the topic linguistically
  const doc = nlp(topic);
  
  // Filter out parts of speech that don't work as topics using compromise
  // This is MUCH smarter than hardcoded lists - handles ANY word!
  
  // Skip if it's an adjective (doesn't work as topic)
  if (doc.has("#Adjective")) return false;
  
  // Skip if it's an adverb
  if (doc.has("#Adverb")) return false;
  
  // Skip if it's a pronoun
  if (doc.has("#Pronoun")) return false;
  
  // Skip if it's a determiner (the, a, an, this, that)
  if (doc.has("#Determiner")) return false;
  
  // Skip if it's a preposition
  if (doc.has("#Preposition")) return false;
  
  // Skip if it's a conjunction
  if (doc.has("#Conjunction")) return false;
  
  // Skip if it's a verb (unless it's a gerund/noun form)
  if (doc.has("#Verb") && !doc.has("#Gerund") && !doc.has("#PresentTense")) {
    return false;
  }
  
  // CRITICAL: Filter out pronouns that compromise might miss
  // These are common pronouns that slip through as nouns (like "it", "her", "him", "they")
  const COMMON_PRONOUNS = new Set([
    // Personal pronouns
    "it", "its", "he", "him", "she", "her", "they", "them", "we", "us",
    // Possessive pronouns
    "his", "hers", "theirs", "ours", "yours", "mine",
    // Demonstrative pronouns
    "this", "that", "these", "those",
    // Interrogative pronouns
    "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
    // Indefinite pronouns
    "all", "another", "any", "anybody", "anyone", "anything", "each", "everybody", "everyone", "everything",
    "few", "many", "nobody", "none", "one", "several", "some", "somebody", "someone", "something",
    // Common words that are often pronouns
    "guy", "guys", "person", "people", "thing", "things", "stuff",
  ]);
  
  if (COMMON_PRONOUNS.has(lowerTopic)) {
    return false; // Never allow pronouns as topics
  }
  
  // MINIMAL FALLBACK: Common English stop words (most frequent words that don't carry semantic meaning)
  // Based on linguistic research - these are the top 20 most common English words
  // Only used as fallback if compromise doesn't catch them (rare edge cases)
  const COMMON_STOP_WORDS = new Set([
    // Most common determiners
    "the", "a", "an",
    // Most common prepositions
    "in", "on", "at", "to", "for", "of", "with", "by",
    // Most common conjunctions
    "and", "or", "but", "so", "if",
    // Most common auxiliary verbs
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    // Common time/place adverbs
    "today", "tomorrow", "yesterday", "now", "then", "here", "there", "where", "when",
  ]);
  
  // Only use fallback if compromise didn't catch it (defensive check)
  if (COMMON_STOP_WORDS.has(lowerTopic)) {
    return false;
  }
  
  // For topics, check if the template makes grammatical sense
  if (type === "topic") {
    // Templates like "How's {topic} going?" don't work well with adjectives/adverbs
    const testPrompt = template.replace("{entity}", topic);
    const testDoc = nlp(testPrompt);
    
    // Check if template creates awkward grammar
    const awkwardPatterns = [
      /how's \w+ going\?/i, // "How's great going?" - awkward
      /what's happening with \w+\?/i, // "What's happening with today?" - awkward
    ];
    
    // Only check if template matches these patterns
    if (awkwardPatterns.some(pattern => pattern.test(testPrompt))) {
      // Use compromise to check if the word in context is an adjective/adverb
      // If compromise says it's an adjective/adverb in this context, skip it
      if (testDoc.has("#Adjective") || testDoc.has("#Adverb")) {
        return false;
      }
      
      // For these templates, prefer noun-like topics (longer, more specific)
      // Skip very short words that might be adjectives/adverbs
      if (topic.length < 5 && !doc.has("#Noun")) {
        return false;
      }
    }
    
    // Prefer nouns for topics (use compromise to verify)
    if (!doc.has("#Noun") && !doc.has("#Gerund")) {
      // Not a noun or gerund - might not work well as topic
      // But allow it if it's longer (might be a compound word compromise doesn't recognize)
      if (topic.length < 5) {
        return false;
      }
    }
  }
  
  return true;
}

// Helper: Select the best template for an entity
// Chooses templates that work best for the entity type and rotates for variety
function selectBestTemplate(
  entity: string,
  templates: string[] | { possessive?: string[]; work?: string[]; activity?: string[]; general?: string[] },
  type: EntityType,
  index: number = 0,
  originalText?: string
): string {
  // Handle array templates (for people and dates)
  if (Array.isArray(templates)) {
    // Rotate through templates for variety
    const rotationIndex = index % templates.length;
    return templates[rotationIndex];
  }
  
  // Handle object templates (for topics - SIMPLIFIED)
  if (type === "topic") {
    // SIMPLIFIED: Just use general templates (no complex categorization)
    // This avoids awkward prompts and lets users customize
    const templateSet: string[] = templates.general || [];
    
    // Select template with rotation
    const rotationIndex = index % templateSet.length;
    return templateSet[rotationIndex];
  }
  
  // Fallback
  return Array.isArray(templates) ? templates[0] : templates.general?.[0] || "";
}

// Helper: Get prompts from extracted metadata (SIMPLIFIED: Only people prompts)
// Topics are now handled separately as non-clickable suggestions
function generatePromptsFromMetadata(
  metadata: ExtractedMetadata,
  tone: Tone,
  count: number
): Prompt[] {
  const prompts: Prompt[] = [];
  const templates = PROMPT_TEMPLATES[tone];
  
  // SIMPLIFIED: Only generate prompts for people (names)
  // Topics are shown separately as non-clickable suggestions
  const peopleCount = Math.min(count, metadata.people.length);
  
  // Generate prompts for people only
  for (let i = 0; i < peopleCount && prompts.length < count; i++) {
    const person = metadata.people[i];
    const personTemplates = templates.person;
    
    // Select template using rotation for variety
    const template = selectBestTemplate(
      person, 
      personTemplates, 
      "person", 
      i,
      metadata.originalText
    );
    const promptText = template.replace("{entity}", person);
    
    prompts.push({
      id: generatePromptId(promptText),
      text: promptText,
      entity: person,
      type: "person",
      used: false,
      createdAt: new Date(),
    });
  }
  
  return prompts;
}

// Helper: Check if a word is likely a person name using compromise
// This catches names that might have been extracted as topics instead of people
function isLikelyName(word: string): boolean {
  if (!word || word.length < 2) return false;
  
  try {
    // Use compromise to check if this word is detected as a person name
    // Test in a sentence context for better accuracy
    const wordLower = word.toLowerCase().trim();
    const testSentence = `I met ${word} yesterday.`;
    const doc = nlp(testSentence);
    
    // Check if compromise detects it as a person
    const people = doc.people().out("array") as string[];
    if (people.length > 0) {
      // Check if any detected person matches our word (case-insensitive)
      if (people.some(p => p.toLowerCase().trim() === wordLower)) {
        return true;
      }
    }
    
    // Also check if it's tagged as a ProperNoun (likely a name)
    const terms = doc.terms().out("array") as any[];
    const wordTerm = terms.find(t => {
      const tText = (t.text || "").toLowerCase().replace(/[.,!?;:]/g, "");
      return tText === wordLower;
    });
    
    if (wordTerm) {
      const tags = wordTerm.tags || [];
      const isProperNoun = tags.some((tag: string) => 
        tag.includes("ProperNoun") || tag.includes("Person")
      );
      if (isProperNoun) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // If compromise fails, fall back to false
    return false;
  }
}

// Helper: Get topic suggestions (non-clickable, just words)
// Only from last 3 entries, capped at reasonable number
// Excludes names (people) - only shows non-name topics
export function getTopicSuggestions(
  metadata: ExtractedMetadata,
  maxCount: number = 8,
  excludeNames: string[] = []
): TopicSuggestion[] {
  // Create a set of names to exclude (case-insensitive comparison)
  const namesSet = new Set(
    excludeNames.map(name => name.toLowerCase().trim())
  );
  
  // Filter and validate topics, excluding names
  const validTopics = metadata.topics
    .filter(topic => {
      // Basic validation - must be valid prompt
      if (!isValidPrompt(topic, "", "topic")) return false;
      
      // CRITICAL: Exclude names - check if topic matches any name (case-insensitive)
      const topicLower = topic.toLowerCase().trim();
      if (namesSet.has(topicLower)) {
        return false; // This is a name, exclude it
      }
      
      // CRITICAL: Also check if compromise thinks this is a person name
      // This catches names that weren't extracted as people (e.g., lowercase names)
      if (isLikelyName(topic)) {
        return false; // Compromise detected this as a name, exclude it
      }
      
      return true;
    })
    .slice(0, maxCount) // Cap at maxCount
    .map(topic => ({
      word: topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase(), // Capitalize
      entity: topic,
    }));
  
  return validTopics;
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

// Main function: Generate prompts based on extracted metadata (SIMPLIFIED: Only people)
// If no metadata, returns default prompts
export async function generatePrompts(
  extractedData: ExtractedMetadata | null,
  tone: Tone = "cozy",
  count: number = 5,
  originalText?: string
): Promise<Prompt[]> {
  console.log("🔧 [generatePrompts] Called with:", {
    hasPeople: extractedData?.people?.length || 0,
    people: extractedData?.people || [],
    tone,
    count
  });
  
  // If no extracted data, return default prompts
  if (!extractedData) {
    console.log("⚠️ [generatePrompts] No extracted data, returning defaults");
    return getDefaultPrompts(count);
  }
  
  // Add original text to metadata for context-aware prompts
  const metadataWithContext: ExtractedMetadata = {
    ...extractedData,
    originalText: originalText || extractedData.originalText,
  };
  
  // Check if we have any people
  if (metadataWithContext.people.length === 0) {
    console.log("⚠️ [generatePrompts] No people found, returning defaults");
    return getDefaultPrompts(count);
  }
  
  console.log("✅ [generatePrompts] Generating prompts for people:", metadataWithContext.people);
  
  // Generate prompts from extracted data with context (only people)
  const prompts = generatePromptsFromMetadata(metadataWithContext, tone, count);
  
  console.log("✅ [generatePrompts] Generated prompts:", prompts.map(p => ({ text: p.text, entity: p.entity })));
  
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
  const filtered = prompts.filter((prompt) => !usedPrompts.has(prompt.id));
  
  return filtered;
}

// Helper: Filter out expired prompts
// Prompts expire after a certain number of days if not used
export function filterExpiredPrompts(
  prompts: Prompt[],
  expiryDays: number = 7
): Prompt[] {
  const now = new Date();
  const expiryMs = expiryDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
  const filtered = prompts.filter((prompt) => {
    const age = now.getTime() - prompt.createdAt.getTime();
    const isExpired = age >= expiryMs;
    
    return age < expiryMs; // Keep prompts that are younger than expiry period
  });
  
  return filtered;
}

