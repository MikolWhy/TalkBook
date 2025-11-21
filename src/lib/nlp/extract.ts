// nlp extraction - extracts entities from journal entry text
// uses compromise for people/topics, chrono-node for dates
//
// WHAT WE'RE CREATING:
// - A function that reads journal entry text and extracts meaningful information
// - Extracts: people (names), topics (nouns), dates mentioned
// - This extracted data is used for: prompt generation, statistics, insights
// - All processing happens client-side (privacy-first, no data sent to servers)
//
// OWNERSHIP:
// - Michael implements this completely
//
// COORDINATION NOTES:
// - Uses Entry interface from schema.ts (Aadil creates this)
// - Saves extracted entities using repo.ts entity functions (Michael adds these)
// - Called after entry is saved (from app/journal/new/page.tsx)
//
// CONTEXT FOR AI ASSISTANTS:
// - This file processes journal entry text to extract meaningful information
// - Extracted data is used for: prompt generation, statistics, insights
// - All processing happens client-side (privacy-first, no data sent to servers)
// - The extracted entities are stored in the database for later use
//
// LIBRARIES USED:
// - compromise: extracts people (names) and topics (nouns) from text
// - chrono-node: extracts dates mentioned in text (e.g., "yesterday", "next week")
//
// DEVELOPMENT NOTES:
// - Process plain text (strip HTML from rich text editor before processing)
// - Handle edge cases: empty text, very long text, special characters
// - Normalize extracted data (lowercase names, remove duplicates)
// - Sentiment score: positive = positive emotion, negative = negative emotion, 0 = neutral
// - People extraction: look for capitalized words that might be names
// - Topics extraction: extract important nouns (skip common words like "the", "a")
//
// TODO: implement extractMetadata function
// - Input: plain text string from journal entry
// - Output: object with { people: string[], topics: string[], dates: Date[] }
// - Use compromise to extract people and topics
// - Use chrono-node to extract dates
// - Return normalized, deduplicated results
//
// SYNTAX: 
// export async function extractMetadata(text: string): Promise<{
//   people: string[];
//   topics: string[];
//   dates: Date[];
//   sentiment: number;
// }> {
//   // implementation
// }

// Import NLP libraries
import nlp from "compromise";
import * as chrono from "chrono-node";
import { isBlacklisted } from "../blacklist/manager";

// Helper function to strip HTML tags from rich text editor content
// Converts HTML to plain text for NLP processing
function stripHTML(html: string): string {
  // Remove HTML tags using regex
  // This is safe because we're only processing user's own journal entries
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Extract metadata from journal entry text
// Input: HTML string from rich text editor
// Output: Object with extracted people, topics, and dates
export async function extractMetadata(
  text: string
): Promise<{
  people: string[];
  topics: string[];
  dates: Date[];
}> {
  // Handle empty text
  if (!text || text.trim().length === 0) {
    return {
      people: [],
      topics: [],
      dates: [],
    };
  }

  // Convert HTML to plain text
  const plainText = stripHTML(text);
  
  // Initialize result object
  const result = {
    people: [] as string[],
    topics: [] as string[],
    dates: [] as Date[],
  };

  // MINIMAL BLACKLIST: Only grammatical words that are structurally NEVER names
  // We keep this minimal and rely on NLP analysis for everything else
  // This list contains only function words (prepositions, conjunctions, pronouns, determiners)
  const grammaticalWords = new Set([
    // Prepositions (function words)
    "on", "in", "at", "to", "from", "with", "about", "after", "before", "during", "until", "for",
    "by", "under", "over", "through", "between", "among", "into", "onto", "upon",
    // Conjunctions (function words)
    "and", "or", "but", "so", "yet", "nor", "for", "because", "although", "though", "since", "if", "unless", "while",
    // Determiners (function words)
    "the", "a", "an", "this", "that", "these", "those", "some", "any", "each", "every", "either", "neither", "both", "all",
    // Pronouns (function words)
    "i", "me", "my", "mine", "myself",
    "you", "your", "yours", "yourself",
    "he", "him", "his", "himself",
    "she", "her", "hers", "herself",
    "it", "its", "itself",
    "we", "us", "our", "ours", "ourselves",
    "they", "them", "their", "theirs", "themselves",
    // Adverbs (common function words only)
    "not", "very", "too", "so", "just", "only", "also", "even", "still", "already", "yet"
  ]);

  // Helper function: Smart validation to check if a word is truly a person name
  // Uses compromise's linguistic analysis instead of hardcoded word lists
  const isValidPersonName = (word: string, originalContext: string): boolean => {
    const cleanWord = word.replace(/[.,!?;:'"]/g, "").trim();
    const cleanWordLower = cleanWord.toLowerCase();
    
    // Filter 1: Reject grammatical function words (minimal hardcoded list)
    if (grammaticalWords.has(cleanWordLower)) {
      return false;
    }
    
    // Filter 2: Use compromise to analyze the word in multiple sentence contexts
    // Test in 3 different sentence patterns to get accurate linguistic tags
    const testSentences = [
      `I met ${cleanWord} yesterday.`,           // Pattern 1: "met X" - name context
      `${cleanWord} is a person.`,               // Pattern 2: "X is" - subject context
      `I was talking with ${cleanWord}.`         // Pattern 3: "with X" - object context
    ];
    
    let nameCount = 0;
    let nounCount = 0;
    let verbCount = 0;
    let otherGrammaticalCount = 0;
    
    for (const sentence of testSentences) {
      const testDoc = nlp(sentence);
      
      // Check if compromise detects this word as a person in this sentence
      const detectedPeople = testDoc.people().out("array") as string[];
      const isPerson = detectedPeople.some(p => p.toLowerCase().trim() === cleanWordLower);
      
      if (isPerson) {
        nameCount += 2; // Strong signal - compromise detected it as a person
      }
      
      // Also check for ProperNoun tags using match
      const properNounMatch = testDoc.match(`#ProperNoun`);
      if (properNounMatch.found) {
        const properNouns = properNounMatch.out("array") as string[];
        if (properNouns.some(noun => noun.toLowerCase().trim() === cleanWordLower)) {
          nameCount++;
        }
      }
      
      // Check for common noun (but not proper noun)
      const commonNounMatch = testDoc.match(`#Noun`).not("#ProperNoun");
      if (commonNounMatch.found) {
        const commonNouns = commonNounMatch.out("array") as string[];
        if (commonNouns.some(noun => noun.toLowerCase().trim() === cleanWordLower)) {
          nounCount++;
        }
      }
      
      // Check for verb
      const verbMatch = testDoc.match(`#Verb`);
      if (verbMatch.found) {
        const verbs = verbMatch.out("array") as string[];
        if (verbs.some(verb => verb.toLowerCase().trim() === cleanWordLower)) {
          verbCount++;
        }
      }
      
      // Check for other grammatical types
      const adjMatch = testDoc.match(`#Adjective`);
      const advMatch = testDoc.match(`#Adverb`);
      if (adjMatch.found) {
        const adjs = adjMatch.out("array") as string[];
        if (adjs.some(adj => adj.toLowerCase().trim() === cleanWordLower)) {
          otherGrammaticalCount++;
        }
      }
      if (advMatch.found) {
        const advs = advMatch.out("array") as string[];
        if (advs.some(adv => adv.toLowerCase().trim() === cleanWordLower)) {
          otherGrammaticalCount++;
        }
      }
    }
    
    // Decision logic: Use voting system across contexts
    // If compromise consistently tags it as a name/proper noun → it's a name
    // If it's tagged as a verb or other grammatical word → NOT a name
    // If it's a common noun but never tagged as a name → NOT a name
    
    if (verbCount > 0 || otherGrammaticalCount > 0) {
      return false; // Verbs and grammatical words are never names
    }
    
    if (nameCount >= 2) {
      return true; // Compromise thinks it's a name in multiple contexts → trust it
    }
    
    if (nameCount > 0 && nounCount === 0) {
      return true; // Tagged as name but never as common noun → likely a name
    }
    
    // Check original context: if it appears after a strong name indicator AND
    // compromise never tagged it as a verb/grammatical word, it might be a name
    const nameIndicators = ["met", "with", "called", "texted", "saw", "spoke to", "talked to", "talking with"];
    const contextLower = originalContext.toLowerCase();
    const hasNameIndicator = nameIndicators.some(indicator => {
      const pattern = new RegExp(`\\b${indicator}\\s+${cleanWordLower}\\b`, "i");
      return pattern.test(contextLower);
    });
    
    if (hasNameIndicator && nameCount > 0 && verbCount === 0 && otherGrammaticalCount === 0) {
      return true; // Appears after name indicator + compromise tagged it as name at least once
    }
    
    return false; // Default: not confident it's a name
  };
  
  // 1. Extract people (names) using compromise
  try {
    const doc = nlp(plainText);
    
    // HOW COMPROMISE WORKS:
    // compromise analyzes text and identifies named entities (people, places, organizations)
    // .people() = uses built-in knowledge base to find common names
    // This catches names like "John", "Sarah", "Michael", etc.
    const people = doc.people().out("array") as string[];
    
    // Get all terms with their grammatical tags
    const allTerms = doc.terms().out("array") as any[];
    
    // Name indicators - words that often precede names in natural language
    // These are linguistic patterns, not hardcoded word lists
    // Added more indicators to catch common patterns like "talking to X", "went with X", "jumped on X", etc.
    const nameIndicators = [
      // Prepositions that commonly precede names
      "with", "to", "from", "about", "and", "or", "on", "at",
      // Action verbs that commonly precede names
      "met", "talked", "talking", "saw", "called", "texted", "emailed", "visited",
      "went", "came", "spoke", "speaking", "hang", "hanging", "meet", "meeting",
      "jumped", "jump", "ran", "run", "walked", "walk", "sat", "sit", "stood", "stand",
      "played", "play", "worked", "work", "studied", "study"
    ];
    
    // Find potential names using compromise's linguistic analysis
    const potentialNames: string[] = [];
    
    allTerms.forEach((term, index) => {
      const text = term.text || term;
      const tags = term.tags || [];
      const cleanText = text.replace(/[.,!?;:]/g, "");
      const cleanTextLower = cleanText.toLowerCase(); // Define this early!
      
      // Skip very short words
      if (cleanText.length <= 1) return;
      
      // Use compromise's tags - check if it's a ProperNoun
      // ProperNoun = capitalized word that compromise identifies as a proper noun
      const isProperNoun = tags.some((tag: string) => tag.includes("ProperNoun") || tag.includes("Person"));
      
      // Check if it's capitalized (potential name)
      const isCapitalized = text[0] === text[0].toUpperCase() && text[0] !== text[0].toLowerCase();
      
      // Skip if compromise tags it as a common noun, verb, adjective, etc.
      // This prevents "work" from "from work" being detected
      const isCommonNoun = tags.some((tag: string) => 
        tag.includes("Noun") && !tag.includes("ProperNoun")
      );
      const isVerb = tags.some((tag: string) => tag.includes("Verb"));
      const isAdjective = tags.some((tag: string) => tag.includes("Adjective"));
      const isAdverb = tags.some((tag: string) => tag.includes("Adverb"));
      const isPronoun = tags.some((tag: string) => tag.includes("Pronoun"));
      const isDeterminer = tags.some((tag: string) => tag.includes("Determiner"));
      
      // Skip grammatical words that are clearly not names
      // Skip pronouns, determiners, common prepositions, common conjunctions
      if (isPronoun || isDeterminer) {
        return;
      }
      
      if (grammaticalWords.has(cleanTextLower)) {
        return; // Skip grammatical function words
      }
      
      // Additional check: analyze the word in a sentence context using compromise
      // This helps catch words that compromise might not tag correctly in isolation
      // Create a test sentence to see how compromise analyzes it
      const testSentence = `I met ${cleanText} yesterday.`;
      const testDoc = nlp(testSentence);
      const testTerms = testDoc.terms().out("array") as any[];
      const testWordTerm = testTerms.find(t => {
        const tText = (t.text || "").toLowerCase().replace(/[.,!?;:]/g, "");
        return tText === cleanTextLower;
      });
      
      if (testWordTerm) {
        const testTags = testWordTerm.tags || [];
        const testIsPronoun = testTags.some((tag: string) => tag.includes("Pronoun"));
        const testIsDeterminer = testTags.some((tag: string) => tag.includes("Determiner"));
        const testIsVerb = testTags.some((tag: string) => tag.includes("Verb"));
        const testIsAdjective = testTags.some((tag: string) => tag.includes("Adjective"));
        const testIsAdverb = testTags.some((tag: string) => tag.includes("Adverb"));
        const testIsCommonNoun = testTags.some((tag: string) => 
          tag.includes("Noun") && !tag.includes("ProperNoun")
        );
        
        // If compromise tags it as grammatical in a sentence context, skip it
        if (testIsPronoun || testIsDeterminer || testIsVerb || testIsAdjective || testIsAdverb) {
          return;
        }
        
        // If it's a common noun in sentence context, skip it (prevents "work" from "from work")
        if (testIsCommonNoun && !isProperNoun) {
          return;
        }
      }
      
      // Check if previous word(s) contain a name indicator
      // Check up to 2 words back to catch patterns like "talking with" → "henry"
      let appearsAfterIndicator = false;
      if (index > 0) {
        // Check immediate previous term
        const prevTerm = allTerms[index - 1];
        const prevText = (prevTerm?.text || "").toLowerCase().replace(/[.,!?;:]/g, "");
        if (nameIndicators.includes(prevText)) {
          appearsAfterIndicator = true;
        }
        
        // Also check 2 terms back for patterns like "talking with" → "henry"
        // where "with" is the immediate previous term but "talking" is also a name indicator
        if (!appearsAfterIndicator && index > 1) {
          const prevTerm2 = allTerms[index - 2];
          const prevText2 = (prevTerm2?.text || "").toLowerCase().replace(/[.,!?;:]/g, "");
          // If previous term is "with", "to", "on", "at" and term before that is a verb indicator
          if (["with", "to", "on", "at"].includes(prevText) && 
              ["talking", "speaking", "went", "jumped", "walked", "ran", "met", "meet", "meeting"].includes(prevText2)) {
            appearsAfterIndicator = true;
          }
        }
      }
      
      // Also check in the full text for patterns like "with Zayn", "with zayn", "talking to henry", "and then Michael"
      // Handle direct patterns, patterns with prepositions, and patterns with words in between
      const textLower = plainText.toLowerCase();
      const appearsAfterIndicatorInText = nameIndicators.some(indicator => {
        // Direct pattern: "indicator X" (e.g., "with henry", "met zayn", "saw cindy")
        const directPattern = new RegExp(`\\b${indicator}\\s+${cleanTextLower}\\b`, "i");
        if (directPattern.test(textLower)) return true;
        
        // Pattern with one word in between: "indicator WORD X" (e.g., "and then Michael", "saw someone like cindy")
        // Allow common words like "then", "also", "even", "just", "really" between indicator and name
        const oneWordBetween = new RegExp(`\\b${indicator}\\s+\\w+\\s+${cleanTextLower}\\b`, "i");
        if (oneWordBetween.test(textLower)) {
          // Verify the word in between isn't a name indicator itself (avoid false positives)
          const betweenMatch = textLower.match(new RegExp(`\\b${indicator}\\s+(\\w+)\\s+${cleanTextLower}\\b`, "i"));
          if (betweenMatch && betweenMatch[1]) {
            const wordBetween = betweenMatch[1].toLowerCase();
            // Common connector words that can appear between indicators and names
            const connectors = ["then", "also", "even", "just", "really", "sometimes", "maybe", "probably", "somewhere", "somehow"];
            if (connectors.includes(wordBetween) || !nameIndicators.includes(wordBetween)) {
              return true;
            }
          }
        }
        
        // Pattern with "to": "indicator to X" (e.g., "talking to henry", "went to zayn")
        if (["talking", "speaking", "went", "go", "going", "walked", "walk", "ran", "run"].includes(indicator)) {
          const toPattern = new RegExp(`\\b${indicator}\\s+to\\s+${cleanTextLower}\\b`, "i");
          if (toPattern.test(textLower)) return true;
        }
        
        // Pattern with "with": "indicator with X" (e.g., "talking with henry", "went with cindy")
        if (["talking", "speaking", "went", "go", "going", "walked", "walk", "met", "meet", "meeting", "jumped", "jump", "played", "play"].includes(indicator)) {
          const withPattern = new RegExp(`\\b${indicator}\\s+with\\s+${cleanTextLower}\\b`, "i");
          if (withPattern.test(textLower)) return true;
        }
        
        // Pattern with "on": "indicator on X" (e.g., "jumped on cindy", "saw on screen Michael")
        if (["jumped", "jump", "went", "go", "going", "ran", "run", "walked", "walk", "saw", "see"].includes(indicator)) {
          const onPattern = new RegExp(`\\b${indicator}\\s+on\\s+${cleanTextLower}\\b`, "i");
          if (onPattern.test(textLower)) return true;
        }
        
        return false;
      });
      
      // Decision logic - STRICT: Only add if passes comprehensive validation
      // We now use isValidPersonName() for ALL potential names to avoid false positives
      // This prevents words like "Today", "Osmows" from being detected as names
      
      // Quick pre-filter: Only process if it looks name-like
      const looksLikeName = cleanText.length >= 2 && cleanText.length <= 20 && /^[A-Za-z-]+$/.test(cleanText);
      if (!looksLikeName) return;
      
      // Skip if it's clearly not a name based on basic checks
      if (isVerb || isCommonNoun || isAdjective || isAdverb) return;
      
      // Now apply the STRICT validation function
      // This checks if compromise consistently tags it as a name across multiple contexts
      if (isValidPersonName(cleanText, plainText)) {
        potentialNames.push(cleanText);
      }
    });
    
    // CRITICAL FIX: Filter compromise's people() results using smart NLP validation
    // Don't blindly trust compromise - validate each word using linguistic analysis
    const filteredPeople = people.filter((person) => {
      return isValidPersonName(person, plainText);
    });
    
    // Combine filtered compromise results with our carefully detected names
    const allPeople = [...filteredPeople, ...potentialNames];
    
    // Normalize: capitalize first letter of each word, remove duplicates (case-insensitive)
    // IMPORTANT: Preserve multi-word names (e.g., "Mary Jane" stays as "Mary Jane", not "Maryjane")
    const normalizedNames = allPeople
      .map((name) => {
        // Remove punctuation but preserve spaces (for multi-word names)
        // Also remove apostrophes and quotes that might create malformed names like "Guyhenrywhat's"
        const clean = name.replace(/[.,!?;:'"]/g, "").trim();
        if (clean.length <= 1) return null; // Filter out single characters
        
        // Filter out names that are suspiciously long (likely concatenated words)
        // Most names are 2-20 characters per word, so a single "name" over 25 chars is suspicious
        if (clean.length > 25 && !clean.includes(" ")) {
          return null; // Likely a concatenated phrase, not a real name
        }
        
        // Normalize: capitalize first letter of each word, lowercase rest
        // Split by spaces to handle multi-word names properly
        const words = clean.split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) return null;
        
        // Filter out words that contain non-letter characters (except hyphens for names like "Mary-Jane")
        const validWords = words.filter(word => /^[a-zA-Z-]+$/.test(word));
        if (validWords.length === 0) return null;
        
        // Capitalize first letter of each word, lowercase the rest
        // Also deduplicate repeated words (e.g. "Michael Michael" -> "Michael")
        const uniqueWords = new Set<string>();
        const normalizedWords: string[] = [];
        
        validWords.forEach(word => {
          // Handle hyphenated names (e.g., "Mary-Jane")
          const normalizedWord = word.split("-")
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join("-");
            
          const lowerWord = normalizedWord.toLowerCase();
          if (!uniqueWords.has(lowerWord)) {
            uniqueWords.add(lowerWord);
            normalizedWords.push(normalizedWord);
          }
        });
        
        const normalized = normalizedWords.join(" ");
        
        return normalized;
      })
      .filter((name): name is string => name !== null && name.length > 1); // Remove nulls and single chars
    
    // Use case-insensitive deduplication
    const seen = new Set<string>();
    result.people = normalizedNames.filter((name) => {
      const lower = name.toLowerCase().trim();
      if (seen.has(lower)) {
        return false; // Already seen (case-insensitive)
      }
      seen.add(lower);
      return true;
    });
  } catch (error) {
    console.error("Error extracting people:", error);
  }

  // 2. Extract topics (nouns) using compromise
  try {
    const doc = nlp(plainText);
    
    // HOW COMPROMISE WORKS:
    // compromise analyzes text and tags each word with parts of speech
    // .nouns() = gets all nouns
    // .not("#Pronoun") = excludes pronouns (our, your, my, etc.)
    // .not("#Determiner") = excludes determiners (the, a, an, this, that)
    // .not("#Preposition") = excludes prepositions (in, on, at, with)
    // .not("#Conjunction") = excludes conjunctions (and, or, but)
    // .not("#Adjective") = excludes adjectives (great, good, bad, etc.)
    // .not("#Adverb") = excludes adverbs (very, really, today, etc.)
    // .not("#Value") = excludes numbers
    //
    // This is MUCH smarter than hardcoding word lists - it uses linguistic analysis!
    // CRITICAL: Exclude proper nouns (names) and people - these should only appear in people extraction, not topics
    const nouns = doc
      .nouns()
      .not("#Pronoun")           // Filters out pronouns: our, your, my, his, her, their, etc.
      .not("#Determiner")        // Filters out determiners: the, a, an, this, that, these, those
      .not("#Preposition")       // Filters out prepositions: in, on, at, with, for, of, to
      .not("#Conjunction")       // Filters out conjunctions: and, or, but, so
      .not("#Adjective")         // Filters out adjectives: great, good, bad, nice, etc.
      .not("#Adverb")            // Filters out adverbs: very, really, today, tomorrow, etc.
      .not("#Value")             // Filters out numbers
      .not("#ProperNoun")        // CRITICAL: Exclude proper nouns (names) - compromise's built-in filter
      .not("#Person")            // CRITICAL: Exclude people/names - compromise's built-in filter
      .out("array") as string[];
    
    // Minimal stop words list - only for words compromise might miss
    // Most filtering is done by compromise's .not() filters above
    const stopWords = new Set([
      "is", "are", "was", "were", "be", "been", "being", // Verbs that might slip through
      "have", "has", "had", "do", "does", "did"          // Common verbs
    ]);
    
    // CRITICAL: Filter out pronouns that compromise might miss
    // These are common pronouns that slip through as nouns (like "it", "her", "him", "they", "guy")
    const commonPronouns = new Set([
      // Personal pronouns
      "it", "its", "he", "him", "she", "her", "they", "them", "we", "us",
      // Possessive pronouns
      "his", "hers", "theirs", "ours", "yours", "mine",
      // Demonstrative pronouns
      "this", "that", "these", "those",
      // Interrogative pronouns
      "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
      // Common words that are often pronouns
      "guy", "guys", "person", "people", "thing", "things", "stuff",
    ]);
    
    // Additional filter: exclude adjectives and adverbs that compromise might classify as nouns
    // These words don't work well as topics in prompts
    const invalidTopicWords = new Set([
      "great", "good", "bad", "nice", "fine", "okay", "ok", "well", "better", "best", "worst",
      "big", "small", "large", "little", "huge", "tiny", "long", "short", "high", "low",
      "new", "old", "young", "hot", "cold", "warm", "cool", "fast", "slow", "quick",
      "easy", "hard", "difficult", "simple", "complex", "important", "special", "normal",
      "today", "tomorrow", "yesterday", "now", "then", "here", "there", "where", "when",
      "very", "really", "quite", "too", "so", "much", "many", "more", "most", "less", "least",
    ]);
    
    // Extract single words from noun phrases and filter
    // CRITICAL: Also filter out proper nouns (names) that might have slipped through
    const singleWordTopics = nouns
      .flatMap((noun) => {
        // Split phrases into individual words
        return noun.split(/\s+/).filter((word) => word.length > 2);
      })
      .filter((word) => {
        const lower = word.toLowerCase().replace(/[.,!?;:]/g, "");
        // Filter out stop words, pronouns, invalid topic words, and very short words
        if (
          stopWords.has(lower) ||
          commonPronouns.has(lower) ||
          invalidTopicWords.has(lower) ||
          lower.length <= 2
        ) {
          return false;
        }
        
        // CRITICAL: Check if this word is a proper noun (name) using compromise
        // This catches names that compromise's .not() filters might have missed
        try {
          const testDoc = nlp(word);
          const terms = testDoc.terms().out("array") as any[];
          const wordTerm = terms.find(t => {
            const tText = (t.text || "").toLowerCase().replace(/[.,!?;:]/g, "");
            return tText === lower;
          });
          
          if (wordTerm) {
            const tags = wordTerm.tags || [];
            // If compromise tags it as a proper noun or person, exclude it
            const isProperNoun = tags.some((tag: string) => 
              tag.includes("ProperNoun") || tag.includes("Person")
            );
            if (isProperNoun) {
              return false; // This is a name, exclude it
            }
          }
        } catch (error) {
          // If compromise fails, allow it (better to include than exclude incorrectly)
        }
        
        return true;
      })
      .map((word) => word.toLowerCase().replace(/[.,!?;:]/g, ""));
    
    result.topics = [...new Set(singleWordTopics)].slice(0, 10); // Limit to top 10 topics
  } catch (error) {
    console.error("Error extracting topics:", error);
  }

  // 3. Extract dates using chrono-node
  try {
    const dateResults = chrono.parse(plainText);
    result.dates = dateResults.map((result) => result.start.date());
  } catch (error) {
    console.error("Error extracting dates:", error);
  }

  // Filter out blacklisted words from people and topics
  result.people = result.people.filter(person => !isBlacklisted(person));
  result.topics = result.topics.filter(topic => !isBlacklisted(topic));

  return result;
}
