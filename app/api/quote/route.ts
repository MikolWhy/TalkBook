import { NextResponse } from 'next/server';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Add cache-busting timestamp to ensure we get a new quote each time
    const timestamp = Date.now();
    const response = await fetch(
      `http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en&t=${timestamp}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Disable Next.js caching
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }

    // Get response as text first to handle malformed JSON
    const text = await response.text();

    // Try to parse JSON, handling potential escape character issues
    let data;
    try {
      // Clean up common JSON issues: unescaped quotes, backslashes, etc.
      const cleanedText = text
        .replace(/\\'/g, "'")  // Fix escaped single quotes
        .replace(/\\"/g, '"')  // Fix escaped double quotes
        .replace(/\\n/g, '\n') // Fix escaped newlines
        .replace(/\\r/g, '\r') // Fix escaped carriage returns
        .replace(/\\t/g, '\t'); // Fix escaped tabs

      data = JSON.parse(cleanedText);
    } catch (parseError) {
      // If parsing still fails, try to extract quote manually using regex
      const quoteMatch = text.match(/"quoteText"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
      const authorMatch = text.match(/"quoteAuthor"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);

      if (quoteMatch || authorMatch) {
        data = {
          quoteText: quoteMatch ? quoteMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : '',
          quoteAuthor: authorMatch ? authorMatch[1].replace(/\\"/g, '"') : 'Unknown'
        };
      } else {
        throw new Error('Failed to parse quote response');
      }
    }

    // Return with cache control headers
    return NextResponse.json(
      {
        quoteText: data.quoteText || '',
        quoteAuthor: data.quoteAuthor || 'Unknown'
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Return a fallback quote
    return NextResponse.json({
      quoteText: "The journey of a thousand miles begins with one step.",
      quoteAuthor: "Lao Tzu"
    });
  }
}

