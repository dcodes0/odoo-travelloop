import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/session';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request) {
  try {
    const session = await getIronSession(await cookies(), sessionOptions);
    if (!session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured.' }, { status: 503 });
    }

    const { type, tripName, tripDescription, cityName, startDate, endDate } = await request.json();

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'stop') {
      systemPrompt = `You are an expert travel planner. When given a trip name and description, suggest 3-5 ideal city stops for the trip. Respond ONLY with a valid JSON array of objects. Each object must have: cityName (string), reason (string, 1 sentence why it fits this trip), arrivalDay (number, day of trip), departureDay (number, must be >= arrivalDay). Do not include any text before or after the JSON array.`;
      userPrompt = `Trip: "${tripName}"
Description: "${tripDescription || 'A wonderful travel adventure'}"
Trip dates: ${startDate} to ${endDate}

Suggest 3-5 cities to visit on this trip as a JSON array.`;
    } else if (type === 'activity') {
      systemPrompt = `You are an expert travel planner. When given a city and trip context, suggest 5-7 specific activities to do there. Respond ONLY with a valid JSON array of objects. Each object must have: title (string), type (one of: Sightseeing, Food, Adventure, Culture, Shopping, Relaxation, Transport, Accommodation), duration (number in minutes, e.g. 120), cost (number, estimated cost in USD), description (string, 1-2 sentences). Do not include any text before or after the JSON array.`;
      userPrompt = `Trip: "${tripName}"
Description: "${tripDescription || 'A wonderful travel adventure'}"
City/Stop: "${cityName}"

Suggest 5-7 activities for this city on this trip as a JSON array.`;
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "stop" or "activity".' }, { status: 400 });
    }

    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('[AI] Groq error:', err);
      return NextResponse.json({ error: 'AI service error.' }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content || '[]';

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return NextResponse.json({ error: 'AI returned invalid format.' }, { status: 502 });

    const suggestions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ suggestions });
  } catch (e) {
    console.error('[AI] Error:', e);
    return NextResponse.json({ error: 'Failed to get AI suggestions.' }, { status: 500 });
  }
}
