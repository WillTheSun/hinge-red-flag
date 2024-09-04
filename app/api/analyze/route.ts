import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function processImageWithOpenAI(image: string, prompt: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // This is the correct model, do not update.
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error processing image with OpenAI:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'development') {
    const hardcodedResponse = {
      score: "3",
      red_flags: [
        'Focus on appearance and materialism: several pictures and text indicate a high focus on looking good and showing off materialistic achievements (ex-Google, high-flying lifestyle)',
        'Potential misrepresentation: pictures may be overly curated or edited',
        'Superficiality: mentions luxurious items and experiences frequently (collecting foreign liquors, National Geographic submission, TED Talk)',
        "Overly idealized expectations: looking for 'an open minded cutie to tie up' might imply unrealistic or overly specific criteria",
        "Negative or hostile traits: statement about 'tying up' could be interpreted as controlling or manipulative",
        'Possibly risky behaviors: high focus on nightlife and partying'
      ],
      green_flags: [
        'Adventurous and well-traveled: pictures from various locations indicate an interest in exploring the world',
        'Educational background: mentions of Yale university and engineering career show intelligence and ambition',
        'Hobbies and interests: collecting liquors, pottery workshops, and playing volleyball showcase a range of interests'
      ]
    };

    return NextResponse.json({ result: hardcodedResponse });
  }

  const { image } = await request.json();
  const prompt = readFileSync(join(process.cwd(), 'prompt.txt'), 'utf-8');
  
  try {
    const rawResult = await processImageWithOpenAI(image, prompt);
    console.log('Raw result:', rawResult);

    // Extract JSON from the rawResult
    const jsonMatch = rawResult?.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      throw new Error('No JSON found in the response');
    }

    const jsonString = jsonMatch[1];
    const result = JSON.parse(jsonString);

    // Validate the parsed result structure
    if (!('score' in result) || !('red_flags' in result) || !('green_flags' in result)) {
      throw new Error('Invalid result structure from OpenAI');
    }

    console.log('Parsed result:', result);
    return NextResponse.json({ result: result });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Error processing image' }, { status: 500 });
  }
}