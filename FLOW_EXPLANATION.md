# TalkBook: Complete Flow Explanation

## 📊 **The Entire Pipeline**

### **Stage 1: Saving an Entry**
```
User types in editor → Click "Save Entry" → Content stored in localStorage
```
- Content is saved as **HTML** (from rich text editor)
- Stored in `localStorage` under key `"journalEntries"`
- Draft entries are marked as `draft: true`
- Only non-draft entries are used for extraction

**NO extraction happens at save time!**

---

### **Stage 2: Opening "New Entry" Page**
```
Page loads → useEffect runs → Extraction starts
```

The `useEffect` hook runs **immediately when the page loads** and does this:

1. **Fetch from localStorage:**
   - Get all entries from `localStorage.getItem("journalEntries")`
   - Filter for **last 7 days** (for name extraction)
   - Filter for **last 3 entries** (for topic extraction)
   - Exclude drafts

2. **Combine text:**
   - Merge content from filtered entries into one big string
   - Strip HTML tags → Convert to plain text

3. **Extract metadata:**
   - Run `extractMetadata(combinedText)`
   - Extract: **People, Topics, Dates, Sentiment**

4. **Generate prompts:**
   - Run `generatePrompts(extractedData)`
   - Create Prompt objects with templates

5. **Filter prompts:**
   - Remove used prompts (from `localStorage`)
   - Remove expired prompts (older than 7 days)

6. **Display in UI:**
   - Set state: `setAllPrompts(finalPrompts)`
   - React re-renders with new prompts

---

## 🔍 **What "Cozy" and Sentiment Do**

### **Tone: "cozy"**
The app has 3 tone options (though only "cozy" is currently used):
- `cozy`: Warm, friendly templates
- `reflective`: Thoughtful, introspective templates
- `curious`: Inquisitive, exploratory templates

**Example templates:**
```typescript
PROMPT_TEMPLATES = {
  cozy: {
    person: [
      "Tell me about {entity}.",
      "What's on your mind about {entity}?",
      "Anything happen with {entity}?"
    ]
  }
}
```

### **Sentiment Score**
Currently, sentiment is **barely used**. It only does this:

```typescript
// For people, prefer supportive templates if sentiment is negative
if (type === "person" && sentiment < -0.2) {
  const supportive = templates.find(t => 
    t.includes("How did things go") || 
    t.includes("How's") || 
    t.includes("What happened")
  );
  if (supportive) return supportive;
}
```

**That's it!** The sentiment score (0 to 1) is calculated but barely impacts anything.

---

## 🎯 **Template Selection Logic**

Here's how a template is chosen:

1. **Get tone templates:** `PROMPT_TEMPLATES["cozy"]`
2. **Get entity type:** Person, Topic, or Date
3. **Select template:**
   - If sentiment < -0.2: Try to use supportive template
   - Otherwise: **Rotate through templates** based on index
   - `templates[index % templates.length]`

**Example:**
```
Names: ['Cindy', 'Michael', 'Sarah']
Index: 0, 1, 2

Cindy (0) → templates[0 % 4] = templates[0] = "Tell me about Cindy."
Michael (1) → templates[1 % 4] = templates[1] = "What's on your mind about Michael?"
Sarah (2) → templates[2 % 4] = templates[2] = "Anything happen with Sarah?"
```

This gives **variety** without needing complex logic.

---

## ⚠️ **What Was Causing the Issues**

Based on the working extraction now, here's what was likely broken before:

### 1. **No Debug Visibility**
Without logs, we couldn't see:
- Are entries being saved properly?
- Is HTML being stripped?
- Are names being extracted?
- Are prompts being generated?
- Are they being filtered out incorrectly?

### 2. **False Positives in Extraction**
Words like **"For"** were being extracted as names! This happens because:
- "For" appears after "Sarah" in the sentence
- Gets capitalized somehow
- Passes the name detection logic

**Fix:** Add "for" to `commonNonNames` set.

### 3. **Overly Aggressive Filtering**
The `isValidPrompt()` function has LOTS of checks that might filter out valid names:
- Pronoun checks
- Stop word checks
- Grammar checks
- Length checks

If a name matches any of these, it gets filtered out.

### 4. **Timing Issues**
If `useEffect` runs before localStorage is ready, or if entries aren't saved properly, extraction would fail silently.

---

## 🎨 **Should We Keep Sentiment?**

**Current usage:** Almost none
**Complexity:** Adds processing time and dependencies
**Benefit:** Minimal (only affects template selection slightly)

### **My Recommendation:**
**Remove sentiment analysis for now.** Here's why:

1. **Not needed for core functionality** - Prompts work fine without it
2. **Adds complexity** - Extra library (wink-sentiment), extra processing
3. **Can add back later** - If you want mood-based features, easy to re-enable
4. **Faster extraction** - One less thing to process

**What to keep:**
- ✅ Name extraction (compromise.js)
- ✅ Topic extraction (compromise.js)  
- ✅ Date extraction (chrono-node)
- ❌ Sentiment analysis (wink-sentiment) ← Remove

Would you like me to:
1. **Remove sentiment analysis** completely?
2. **Keep it but simplify** template selection (ignore sentiment)?
3. **Keep as is** for future use?

