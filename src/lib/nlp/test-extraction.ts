/**
 * Test File for NLP Extraction and Prompt Generation
 * 
 * Use this file to test how extraction and prompt generation works
 * Run with: npx ts-node src/lib/nlp/test-extraction.ts
 * 
 * Or copy code into browser console to test in real-time
 */

import { extractMetadata } from "./extract";
import { generatePrompts } from "./prompts";

// Test text - modify this to test different scenarios
const testText = `
Today I was talking to Henry at his house, we hung out and danced alot. 
It was pretty fun, sarah joy and zayn were all there too.
we got food after at a korean bbq place and it was super fun, got some stains on my shirt though..
`;

async function testExtraction() {
  console.log("=".repeat(60));
  console.log("TESTING EXTRACTION");
  console.log("=".repeat(60));
  console.log("\n📝 Test Text:");
  console.log(testText);
  console.log("\n");
  
  // Extract metadata
  const result = await extractMetadata(testText);
  
  console.log("✅ Extraction Results:");
  console.log("People:", result.people);
  console.log("Topics:", result.topics);
  console.log("Dates:", result.dates);
  
  return result;
}

async function testPromptGeneration() {
  console.log("\n");
  console.log("=".repeat(60));
  console.log("TESTING PROMPT GENERATION");
  console.log("=".repeat(60));
  
  const metadata = await testExtraction();
  
  // Generate prompts
  const prompts = await generatePrompts(metadata, "cozy", 5, testText);
  
  console.log("\n✅ Generated Prompts:");
  prompts.forEach((prompt, index) => {
    console.log(`${index + 1}. ${prompt.text} (${prompt.type})`);
  });
  
  console.log("\n");
  console.log("=".repeat(60));
  console.log("ANALYSIS");
  console.log("=".repeat(60));
  
  // Analyze what was filtered
  console.log("\n🔍 Analysis:");
  console.log(`- ${metadata.people.length} people extracted`);
  console.log(`- ${metadata.topics.length} topics extracted`);
  console.log(`- ${prompts.length} prompts generated`);
  
  // Check for common problems
  const problematicTopics = metadata.topics.filter(topic => {
    const lower = topic.toLowerCase();
    return ["it", "her", "him", "they", "guy", "thing"].includes(lower);
  });
  
  if (problematicTopics.length > 0) {
    console.log("\n⚠️  PROBLEM: These pronouns slipped through:");
    console.log(problematicTopics);
    console.log("\n💡 Fix: Add these to commonPronouns in extract.ts line ~326");
  }
  
  // Check for awkward prompts
  const awkwardPrompts = prompts.filter(p => {
    return p.text.includes("How did") && p.text.includes("go?");
  });
  
  if (awkwardPrompts.length > 0) {
    console.log("\n⚠️  PROBLEM: These prompts might be awkward:");
    console.log(awkwardPrompts.map(p => p.text));
    console.log("\n💡 Fix: Add pattern to awkwardPatterns in prompts.ts line ~336");
  }
}

// Run tests
if (require.main === module) {
  testPromptGeneration().catch(console.error);
}

export { testExtraction, testPromptGeneration };

