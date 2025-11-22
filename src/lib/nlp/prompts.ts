// generates prompts from extracted people names and topics
// prompts are clickable suggestions for people, topics are non-clickable suggestions

import { extractMetadata } from "./extract";
import nlp from "compromise";

type Tone = "cozy" | "neutral";
type EntityType = "person" | "topic";

interface ExtractedMetadata {
  people: string[];
  topics: string[];
  originalText?: string;
}

export interface Prompt {
  id: string;
  text: string;
  entity?: string;
  type?: EntityType;
  used: boolean;
  createdAt: Date;
}

export interface TopicSuggestion {
  word: string;
  entity?: string;
}

// default prompts when no extracted data available (e.g. first entry)
const DEFAULT_PROMPTS = [
  "How are you feeling?",
  "What's on your mind?",
  "What did you do today?",
  "Who is on your mind?",
  "What happened yesterday?",
  "Your thoughts on tommorow?"
];

// default topic suggestions when no extracted topics available
// always shown in "maybe you want to talk about" section
const DEFAULT_TOPIC_SUGGESTIONS: string[] = [
  "Yesterday",
  "This week",
  "Family",
  "Friends",
  "Your feelings",
  "The future"
];

// checks if topic should use "your" (possessive context)
// uses compromise for context detection, minimal fallback for ambiguous cases
function shouldUsePossessive(topic: string, originalText?: string): boolean {
  if (originalText) {
    const lowerText = originalText.toLowerCase();
    const lowerTopic = topic.toLowerCase();
    
    // pattern: "my/our/your topic"
    if (new RegExp(`(my|our|your)\\s+${lowerTopic}`, "i").test(lowerText)) {
      return true;
    }
    
    // pattern: "topic of mine/ours/yours"
    if (new RegExp(`${lowerTopic}\\s+(of|for)\\s+(mine|ours|yours)`, "i").test(lowerText)) {
      return true;
    }
    
    // use compromise to find possessive context in sentences
    const doc = nlp(originalText);
    const sentences = doc.sentences().out("array") as string[];
    
    for (const sentenceText of sentences) {
      const lowerSentence = sentenceText.toLowerCase();
      if (lowerSentence.includes(lowerTopic)) {
        if (new RegExp(`(my|our|your)\\s+${lowerTopic}`, "i").test(lowerSentence)) {
          return true;
        }
      }
    }
  }
  
  // minimal fallback for ambiguous cases
  const MINIMAL_POSSESSIVE_FALLBACK = new Set([
    "work",
    "project",
  ]);
  
  const lowerTopic = topic.toLowerCase();
  if (MINIMAL_POSSESSIVE_FALLBACK.has(lowerTopic)) {
    return true;
  }
  
  return false;
}

// determines topic category from context using compromise
function getTopicCategory(topic: string, originalText?: string): "work" | "personal" | "activity" | "general" {
  if (originalText) {
    const doc = nlp(originalText);
    const lowerText = originalText.toLowerCase();
    const lowerTopic = topic.toLowerCase();
    
    // check for work context
    const workContextPattern = new RegExp(`${lowerTopic}.*(deadline|meeting|project|task|assignment|presentation|report|work|office|boss|colleague|team|client|customer|manager|supervisor|workplace|job|career)`, "i");
    if (workContextPattern.test(lowerText)) {
      return "work";
    }
    
    const reverseWorkPattern = new RegExp(`(deadline|meeting|project|task|assignment|presentation|report|work|office|boss|colleague|team).*${lowerTopic}`, "i");
    if (reverseWorkPattern.test(lowerText)) {
      return "work";
    }
    
    const workMatch = doc.match(`${lowerTopic}.*(deadline|meeting|project|task|assignment|work)`);
    if (workMatch.found) {
      return "work";
    }
    
    // check for activity context
    const activityContextPattern = new RegExp(`${lowerTopic}.*(conversation|discussion|talk|call|meeting|chat|phone|message|text|email)`, "i");
    if (activityContextPattern.test(lowerText)) {
      return "activity";
    }
    
    const reverseActivityPattern = new RegExp(`(conversation|discussion|talk|call|meeting|chat|phone|message|text|email).*${lowerTopic}`, "i");
    if (reverseActivityPattern.test(lowerText)) {
      return "activity";
    }
    
    // check for personal context
    const personalContextPattern = new RegExp(`${lowerTopic}.*(feeling|emotion|mood|thought|idea|feels|felt|feeling|emotions|moods)`, "i");
    if (personalContextPattern.test(lowerText)) {
      return "personal";
    }
    
    const reversePersonalPattern = new RegExp(`(feeling|emotion|mood|thought|idea|feels|felt|feeling|emotions|moods).*${lowerTopic}`, "i");
    if (reversePersonalPattern.test(lowerText)) {
      return "personal";
    }
  }
  
  return "general";
}

// prompt templates by tone and entity type
// simplified to avoid awkward prompts, topics use word itself or generic templates
const PROMPT_TEMPLATES = {
  cozy: {
    person: [
      "Tell me about {entity}.",
      "Anything happen with {entity}?",
      "What's on your mind about {entity}?",
      "How's {entity} doing?",
    ],
    topic: {
      // topics use word itself or generic templates to avoid awkward prompts
      general: [
        "{entity}",
        "Tell me more about {entity}.",
        "What happened with {entity}?",
      ],
    },
  },
  neutral: {
    person: [
      "Tell me about {entity}.",
      "Anything happen with {entity}?",
      "What's new with {entity}?",
    ],
    topic: {
      general: [
        "{entity}",
        "Tell me more about {entity}.",
        "What happened with {entity}?",
      ],
    },
  },
};


// generates stable prompt id from text hash
// hashes prompt text so same text always gets same id (regardless of template used)
// uses djb2-like hash algorithm with base36 encoding
function generatePromptId(promptText: string): string {
  let hash = 0;
  for (let i = 0; i < promptText.length; i++) {
    const char = promptText.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `prompt-${Math.abs(hash).toString(36)}`;
}

// checks if topic works in a template using compromise linguistic analysis
// filters out awkward prompts using part-of-speech detection
function isValidPrompt(topic: string, template: string, type: EntityType): boolean {
  const lowerTopic = topic.toLowerCase();
  
  if (topic.length < 3) return false;
  
  const doc = nlp(topic);
  
  // filter out parts of speech that don't work as topics
  if (doc.has("#Adjective")) return false;
  if (doc.has("#Adverb")) return false;
  if (doc.has("#Pronoun")) return false;
  if (doc.has("#Determiner")) return false;
  if (doc.has("#Preposition")) return false;
  if (doc.has("#Conjunction")) return false;
  if (doc.has("#Verb") && !doc.has("#Gerund") && !doc.has("#PresentTense")) {
    return false;
  }
  
  // filter out pronouns that compromise might miss
  const COMMON_PRONOUNS = new Set([
    "it", "its", "he", "him", "she", "her", "they", "them", "we", "us",
    "his", "hers", "theirs", "ours", "yours", "mine",
    "this", "that", "these", "those",
    "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
    "all", "another", "any", "anybody", "anyone", "anything", "each", "everybody", "everyone", "everything",
    "few", "many", "nobody", "none", "one", "several", "some", "somebody", "someone", "something",
    "guy", "guys", "person", "people", "thing", "things", "stuff",
  ]);
  
  if (COMMON_PRONOUNS.has(lowerTopic)) {
    return false;
  }
  
  // fallback stop words for things compromise might miss
  const COMMON_STOP_WORDS = new Set([
    "the", "a", "an",
    "in", "on", "at", "to", "for", "of", "with", "by",
    "and", "or", "but", "so", "if",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "today", "tomorrow", "yesterday", "now", "then", "here", "there", "where", "when",
  ]);
  
  if (COMMON_STOP_WORDS.has(lowerTopic)) {
    return false;
  }
  
  // for topics, check if template makes grammatical sense
  if (type === "topic") {
    const testPrompt = template.replace("{entity}", topic);
    const testDoc = nlp(testPrompt);
    
    const awkwardPatterns = [
      /how's \w+ going\?/i,
      /what's happening with \w+\?/i,
    ];
    
    if (awkwardPatterns.some(pattern => pattern.test(testPrompt))) {
      if (testDoc.has("#Adjective") || testDoc.has("#Adverb")) {
        return false;
      }
      
      if (topic.length < 5 && !doc.has("#Noun")) {
        return false;
      }
    }
    
    if (!doc.has("#Noun") && !doc.has("#Gerund")) {
      if (topic.length < 5) {
        return false;
      }
    }
  }
  
  return true;
}

// selects template for entity, rotates for variety
function selectBestTemplate(
  entity: string,
  templates: string[] | { possessive?: string[]; work?: string[]; activity?: string[]; general?: string[] },
  type: EntityType,
  index: number = 0,
  originalText?: string
): string {
  if (Array.isArray(templates)) {
    const rotationIndex = index % templates.length;
    return templates[rotationIndex];
  }
  
  if (type === "topic") {
    const templateSet: string[] = templates.general || [];
    const rotationIndex = index % templateSet.length;
    return templateSet[rotationIndex];
  }
  
  return Array.isArray(templates) ? templates[0] : templates.general?.[0] || "";
}

// generates prompts from extracted metadata (only people, topics handled separately)
function generatePromptsFromMetadata(
  metadata: ExtractedMetadata,
  tone: Tone,
  count: number
): Prompt[] {
  const prompts: Prompt[] = [];
  const templates = PROMPT_TEMPLATES[tone];
  const peopleCount = Math.min(count, metadata.people.length);
  
  for (let i = 0; i < peopleCount && prompts.length < count; i++) {
    const person = metadata.people[i];
    const personTemplates = templates.person;
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

// checks if word is likely a person name using compromise
// catches names that might have been extracted as topics
function isLikelyName(word: string): boolean {
  if (!word || word.length < 2) return false;
  
  try {
    const wordLower = word.toLowerCase().trim();
    const testSentence = `I met ${word} yesterday.`;
    const doc = nlp(testSentence);
    
    const people = doc.people().out("array") as string[];
    if (people.length > 0) {
      if (people.some(p => p.toLowerCase().trim() === wordLower)) {
        return true;
      }
    }
    
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
    return false;
  }
}

// gets topic suggestions (non-clickable words)
// excludes names, always returns defaults if no extracted topics available
export function getTopicSuggestions(
  metadata: ExtractedMetadata | null,
  maxCount: number = 8,
  excludeNames: string[] = []
): TopicSuggestion[] {
  const namesSet = new Set(
    excludeNames.map(name => name.toLowerCase().trim())
  );
  
  const validTopics = (metadata?.topics || [])
    .filter(topic => {
      if (!isValidPrompt(topic, "", "topic")) return false;
      
      const topicLower = topic.toLowerCase().trim();
      if (namesSet.has(topicLower)) {
        return false;
      }
      
      if (isLikelyName(topic)) {
        return false;
      }
      
      return true;
    })
    .slice(0, maxCount)
    .map(topic => ({
      word: topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase(),
      entity: topic,
    }));
  
  if (validTopics.length === 0 && DEFAULT_TOPIC_SUGGESTIONS.length > 0) {
    return DEFAULT_TOPIC_SUGGESTIONS.map(word => ({
      word: word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      entity: word,
    }));
  }
  
  return validTopics;
}

// gets default prompts when no extracted data available
function getDefaultPrompts(count: number): Prompt[] {
  const now = new Date();
  return DEFAULT_PROMPTS.slice(0, count).map((text, index) => ({
    id: `default-${index}`,
    text,
    used: false,
    createdAt: now,
  }));
}

// generates prompts from extracted metadata (only people)
// returns default prompts if no metadata available
export async function generatePrompts(
  extractedData: ExtractedMetadata | null,
  tone: Tone = "cozy",
  count: number = 10,
  originalText?: string
): Promise<Prompt[]> {
  console.log("🔧 [generatePrompts] Called with:", {
    hasPeople: extractedData?.people?.length || 0,
    people: extractedData?.people || [],
    tone,
    count
  });
  
  if (!extractedData) {
    console.log("⚠️ [generatePrompts] No extracted data, returning defaults");
    return getDefaultPrompts(count);
  }
  
  const metadataWithContext: ExtractedMetadata = {
    ...extractedData,
    originalText: originalText || extractedData.originalText,
  };
  
  if (metadataWithContext.people.length === 0) {
    console.log("⚠️ [generatePrompts] No people found, returning defaults");
    return getDefaultPrompts(count);
  }
  
  console.log("✅ [generatePrompts] Generating prompts for people:", metadataWithContext.people);
  
  const prompts = generatePromptsFromMetadata(metadataWithContext, tone, count);
  
  console.log("✅ [generatePrompts] Generated prompts:", prompts.map(p => ({ text: p.text, entity: p.entity })));
  
  if (prompts.length < count) {
    const defaultPrompts = getDefaultPrompts(count - prompts.length);
    prompts.push(...defaultPrompts);
  }
  
  return prompts.slice(0, count);
}

// loads used prompts from localStorage
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

// saves used prompt to localStorage
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

// filters out used prompts from list
export function filterUsedPrompts(prompts: Prompt[]): Prompt[] {
  const usedPrompts = getUsedPrompts();
  const filtered = prompts.filter((prompt) => !usedPrompts.has(prompt.id));
  
  return filtered;
}

// filters out expired prompts (expire after specified days if not used)
export function filterExpiredPrompts(
  prompts: Prompt[],
  expiryDays: number = 7
): Prompt[] {
  const now = new Date();
  const expiryMs = expiryDays * 24 * 60 * 60 * 1000;
  
  const filtered = prompts.filter((prompt) => {
    const age = now.getTime() - prompt.createdAt.getTime();
    return age < expiryMs;
  });
  
  return filtered;
}

