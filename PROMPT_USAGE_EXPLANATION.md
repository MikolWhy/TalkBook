# Prompt Usage Flow - How It Works

## ✅ **Current Logic (Updated)**

### **When User Clicks a Prompt:**
1. `handleInsertPrompt()` is called
2. Prompt text is inserted into the editor
3. Prompt ID is added to `insertedPromptIds` (temporary memory)
4. The prompt **disappears from the UI** immediately

### **While Editing:**
- **CRITICAL CHANGE:** The system **no longer checks** if the prompt text still exists in the editor.
- This means you can **edit, rewrite, or completely change** the inserted header, and the prompt will **remain hidden/used** for this session.
- This prevents the annoying behavior where editing a prompt would make it reappear in the suggestions.

### **When User Saves Entry:**
1. `handleSave()` is called
2. Entry is saved to `localStorage`
3. **ONLY THEN** are prompts permanently marked as used:
   ```typescript
   insertedPromptIds.forEach((promptId) => {
     markPromptAsUsed(promptId);
   });
   ```
4. `markPromptAsUsed()` saves to `localStorage` under key `talkbook-used-prompts`

### **When User Exits Without Saving:**
1. User clicks "Back to Journal" or closes tab
2. React component unmounts
3. `insertedPromptIds` state is cleared (garbage collected)
4. Nothing is saved to `localStorage`
5. **Next time user creates a new entry:**
   - The prompt reappears (it was never marked as permanently used!)

## 🔄 **Data Flow:**

```
Click Prompt
  ↓
Add to insertedPromptIds (temporary)
  ↓
Hide from UI (FOREVER during this session)
  ↓
User Edits Header (Prompt stays hidden)
  ↓
┌─────────────────┬─────────────────┐
│   Save Entry    │  Exit/Cancel    │
├─────────────────┼─────────────────┤
│ Mark as used    │ Clear state     │
│ Save to LS      │ Prompt reappears│
│ Never shows     │ Can click again │
│ again           │                 │
└─────────────────┴─────────────────┘
```
