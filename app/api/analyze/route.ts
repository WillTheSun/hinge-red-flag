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
        "Control or manipulation: Potential hint in statement about 'tie up'",
        "Overly sexual content: 'I'm looking for an open-minded cutie to tie up'",
        "Superficiality: Focus on achievements and social scenarios",
      ],
      green_flags: [
        "Engaging in various hobbies and interests",
        "Education and career achievements",
        "Appears sociable and outgoing"
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
    const jsonMatch = rawResult.match(/```json\n([\s\S]*?)\n```/);
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