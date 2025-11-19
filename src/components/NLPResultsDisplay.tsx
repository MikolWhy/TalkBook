"use client";

// Component to display NLP extraction results
// This is a reusable component that can be used anywhere to show extracted metadata
// Props: extracted metadata from extractMetadata() function

interface NLPResultsDisplayProps {
  people: string[];
  topics: string[];
  dates: Date[];
  sentiment: number;
}

export default function NLPResultsDisplay({
  people,
  topics,
  dates,
  sentiment,
}: NLPResultsDisplayProps) {
  // Helper function to format sentiment score
  const getSentimentLabel = (score: number): string => {
    if (score > 0.3) return "Positive";
    if (score < -0.3) return "Negative";
    return "Neutral";
  };

  const getSentimentColor = (score: number): string => {
    if (score > 0.3) return "text-green-600";
    if (score < -0.3) return "text-red-600";
    return "text-gray-600";
  };

  // Helper function to format dates
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Information</h3>

      {/* People Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">People Mentioned:</h4>
        {people.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {people.map((person, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
              >
                {person}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No people found</p>
        )}
      </div>

      {/* Topics Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Topics:</h4>
        {topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
              >
                {topic}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No topics found</p>
        )}
      </div>

      {/* Dates Section */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Dates Mentioned:</h4>
        {dates.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dates.map((date, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
              >
                {formatDate(date)}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No dates found</p>
        )}
      </div>

      {/* Sentiment Section */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Sentiment:</h4>
        <div className="flex items-center gap-3 mb-2">
          <span className={`font-semibold ${getSentimentColor(sentiment)}`}>
            {getSentimentLabel(sentiment)}
          </span>
          <span className="text-sm text-gray-600">({sentiment.toFixed(2)})</span>
        </div>
        <p className="text-xs text-gray-500">
          Range: -1 (very negative) to +1 (very positive). 0 = neutral.
        </p>
      </div>

      {/* Debug Info Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• People found: {people.length}</p>
          <p>• Topics found: {topics.length}</p>
          <p>• Dates found: {dates.length}</p>
          <p>• Check browser console (F12) for detailed extraction logs</p>
        </div>
      </div>
    </div>
  );
}

