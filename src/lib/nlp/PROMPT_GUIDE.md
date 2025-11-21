# How to Use Extracted Data for Prompts

## Understanding Sentiment

**Sentiment Score Range: -1 to +1**
- **-1 to -0.3**: Negative (sad, frustrated, worried)
- **-0.3 to 0.3**: Neutral (balanced, factual)
- **0.3 to 1**: Positive (happy, excited, optimistic)

**Example:**
- Text: "I'm feeling lazy and procrastinating" → Score: ~-0.4 (Negative)
- Text: "Great day! Everything went perfectly" → Score: ~0.8 (Positive)

## How to Use Extracted Data for Prompts

### Problem with Fill-in-the-Blank Approach

❌ **Bad Example:**
```
"How did {topic} go?"
→ "How did project go?" (awkward)
```

✅ **Better Approach: Use Context-Aware Templates**

### Template Strategy

Instead of simple fill-in-the-blanks, use **context-aware templates** that adapt based on:
1. **Entity Type** (person vs topic vs date)
2. **Sentiment** (positive vs negative)
3. **Grammar** (proper sentence structure)

### Example Templates

#### For People:
```typescript
// Cozy tone
"How did things go with {person}?"
"What happened with {person}?"
"Tell me more about {person}."

// Neutral tone  
"How did your interaction with {person} go?"
"What's new with {person}?"
```

#### For Topics:
```typescript
// Cozy tone
"How's {topic} going?"
"Any progress on {topic}?"
"Tell me more about {topic}."

// Neutral tone
"Any updates on {topic}?"
"Status update on {topic}?"
```

#### For Dates:
```typescript
// Cozy tone
"You mentioned {date}. How did it go?"
"Did {date} happen as planned?"

// Neutral tone
"Did {date} occur as mentioned?"
```

### Smart Prompt Generation

**Step 1: Prioritize by Type**
1. People (most engaging)
2. Topics (good variety)
3. Dates (fill remaining slots)

**Step 2: Match Template to Context**
- If sentiment was negative → Use supportive prompts
- If sentiment was positive → Use follow-up prompts
- If neutral → Use general prompts

**Step 3: Avoid Weird Sentences**
- Don't use: "How did {topic} go?" → "How did project go?" ❌
- Use: "How's {topic} going?" → "How's project going?" ✅
- Or: "Any progress on {topic}?" → "Any progress on project?" ✅

### Example Implementation

```typescript
function generatePrompt(entity: string, type: "person" | "topic" | "date", tone: "cozy" | "neutral"): string {
  if (type === "person") {
    return tone === "cozy" 
      ? `How did things go with ${entity}?`
      : `How did your interaction with ${entity} go?`;
  }
  
  if (type === "topic") {
    return tone === "cozy"
      ? `How's ${entity} going?`
      : `Any updates on ${entity}?`;
  }
  
  // ... etc
}
```

## References

- **Open Source Examples:**
  - Journaling apps: Day One, Journey (check their prompt systems)
  - AI writing assistants: Grammarly, Notion AI (for template ideas)
  
- **Best Practices:**
  - Use natural language (not robotic)
  - Keep prompts short and conversational
  - Allow users to edit prompts before inserting
  - Track which prompts were used to avoid repetition

