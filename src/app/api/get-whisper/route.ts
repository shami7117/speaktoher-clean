import aliasMap from '../../../../data/aliasMap.json';
import whispersData from '../../../../data/whispers.json';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

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

// Define tier priorities (adjust based on your needs)
const TIER_PRIORITIES = {
  'Money': 1,
  'Love': 1,
  'Career': 2,
  'Health': 2,
  'Family': 2,
  'Friendship': 3,
  // Add more categories and their tiers as needed
};

// Function to check if input is gibberish
function isGibberish(input: string): boolean {
  const cleanInput = input.replace(/[^a-zA-Z]/g, '').toLowerCase();
  if (cleanInput.length < 3) return false;
  
  // Check for repetitive patterns
  const hasRepeatingChars = /(.)\1{2,}/.test(cleanInput);
  
  // Check for random character sequences (very basic heuristic)
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';
  let vowelCount = 0;
  let consonantCount = 0;
  
  for (const char of cleanInput) {
    if (vowels.includes(char)) vowelCount++;
    if (consonants.includes(char)) consonantCount++;
  }
  
  const vowelRatio = vowelCount / cleanInput.length;
  const consonantRatio = consonantCount / cleanInput.length;
  
  // If too few vowels or too many consonants in a row, might be gibberish
  return hasRepeatingChars || vowelRatio < 0.1 || consonantRatio > 0.9;
}

// Function to check if input is offensive
function isOffensive(input: string): boolean {
  const offensivePatterns = [
    'suck me', 'fuck', 'shit', 'bitch', 'damn', 'hell',
    // Add more offensive patterns as needed
  ];
  
  const lowerInput = input.toLowerCase();
  return offensivePatterns.some(pattern => lowerInput.includes(pattern));
}

// Function to find matching categories with scoring
function findMatchingCategories(input: string, aliasMap: Record<string, string[]>): Array<{category: string, score: number, tier: number}> {
  const inputLower = input.toLowerCase().trim();
  const matches: Array<{category: string, score: number, tier: number}> = [];
  
  // Create word boundaries for input
  const inputWords = inputLower.split(/\s+/);
  const inputText = ` ${inputLower} `; // Add spaces for word boundary checking
  
  for (const [category, keywords] of Object.entries(aliasMap)) {
    let score = 0;
    const matchedKeywords = new Set<string>();
    
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase().trim();
      
      // Skip empty keywords
      if (!keywordLower) continue;
      
      // Method 1: Exact phrase match with word boundaries (highest score)
      const keywordWithBoundaries = ` ${keywordLower} `;
      if (inputText.includes(keywordWithBoundaries)) {
        matchedKeywords.add(keyword);
        score += keywordLower.length > 8 ? 10 : 8; // High score for exact phrase matches
        continue;
      }
      
      // Method 2: Multi-word keyword matching
      const keywordWords = keywordLower.split(/\s+/);
      if (keywordWords.length > 1) {
        // For multi-word keywords, check if all words are present
        const allWordsPresent = keywordWords.every(kw => 
          inputWords.some(iw => iw === kw || (kw.length > 3 && iw.includes(kw)))
        );
        
        if (allWordsPresent) {
          matchedKeywords.add(keyword);
          score += 6; // Good score for multi-word matches
          continue;
        }
      }
      
      // Method 3: Individual word matching with stricter rules
      const keywordWord = keywordWords[0]; // For single word keywords
      if (keywordWords.length === 1) {
        for (const inputWord of inputWords) {
          // Exact word match (best)
          if (inputWord === keywordWord) {
            matchedKeywords.add(keyword);
            score += 5;
            break;
          }
          
          // Partial match only for longer words (4+ chars) to avoid false positives
          if (keywordWord.length >= 4 && inputWord.length >= 4) {
            if (inputWord.includes(keywordWord) || keywordWord.includes(inputWord)) {
              // Additional check: ensure it's not just a common substring
              const similarity = Math.min(inputWord.length, keywordWord.length) / Math.max(inputWord.length, keywordWord.length);
              if (similarity > 0.6) { // At least 60% similarity
                matchedKeywords.add(keyword);
                score += 2;
                break;
              }
            }
          }
        }
      }
    }
    
    if (score > 0) {
      const tier = TIER_PRIORITIES[category as keyof typeof TIER_PRIORITIES] || 999;
      matches.push({ category, score, tier });
    }
  }
  
  return matches;
}

// Function to select best matching category
function selectBestCategory(matches: Array<{category: string, score: number, tier: number}>): string | null {
  if (matches.length === 0) return null;
  
  // Filter out weak matches (score < 3 to avoid false positives)
  const strongMatches = matches.filter(match => match.score >= 3);
  
  if (strongMatches.length === 0) return null;
  
  // Sort by tier (lower is better), then by score (higher is better)
  strongMatches.sort((a, b) => {
    if (a.tier !== b.tier) {
      return a.tier - b.tier; // Lower tier wins
    }
    return b.score - a.score; // Higher score wins
  });
  
  return strongMatches[0].category;
}

// Function to get random whisper from category
function getRandomWhisper(category: string, whispers: WhispersMap): Whisper | null {
  if (!whispers[category] || !Array.isArray(whispers[category]) || whispers[category].length === 0) {
    return null;
  }
  
  const categoryWhispers = whispers[category];
  const randomIndex = Math.floor(Math.random() * categoryWhispers.length);
  return categoryWhispers[randomIndex];
}

// Function to get fallback whisper
function getFallbackWhisper(inputType: 'gibberish' | 'offensive' | 'unknown'): Whisper {
  try {
    const fallbackPath = path.join(process.cwd(), 'data', 'fallback.txt');
    const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    
    // For now, using the same fallback for all types
    // You can create separate fallback files for different types if needed
    if (Array.isArray(fallbackData) && fallbackData.length > 0) {
      const randomIndex = Math.floor(Math.random() * fallbackData.length);
      return fallbackData[randomIndex];
    }
    
    // If fallback data is malformed, return a default
    return fallbackData;
  } catch (error) {
    console.error('Error reading fallback data:', error);
    // Return a hardcoded fallback as last resort
    return {
      mirror: "I hear you, and I'm here to help.",
      whisper_start: "This isn't about finding the right words. It's about...",
      blurred_reveal: "That quiet voice inside that's been waiting to be heard.",
      encouragement: "You're brave enough to keep asking. Come back. Ask again."
    };
  }
}

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
  let whisperResponse: Whisper;
  let categoryUsed: string;
  let fallbackReason: string | null = null;

  // Step 1: Check for gibberish
  if (isGibberish(normalizedInput)) {
    whisperResponse = getFallbackWhisper('gibberish');
    categoryUsed = 'fallback_gibberish';
    fallbackReason = 'gibberish_detected';
  }
  // Step 2: Check for offensive content
  else if (isOffensive(normalizedInput)) {
    whisperResponse = getFallbackWhisper('offensive');
    categoryUsed = 'fallback_offensive';
    fallbackReason = 'offensive_content';
  }
  // Step 3: Try to match with categories
  else {
    const matches = findMatchingCategories(normalizedInput, aliasMap);
    const bestCategory = selectBestCategory(matches);
    
    if (bestCategory) {
      const whisper = getRandomWhisper(bestCategory, whispers);
      if (whisper) {
        whisperResponse = whisper;
        categoryUsed = bestCategory;
      } else {
        // Category exists but no whispers available
        whisperResponse = getFallbackWhisper('unknown');
        categoryUsed = 'fallback_no_whispers';
        fallbackReason = 'no_whispers_in_category';
      }
    } else {
      // No matching category found
      whisperResponse = getFallbackWhisper('unknown');
      categoryUsed = 'fallback_unknown';
      fallbackReason = 'no_category_match';
    }
  }

  const response = {
    input: normalizedInput,
    category: categoryUsed,
    whisper: whisperResponse,
    ...(fallbackReason && { fallback_reason: fallbackReason }),
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        matches: findMatchingCategories(normalizedInput, aliasMap),
        is_gibberish: isGibberish(normalizedInput),
        is_offensive: isOffensive(normalizedInput)
      }
    })
  };

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}