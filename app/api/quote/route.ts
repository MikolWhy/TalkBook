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

    const data = await response.json();
    
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

