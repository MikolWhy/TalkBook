// utility functions - helper functions used throughout app
// date formatting, text processing, and other utilities
//
// WHAT WE'RE CREATING:
// - Reusable helper functions used across multiple components and pages
// - Date formatting (convert Date to "yyyy-mm-dd" string, format for display)
// - Text processing (strip HTML, count words, truncate text)
// - Other utilities (debounce, classNames)
//
// OWNERSHIP:
// - Aadil implements this completely
//
// COORDINATION NOTES:
// - Used by many components and pages
// - Keep functions simple and focused (one function = one task)
//
// CONTEXT FOR AI ASSISTANTS:
// - This file contains reusable helper functions
// - Used across multiple components and pages
// - Keep functions pure (no side effects, same input = same output)
//
// DEVELOPMENT NOTES:
// - Functions should be simple and focused
// - Document what each function does
// - Consider performance for frequently called functions
// - Use dayjs for date operations (already installed)
//
// TODO: implement utility functions
//
// DATE UTILITIES:
// - formatDateKey(date: Date): convert Date to "yyyy-mm-dd" string (for database keys)
// - formatDate(date: Date | string): format date for display (e.g., "Jan 15, 2025")
// - getTodayKey(): get today's date as "yyyy-mm-dd" string
// - getDaysAgo(days: number): get date N days ago as "yyyy-mm-dd" string
//
// TEXT UTILITIES:
// - truncateText(text: string, maxLength: number): truncate text with ellipsis
// - stripHtml(html: string): remove HTML tags, return plain text (for NLP processing)
// - wordCount(text: string): count words in text (for statistics)
//
// OTHER UTILITIES:
// - debounce(func, delay): debounce function calls (for search inputs)
// - classNames(...classes): combine CSS class names (helper for conditional classes)
//
// SYNTAX: export function functionName(params): ReturnType { ... }

// TODO: implement utility functions

