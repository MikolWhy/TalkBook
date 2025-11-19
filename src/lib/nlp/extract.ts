// nlp extraction - extracts entities and sentiment from journal entry text
// uses compromise for people/topics, chrono-node for dates, wink-sentiment for sentiment
//
// WHAT WE'RE CREATING:
// - A function that reads journal entry text and extracts meaningful information
// - Extracts: people (names), topics (nouns), dates mentioned, emotional sentiment
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
// - wink-sentiment: analyzes emotional tone (positive/negative sentiment score)
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
// - Output: object with { people: string[], topics: string[], dates: Date[], sentiment: number }
// - Use compromise to extract people and topics
// - Use chrono-node to extract dates
// - Use wink-sentiment to get sentiment score
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
// wink-sentiment - try dynamic import for Next.js compatibility
let winkSentiment: any;
if (typeof window !== "undefined") {
  winkSentiment = require("wink-sentiment");
}

// Helper function to strip HTML tags from rich text editor content
// Converts HTML to plain text for NLP processing
function stripHTML(html: string): string {
  // Remove HTML tags using regex
  // This is safe because we're only processing user's own journal entries
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// Extract metadata from journal entry text
// Input: HTML string from rich text editor, optional list of prompt texts to exclude
// Output: Object with extracted people, topics, dates, and sentiment
// NOTE: Excludes inserted prompt headings from extraction (to avoid extracting from prompts themselves)
export async function extractMetadata(
  text: string,
  excludePromptTexts?: string[]
): Promise<{
  people: string[];
  topics: string[];
  dates: Date[];
  sentiment: number;
}> {
  // Handle empty text
  if (!text || text.trim().length === 0) {
    return {
      people: [],
      topics: [],
      dates: [],
      sentiment: 0,
    };
  }

  // Remove inserted prompt headings before extraction
  // This prevents extracting entities from prompt text itself
  let textToProcess = text;
  if (excludePromptTexts && excludePromptTexts.length > 0) {
    // Remove H3 headings that match prompt texts
    excludePromptTexts.forEach((promptText) => {
      // Escape special regex characters in prompt text
      const escapedPrompt = promptText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match H3 headings containing the prompt text
      const headingPattern = new RegExp(`<h3[^>]*>.*?${escapedPrompt}.*?</h3>`, "gi");
      textToProcess = textToProcess.replace(headingPattern, "");
    });
  }

  // Convert HTML to plain text
  const plainText = stripHTML(textToProcess);

  // Initialize result object
  const result = {
    people: [] as string[],
    topics: [] as string[],
    dates: [] as Date[],
    sentiment: 0,
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
    const nameIndicators = ["with", "to", "from", "about", "and", "or", "met", "talked", "saw", "called", "texted", "emailed", "visited"];
    
    // Find potential names using compromise's linguistic analysis
    const potentialNames: string[] = [];
    
    allTerms.forEach((term, index) => {
      const text = term.text || term;
      const tags = term.tags || [];
      const cleanText = text.replace(/[.,!?;:]/g, "");
      
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
      
      // Skip grammatical words - use compromise's tags strictly
      if (isPronoun || isDeterminer || isVerb || isAdjective || isAdverb) {
        return;
      }
      
      // Additional check: analyze the word in a sentence context using compromise
      // This helps catch words that compromise might not tag correctly in isolation
      // Create a test sentence to see how compromise analyzes it
      const cleanTextLower = cleanText.toLowerCase();
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
      
      // Check if previous word is a name indicator
      let appearsAfterIndicator = false;
      if (index > 0) {
        const prevTerm = allTerms[index - 1];
        const prevText = (prevTerm?.text || "").toLowerCase().replace(/[.,!?;:]/g, "");
        if (nameIndicators.includes(prevText)) {
          appearsAfterIndicator = true;
        }
      }
      
      // Also check in the full text for patterns like "with Zayn" or "with zayn"
      const textLower = plainText.toLowerCase();
      const appearsAfterIndicatorInText = nameIndicators.some(indicator => {
        const pattern = new RegExp(`\\b${indicator}\\s+${cleanTextLower}\\b`, "i");
        return pattern.test(textLower);
      });
      
      // Decision logic - be strict:
      // 1. If compromise says it's a ProperNoun → include it (strong signal)
      // 2. If capitalized AND appears after name indicator AND NOT a common noun → include
      // 3. If lowercase AND appears after name indicator AND compromise doesn't tag it as grammatical → include
      if (isProperNoun) {
        // Compromise identified it as a proper noun - trust it
        potentialNames.push(cleanText);
      } else if (isCapitalized && (appearsAfterIndicator || appearsAfterIndicatorInText) && !isCommonNoun) {
        // Capitalized word after name indicator, and not a common noun → likely a name
        // But verify it's not grammatical by checking in sentence context
        if (testWordTerm) {
          const testTags = testWordTerm.tags || [];
          const testIsGrammatical = testTags.some((tag: string) => 
            tag.includes("Pronoun") || tag.includes("Determiner") || tag.includes("Verb") ||
            tag.includes("Adjective") || tag.includes("Adverb")
          );
          if (!testIsGrammatical) {
            potentialNames.push(cleanText);
          }
        } else {
          potentialNames.push(cleanText);
        }
      } else if (!isCapitalized && (appearsAfterIndicator || appearsAfterIndicatorInText)) {
        // Lowercase word after name indicator → could be a name (like "zayn")
        // Check if compromise thinks it could be a proper noun in context
        if (testWordTerm) {
          const testTags = testWordTerm.tags || [];
          const testIsCommonNoun = testTags.some((tag: string) => 
            tag.includes("Noun") && !tag.includes("ProperNoun")
          );
          const testIsGrammatical = testTags.some((tag: string) => 
            tag.includes("Pronoun") || tag.includes("Determiner") || tag.includes("Verb") ||
            tag.includes("Adjective") || tag.includes("Adverb")
          );
          
          // If compromise doesn't tag it as a common noun or grammatical word, it might be a name
          if (!testIsCommonNoun && !testIsGrammatical && cleanText.length >= 2 && cleanText.length <= 15) {
            potentialNames.push(cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase());
          }
        }
      }
    });
    
    // Combine compromise's results with our detection
    const allPeople = [...people, ...potentialNames];
    
    // Normalize: capitalize first letter, remove duplicates
    result.people = [
      ...new Set(
        allPeople
          .map((name) => {
            // Remove punctuation
            const clean = name.replace(/[.,!?;:]/g, "");
            return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
          })
          .filter((name) => name.length > 1) // Filter out single characters
      ),
    ];
    
    console.log("🔍 People extraction debug:", { 
      compromisePeople: people, 
      potentialNames, 
      filtered: result.people 
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
    const nouns = doc
      .nouns()
      .not("#Pronoun")           // Filters out pronouns: our, your, my, his, her, their, etc.
      .not("#Determiner")        // Filters out determiners: the, a, an, this, that, these, those
      .not("#Preposition")       // Filters out prepositions: in, on, at, with, for, of, to
      .not("#Conjunction")       // Filters out conjunctions: and, or, but, so
      .not("#Adjective")         // Filters out adjectives: great, good, bad, nice, etc.
      .not("#Adverb")            // Filters out adverbs: very, really, today, tomorrow, etc.
      .not("#Value")             // Filters out numbers
      .out("array") as string[];
    
    // Minimal stop words list - only for words compromise might miss
    // Most filtering is done by compromise's .not() filters above
    const stopWords = new Set([
      "is", "are", "was", "were", "be", "been", "being", // Verbs that might slip through
      "have", "has", "had", "do", "does", "did"          // Common verbs
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
    const singleWordTopics = nouns
      .flatMap((noun) => {
        // Split phrases into individual words
        return noun.split(/\s+/).filter((word) => word.length > 2);
      })
      .filter((word) => {
        const lower = word.toLowerCase().replace(/[.,!?;:]/g, "");
        // Filter out stop words, invalid topic words, and very short words
        return (
          !stopWords.has(lower) &&
          !invalidTopicWords.has(lower) &&
          lower.length > 2
        );
      })
      .map((word) => word.toLowerCase().replace(/[.,!?;:]/g, ""));
    
    result.topics = [...new Set(singleWordTopics)].slice(0, 10); // Limit to top 10 topics
    
    console.log("🔍 Topics extraction debug:", { 
      rawNouns: nouns, 
      singleWordTopics, 
      filtered: result.topics 
    });
  } catch (error) {
    console.error("Error extracting topics:", error);
  }

  // 3. Extract dates using chrono-node
  try {
    const dateResults = chrono.parse(plainText);
    result.dates = dateResults.map((result) => result.start.date());
    console.log("🔍 Dates extraction debug:", { 
      found: dateResults.length, 
      dates: result.dates.map(d => d.toISOString()) 
    });
  } catch (error) {
    console.error("Error extracting dates:", error);
  }

  // 4. Analyze sentiment using wink-sentiment
  try {
    if (!winkSentiment) {
      // If not loaded, try to require it
      winkSentiment = require("wink-sentiment");
    }
    
    // wink-sentiment might export as default or named export
    const sentimentFn = winkSentiment.default || winkSentiment.sentiment || winkSentiment;
    const sentimentResult = sentimentFn(plainText);
    result.sentiment = sentimentResult.score; // Range: -1 (negative) to +1 (positive)
    console.log("🔍 Sentiment analysis debug:", { 
      score: result.sentiment, 
      tokens: sentimentResult.tokens?.slice(0, 5) // Show first 5 tokens
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    // Fallback: set neutral sentiment if analysis fails
    result.sentiment = 0;
  }

  console.log("✅ Final extraction result:", result);
  return result;
}
