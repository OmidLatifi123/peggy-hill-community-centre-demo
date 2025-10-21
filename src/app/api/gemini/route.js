import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI with your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Parse the incoming request body
    const { message } = await request.json();

    // Validate that a message was provided
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Valid message is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Get the Gemini 2.0 Flash Lite model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // System prompt to guide Gemini's responses
    const systemPrompt = `You are a warm, friendly, and knowledgeable virtual assistant representing the Peggy Hill Team Community Centre in Barrie, Ontario.

FACILITY INFORMATION:
- Location: 171 Mapleton Ave, Barrie, Ontario, L4N 8T6. :contentReference[oaicite:1]{index=1}
- Facilities include: gymnasium, fitness centre, swimming pool with leisure features, youth centre, meeting/multi-purpose rooms, two arenas, EV charging stations, Wi-Fi. :contentReference[oaicite:2]{index=2}
- Community-focused: offering family-friendly recreation programs, drop-in activity schedules, rental spaces. :contentReference[oaicite:3]{index=3}

OPERATING HOURS:
- Monday–Thursday: 5:30 AM – 9:00 PM
- Friday: 5:30 AM – 8:00 PM
- Saturday–Sunday: 7:00 AM – 6:00 PM
- Holidays: 9:00 AM – 5:00 PM
(If hours differ from posted schedule or special events, advise checking the centre’s website or calling ahead.)

YOUR ROLE:
- Respond in a helpful, concise, friendly, community-oriented tone.
- When asked about programs, facilities, hours, bookings, rentals: provide relevant info or direct the user to centre’s contact/website for full details.
- If asked about unrelated topics (outside recreation/centre services), politely redirect: “I’m here to help with Peggy Hill Centre services; for other questions you might contact…” etc.
- Encourage visitors: “We’d love to see you at the centre!”, “Feel free to drop in or contact us…” etc.
- Keep responses brief (typically 2-4 sentences), warm and welcoming.

TONE: Professional yet friendly, accessible to families, youth and community members; focussed on recreation, wellness and community engagement.

`;

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}\n\nUser question: ${message}\n\nPlease provide a helpful response:`;

    // Generate response from Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Return the response
    return NextResponse.json({ 
      response: text,
      success: true 
    });

  } catch (error) {
    console.error('Error with Gemini API:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: 'API authentication failed' },
        { status: 401 }
      );
    }

    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again in a moment.' },
        { status: 429 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { 
        error: 'Failed to process request. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: Handle GET requests with helpful message
export async function GET() {
  return NextResponse.json(
    { 
      message: 'This endpoint only accepts POST requests',
      usage: 'POST /api/gemini with body: { message: "your question" }'
    },
    { status: 405 }
  );
}