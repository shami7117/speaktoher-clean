
import aliasMap from '../../../../data/aliasMap.json';
import whispersData from '../../../../data/whispers.json';
// Type for a single whisper object
type Whisper = {
  mirror: string;
  whisper_start: string;
  blurred_reveal: string;
  encouragement: string;
};
// Type for the whispers map
type WhispersMap = Record<string, Whisper[]>;
const whispers = whispersData as WhispersMap;
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get('input');

  if (!input || typeof input !== 'string') {
    return new Response(JSON.stringify({ error: 'Query parameter "input" is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const normalizedInput = input.toLowerCase().trim();
  let matchedCategory: string | null = null;

  for (const [category, keywords] of Object.entries(aliasMap)) {
    if (keywords.some((keyword: string) => normalizedInput.includes(keyword.toLowerCase()))) {
      matchedCategory = category;
      break;
    }
  }

  let whisperResponse: any = null;

  if (
    matchedCategory &&
    Object.prototype.hasOwnProperty.call(whispers, matchedCategory) &&
    Array.isArray(whispers[matchedCategory]) &&
    whispers[matchedCategory].length > 0
  ) {
    const categoryWhispers = whispers[matchedCategory];
    const randomIndex = Math.floor(Math.random() * categoryWhispers.length);
    whisperResponse = categoryWhispers[randomIndex];
  } else {
    // Use fallback.txt content
  try {
  const fallbackPath = path.join(process.cwd(), 'data', 'fallback.txt');

  const fallbackJson = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
whisperResponse = fallbackJson;
//   const fallbackRaw = fs.readFileSync(fallbackPath, 'utf8').trim();

//   // If fallback file contains JSON:
//   if (fallbackRaw.startsWith('{')) {
//     whisperResponse = JSON.parse(fallbackRaw);
//   } else {
//     // If fallback is plain text, apply it to all fields
//     whisperResponse = {
//       mirror: fallbackRaw,
//       whisper_start: fallbackRaw,
//       blurred_reveal: fallbackRaw,
//       encouragement: fallbackRaw
//     };
//   }
} catch (error) {
  console.error('Error reading fallback.txt:', error);
  return new Response(JSON.stringify({ error: 'Fallback file missing or unreadable.' }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}

  }

  return new Response(
    JSON.stringify({
      input: normalizedInput,
      category: matchedCategory ?? 'fallback',
      whisper: whisperResponse
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
