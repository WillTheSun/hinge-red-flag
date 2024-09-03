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
      red_flag_score: 55,
      red_flags: [
        "Overly idealized expectations: 'I'm looking for an open-minded cutie to tie up'",
        "Inflexibility: None observed",
        "Control or manipulation: Potential hint in statement about 'tie up'",
        "Disrespect for boundaries: None observed",
        "Lack of direction: None observed",
        "Preference for privacy: None observed",
        "Self-victimization: None observed",
        "Unresolved past issues: None observed",
        "Insecurity: None observed",
        "Emotional unavailability: None observed",
        "Negative or hostile traits: None observed",
        "Lack of accountability: None observed",
        "Risky behaviors: None observed",
        "Overly sexual content: 'I'm looking for an open-minded cutie to tie up'",
        "Superficiality: Focus on achievements and social scenarios",
        "Misrepresentation: None observed (e.g., photos appear genuine)"
      ],
      green_flags: [
        "Engaging in various hobbies and interests",
        "Education and career achievements",
        "Appears sociable and outgoing"
      ]
    };

    return NextResponse.json({ result: hardcodedResponse });
  }

  // Existing code for production environment
  const { image } = await request.json();
  const prompt = readFileSync(join(process.cwd(), 'prompt.txt'), 'utf-8');
  
  try {
    const rawResult = await processImageWithOpenAI(image, prompt);
    console.log('Raw result:', rawResult);

    // Parse the result directly, as it should now be in JSON format
    const result = JSON.parse(rawResult.replace(/^```json\n|\n```$/g, ''));
    
    // Validate the parsed result structure
    if (!('red_flag_score' in result) || !('red_flags' in result) || !('green_flags' in result)) {
      throw new Error('Invalid result structure from OpenAI');
    }

    console.log('Parsed result:', result);
    return NextResponse.json({ result: result });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Error processing image' }, { status: 500 });
  }
}