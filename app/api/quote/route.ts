import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'http://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
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
    
    return NextResponse.json({
      quoteText: data.quoteText || '',
      quoteAuthor: data.quoteAuthor || 'Unknown'
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Return a fallback quote
    return NextResponse.json({
      quoteText: "The journey of a thousand miles begins with one step.",
      quoteAuthor: "Lao Tzu"
    });
  }
}

