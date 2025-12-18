/**
 * Analytics Insights Generator
 * 
 * Generates readable insights from user data for the stats page.
 * Provides encouraging, actionable feedback based on journaling and habit patterns.
 * 
 * @module src/lib/analytics/insights.ts
 */

interface JournalEntry {
    createdAt: string;
    content: string;
    mood?: string | null;
}

interface HabitLog {
    date: string;
    value: number;
}

export interface Insight {
    type: "positive" | "neutral" | "suggestion";
    icon: string;
    title: string;
    description: string;
}

/**
 * Generate mood-based insights
 */
export function generateMoodInsights(entries: JournalEntry[], timeRange: number): Insight[] {
    const insights: Insight[] = [];

    if (entries.length === 0) {
        return [{
            type: "suggestion",
            icon: "💭",
            title: "Start tracking your mood",
            description: "Add mood tags to your journal entries to see patterns over time."
        }];
    }

    // Count moods
    const moodCounts: Record<string, number> = {};
    const positiveMoods = new Set(["very-happy", "happy", "excited", "calm"]);
    const negativeMoods = new Set(["sad", "very-sad", "anxious", "angry"]);

    let positiveCount = 0;
    let negativeCount = 0;

    entries.forEach(entry => {
        if (entry.mood) {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
            if (positiveMoods.has(entry.mood)) positiveCount++;
            if (negativeMoods.has(entry.mood)) negativeCount++;
        }
    });

    const totalWithMood = positiveCount + negativeCount;

    if (totalWithMood > 0) {
        const positivePercentage = Math.round((positiveCount / totalWithMood) * 100);

        if (positivePercentage >= 70) {
            insights.push({
                type: "positive",
                icon: "🌟",
                title: "Great mood trend!",
                description: `${positivePercentage}% of your entries show positive emotions. Keep it up!`
            });
        } else if (positivePercentage >= 50) {
            insights.push({
                type: "neutral",
                icon: "📊",
                title: "Balanced emotions",
                description: `Your mood is fairly balanced. Journaling can help process our feelings.`
            });
        } else {
            insights.push({
                type: "suggestion",
                icon: "💙",
                title: "We notice you",
                description: "Remember it's okay to feel difficult emotions. Journaling is a great tool for processing them."
            });
        }
    }

    // Most common mood
    const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    if (sortedMoods.length > 0) {
        const [topMood, count] = sortedMoods[0];
        const moodLabels: Record<string, string> = {
            "very-happy": "very happy",
            "happy": "happy",
            "calm": "calm",
            "excited": "excited",
            "neutral": "neutral",
            "anxious": "anxious",
            "sad": "sad",
            "angry": "angry",
            "very-sad": "very sad"
        };

        insights.push({
            type: "neutral",
            icon: "🎯",
            title: "Most common mood",
            description: `You've felt ${moodLabels[topMood] || topMood} in ${count} ${count === 1 ? 'entry' : 'entries'}.`
        });
    }

    return insights;
}

/**
 * Generate writing pattern insights
 */
export function generateWritingInsights(entries: JournalEntry[], timeRange: number): Insight[] {
    const insights: Insight[] = [];

    if (entries.length === 0) {
        return [{
            type: "suggestion",
            icon: "✍️",
            title: "Start your journey",
            description: "Write your first entry to begin tracking your progress."
        }];
    }

    // Calculate average words per entry
    const wordCounts = entries.map(e => {
        const plainText = e.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        return plainText.split(/\s+/).filter(w => w.length > 0).length;
    });

    const avgWords = Math.round(wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length);

    if (avgWords > 200) {
        insights.push({
            type: "positive",
            icon: "📝",
            title: "Detailed reflections",
            description: `You average ${avgWords} words per entry. Your thoughtful writing shows deep self-reflection.`
        });
    } else if (avgWords > 100) {
        insights.push({
            type: "neutral",
            icon: "📝",
            title: "Consistent writing",
            description: `You average ${avgWords} words per entry. Quality matters more than quantity!`
        });
    }

    // Consistency check
    const daysWithEntries = new Set(
        entries.map(e => new Date(e.createdAt).toISOString().split('T')[0])
    ).size;

    const consistencyRate = Math.round((daysWithEntries / timeRange) * 100);

    if (consistencyRate >= 50) {
        insights.push({
            type: "positive",
            icon: "🔥",
            title: "Excellent consistency",
            description: `You've written on ${daysWithEntries} of the last ${timeRange} days (${consistencyRate}%).`
        });
    } else if (consistencyRate >= 25) {
        insights.push({
            type: "neutral",
            icon: "📅",
            title: "Building a habit",
            description: `You've written on ${daysWithEntries} days. Try to journal a bit more regularly for better insights.`
        });
    }

    return insights;
}

/**
 * Generate mood-activity correlation insights
 */
export function generateMoodActivityCorrelation(entries: JournalEntry[]): Insight[] {
    const insights: Insight[] = [];

    if (entries.length < 5) {
        return []; // Need enough data for meaningful correlation
    }

    // Group entries by mood and calculate average word count
    const moodWordCounts: Record<string, number[]> = {};

    entries.forEach(entry => {
        if (entry.mood) {
            const plainText = entry.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
            const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;

            if (!moodWordCounts[entry.mood]) {
                moodWordCounts[entry.mood] = [];
            }
            moodWordCounts[entry.mood].push(wordCount);
        }
    });

    // Find mood with highest average word count
    let maxMood = "";
    let maxAvg = 0;

    const moodLabels: Record<string, string> = {
        "very-happy": "very happy",
        "happy": "happy",
        "calm": "calm",
        "grateful": "grateful",
        "excited": "excited",
        "neutral": "neutral",
        "anxious": "anxious",
        "sad": "sad",
        "angry": "angry",
        "very-sad": "very sad"
    };

    Object.entries(moodWordCounts).forEach(([mood, counts]) => {
        if (counts.length >= 2) { // Need at least 2 entries for this mood
            const avg = counts.reduce((sum, c) => sum + c, 0) / counts.length;
            if (avg > maxAvg) {
                maxAvg = avg;
                maxMood = mood;
            }
        }
    });

    if (maxMood && maxAvg > 50) {
        insights.push({
            type: "neutral",
            icon: "✨",
            title: "Writing & mood connection",
            description: `You write more when feeling ${moodLabels[maxMood] || maxMood} (avg ${Math.round(maxAvg)} words).`
        });
    }

    return insights;
}

/**
 * Generate comparative metrics (this week vs last week)
 */
export function generateComparativeMetrics(entries: JournalEntry[]): Insight[] {
    const insights: Insight[] = [];

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const thisWeekEntries = entries.filter(e => new Date(e.createdAt) >= oneWeekAgo);
    const lastWeekEntries = entries.filter(e => {
        const date = new Date(e.createdAt);
        return date >= twoWeeksAgo && date < oneWeekAgo;
    });

    if (thisWeekEntries.length === 0 && lastWeekEntries.length === 0) {
        return [];
    }

    // Compare entry counts
    const thisWeekCount = thisWeekEntries.length;
    const lastWeekCount = lastWeekEntries.length;

    if (lastWeekCount > 0) {
        const percentChange = Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

        if (percentChange > 20) {
            insights.push({
                type: "positive",
                icon: "📈",
                title: "Writing more this week",
                description: `You've written ${thisWeekCount} entries this week, up ${percentChange}% from last week!`
            });
        } else if (percentChange < -20) {
            insights.push({
                type: "suggestion",
                icon: "📉",
                title: "Less active this week",
                description: `You wrote ${thisWeekCount} entries this week, down from ${lastWeekCount} last week. Every entry counts!`
            });
        } else if (thisWeekCount > 0 && lastWeekCount > 0) {
            insights.push({
                type: "neutral",
                icon: "📊",
                title: "Steady journaling",
                description: `You've maintained a consistent pace with ${thisWeekCount} entries this week.`
            });
        }
    } else if (thisWeekCount > 0) {
        insights.push({
            type: "positive",
            icon: "🎉",
            title: "Great start!",
            description: `You've written ${thisWeekCount} ${thisWeekCount === 1 ? 'entry' : 'entries'} this week. Keep building the habit!`
        });
    }

    // Compare mood trends
    const positiveMoods = new Set(["very-happy", "happy", "excited", "grateful", "calm"]);

    const thisWeekPositive = thisWeekEntries.filter(e => e.mood && positiveMoods.has(e.mood)).length;
    const lastWeekPositive = lastWeekEntries.filter(e => e.mood && positiveMoods.has(e.mood)).length;

    const thisWeekWithMood = thisWeekEntries.filter(e => e.mood).length;
    const lastWeekWithMood = lastWeekEntries.filter(e => e.mood).length;

    if (thisWeekWithMood >= 3 && lastWeekWithMood >= 3) {
        const thisWeekPositiveRate = (thisWeekPositive / thisWeekWithMood) * 100;
        const lastWeekPositiveRate = (lastWeekPositive / lastWeekWithMood) * 100;
        const moodChange = thisWeekPositiveRate - lastWeekPositiveRate;

        if (moodChange > 15) {
            insights.push({
                type: "positive",
                icon: "😊",
                title: "Mood improving",
                description: `Your positive mood entries increased by ${Math.round(moodChange)}% this week!`
            });
        }
    }

    return insights;
}

/**
 * Extract most used words from entries
 */
export function extractTopWords(entries: JournalEntry[], limit: number = 20): Array<{ word: string; count: number }> {
    // Common stop words to exclude
    const stopWords = new Set([
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", "it", "for", "not", "on", "with", "he", "as", "you",
        "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one",
        "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when",
        "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some",
        "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back",
        "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these",
        "give", "day", "most", "us", "is", "was", "am", "are", "been", "being", "had", "has", "did", "does", "doing", "very",
        "really", "too", "much", "many", "more", "less", "few", "little", "big", "small", "long", "short", "high", "low"
    ]);

    const wordCounts: Record<string, number> = {};

    entries.forEach(entry => {
        // Strip HTML and get plain text
        const plainText = entry.content.replace(/<[^>]*>/g, " ").toLowerCase();

        // Extract words (alphanumeric only, 3+ chars)
        const words = plainText.match(/\b[a-z]{3,}\b/g) || [];

        words.forEach(word => {
            if (!stopWords.has(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
    });

    // Convert to array and sort by count
    return Object.entries(wordCounts)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}
