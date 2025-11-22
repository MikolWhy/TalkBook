// extracts people names and topics from journal entry text using compromise nlp
// used by prompt generation and stats - all processing happens client-side

import nlp from "compromise";
import { isBlacklisted } from "../blacklist/manager";

// strips html tags from rich text editor content to get plain text for nlp
function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// extracts people names and topics from journal entry text
// takes html string from editor, returns people and topics arrays
export async function extractMetadata(
  text: string
): Promise<{
  people: string[];
  topics: string[];
}> {
  if (!text || text.trim().length === 0) {
    return { people: [], topics: [] };
  }

  const plainText = stripHTML(text);
  const result = { people: [] as string[], topics: [] as string[] };

  // minimal blacklist of grammatical words that are never names
  // mostly relies on nlp analysis, this is just for function words
  const grammaticalWords = new Set([
    "on", "in", "at", "to", "from", "with", "about", "after", "before", "during", "until", "for",
    "by", "under", "over", "through", "between", "among", "into", "onto", "upon",
    "and", "or", "but", "so", "yet", "nor", "for", "because", "although", "though", "since", "if", "unless", "while",
    "the", "a", "an", "this", "that", "these", "those", "some", "any", "each", "every", "either", "neither", "both", "all",
    "i", "me", "my", "mine", "myself", "you", "your", "yours", "yourself",
    "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself",
    "we", "us", "our", "ours", "ourselves", "they", "them", "their", "theirs", "themselves",
    "not", "very", "too", "so", "just", "only", "also", "even", "still", "already", "yet"
  ]);

  // checks if a word is actually a person name using compromise's linguistic analysis
  // tests the word in multiple sentence contexts to get accurate tags
  const isValidPersonName = (word: string, originalContext: string): boolean => {
    const cleanWord = word.replace(/[.,!?;:'"]/g, "").trim();
    const cleanWordLower = cleanWord.toLowerCase();
    
    if (grammaticalWords.has(cleanWordLower)) {
      return false;
    }
    
    // test word in different sentence patterns to see how compromise tags it
    const testSentences = [
      `I met ${cleanWord} yesterday.`,
      `${cleanWord} is a person.`,
      `I was talking with ${cleanWord}.`
    ];
    
    let nameCount = 0;
    let nounCount = 0;
    let verbCount = 0;
    let otherGrammaticalCount = 0;
    
    for (const sentence of testSentences) {
      const testDoc = nlp(sentence);
      const detectedPeople = testDoc.people().out("array") as string[];
      const isPerson = detectedPeople.some(p => p.toLowerCase().trim() === cleanWordLower);
      
      if (isPerson) {
        nameCount += 2;
      }
      
      const properNounMatch = testDoc.match(`#ProperNoun`);
      if (properNounMatch.found) {
        const properNouns = properNounMatch.out("array") as string[];
        if (properNouns.some(noun => noun.toLowerCase().trim() === cleanWordLower)) {
          nameCount++;
        }
      }
      
      const commonNounMatch = testDoc.match(`#Noun`).not("#ProperNoun");
      if (commonNounMatch.found) {
        const commonNouns = commonNounMatch.out("array") as string[];
        if (commonNouns.some(noun => noun.toLowerCase().trim() === cleanWordLower)) {
          nounCount++;
        }
      }
      
      const verbMatch = testDoc.match(`#Verb`);
      if (verbMatch.found) {
        const verbs = verbMatch.out("array") as string[];
        if (verbs.some(verb => verb.toLowerCase().trim() === cleanWordLower)) {
          verbCount++;
        }
      }
      
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
    
    // voting system: if compromise consistently tags it as name → it's a name
    // if tagged as verb/grammatical word → not a name
    
    if (verbCount > 0 || otherGrammaticalCount > 0) {
      return false;
    }
    
    if (nameCount >= 2) {
      return true;
    }
    
    if (nameCount > 0 && nounCount === 0) {
      return true;
    }
    
    // check if word appears after name indicators like "met", "with", "called"
    const nameIndicators = ["met", "with", "called", "texted", "saw", "spoke to", "talked to", "talking with"];
    const contextLower = originalContext.toLowerCase();
    const hasNameIndicator = nameIndicators.some(indicator => {
      const pattern = new RegExp(`\\b${indicator}\\s+${cleanWordLower}\\b`, "i");
      return pattern.test(contextLower);
    });
    
    if (hasNameIndicator && nameCount > 0 && verbCount === 0 && otherGrammaticalCount === 0) {
      return true;
    }
    
    return false;
  };

  // extract people names using compromise
  try {
    const doc = nlp(plainText);
    const people = doc.people().out("array") as string[];
    const allTerms = doc.terms().out("array") as any[];
    
    // words that often come before names in natural language
    const nameIndicators = [
      "with", "to", "from", "about", "and", "or", "on", "at",
      "met", "talked", "talking", "saw", "called", "texted", "emailed", "visited",
      "went", "came", "spoke", "speaking", "hang", "hanging", "meet", "meeting",
      "jumped", "jump", "ran", "run", "walked", "walk", "sat", "sit", "stood", "stand",
      "played", "play", "worked", "work", "studied", "study"
    ];
    
    const potentialNames: string[] = [];
    
    allTerms.forEach((term, index) => {
      const text = term.text || term;
      const tags = term.tags || [];
      const cleanText = text.replace(/[.,!?;:]/g, "");
      const cleanTextLower = cleanText.toLowerCase();
      
      if (cleanText.length <= 1) return;
      
      const isProperNoun = tags.some((tag: string) => tag.includes("ProperNoun") || tag.includes("Person"));
      const isCapitalized = text[0] === text[0].toUpperCase() && text[0] !== text[0].toLowerCase();
      
      const isCommonNoun = tags.some((tag: string) => 
        tag.includes("Noun") && !tag.includes("ProperNoun")
      );
      const isVerb = tags.some((tag: string) => tag.includes("Verb"));
      const isAdjective = tags.some((tag: string) => tag.includes("Adjective"));
      const isAdverb = tags.some((tag: string) => tag.includes("Adverb"));
      const isPronoun = tags.some((tag: string) => tag.includes("Pronoun"));
      const isDeterminer = tags.some((tag: string) => tag.includes("Determiner"));
      
      if (isPronoun || isDeterminer) {
        return;
      }
      
      if (grammaticalWords.has(cleanTextLower)) {
        return;
      }
      
      // test word in sentence context to see how compromise tags it
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
      
      const looksLikeName = cleanText.length >= 2 && cleanText.length <= 20 && /^[A-Za-z-]+$/.test(cleanText);
      if (!looksLikeName) return;
      
      if (isVerb || isCommonNoun || isAdjective || isAdverb) return;
      
      if (isValidPersonName(cleanText, plainText)) {
        potentialNames.push(cleanText);
      }
    });
    
    // validate compromise results using linguistic analysis
    const filteredPeople = people.filter((person) => {
      return isValidPersonName(person, plainText);
    });
    
    const allPeople = [...filteredPeople, ...potentialNames];
    
    // normalize names: capitalize first letter, preserve multi-word names, remove duplicates
    const normalizedNames = allPeople
          .map((name) => {
        const clean = name.replace(/[.,!?;:'"]/g, "").trim();
        if (clean.length <= 1) return null;
        
        // skip suspiciously long names (likely concatenated)
        if (clean.length > 25 && !clean.includes(" ")) {
          return null;
        }
        
        const words = clean.split(/\s+/).filter(word => word.length > 0);
        if (words.length === 0) return null;
        
        const validWords = words.filter(word => /^[a-zA-Z-]+$/.test(word));
        if (validWords.length === 0) return null;
        
        const uniqueWords = new Set<string>();
        const normalizedWords: string[] = [];
        
        validWords.forEach(word => {
          // handle hyphenated names like "Mary-Jane"
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
      .filter((name): name is string => name !== null && name.length > 1);
    
    // case-insensitive deduplication
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

  // extract topics (nouns) using compromise
  try {
    const doc = nlp(plainText);
    
    // compromise tags words by part of speech, we filter out grammatical words and names
    const nouns = doc
      .nouns()
      .not("#Pronoun")
      .not("#Determiner")
      .not("#Preposition")
      .not("#Conjunction")
      .not("#Adjective")
      .not("#Adverb")
      .not("#Value")
      .not("#ProperNoun")
      .not("#Person")
      .out("array") as string[];
    
    // extra stop words for things compromise might miss
    const stopWords = new Set([
      "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did"
    ]);
    
    // filter out pronouns that might slip through
    const commonPronouns = new Set([
      "it", "its", "he", "him", "she", "her", "they", "them", "we", "us",
      "his", "hers", "theirs", "ours", "yours", "mine",
      "this", "that", "these", "those",
      "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
      "guy", "guys", "person", "people", "thing", "things", "stuff",
    ]);
    
    // exclude adjectives/adverbs that don't work as topics
    const invalidTopicWords = new Set([
      "great", "good", "bad", "nice", "fine", "okay", "ok", "well", "better", "best", "worst",
      "big", "small", "large", "little", "huge", "tiny", "long", "short", "high", "low",
      "new", "old", "young", "hot", "cold", "warm", "cool", "fast", "slow", "quick",
      "easy", "hard", "difficult", "simple", "complex", "important", "special", "normal",
      "today", "tomorrow", "yesterday", "now", "then", "here", "there", "where", "when",
      "very", "really", "quite", "too", "so", "much", "many", "more", "most", "less", "least",
    ]);
    
    // split noun phrases into words and filter
    const singleWordTopics = nouns
      .flatMap((noun) => {
        return noun.split(/\s+/).filter((word) => word.length > 2);
      })
      .filter((word) => {
        const lower = word.toLowerCase().replace(/[.,!?;:]/g, "");
        if (
          stopWords.has(lower) ||
          commonPronouns.has(lower) ||
          invalidTopicWords.has(lower) ||
          lower.length <= 2
        ) {
          return false;
        }
        
        // check if word is a proper noun (name) that slipped through
        try {
          const testDoc = nlp(word);
          const terms = testDoc.terms().out("array") as any[];
          const wordTerm = terms.find(t => {
            const tText = (t.text || "").toLowerCase().replace(/[.,!?;:]/g, "");
            return tText === lower;
          });
          
          if (wordTerm) {
            const tags = wordTerm.tags || [];
            const isProperNoun = tags.some((tag: string) => 
              tag.includes("ProperNoun") || tag.includes("Person")
            );
            if (isProperNoun) {
              return false;
            }
          }
        } catch (error) {
          // if compromise fails, allow it
        }
        
        return true;
      })
      .map((word) => word.toLowerCase().replace(/[.,!?;:]/g, ""));
    
    result.topics = [...new Set(singleWordTopics)].slice(0, 10);
  } catch (error) {
    console.error("Error extracting topics:", error);
  }

  // remove blacklisted words
  result.people = result.people.filter(person => !isBlacklisted(person));
  result.topics = result.topics.filter(topic => !isBlacklisted(topic));

  return result;
}
