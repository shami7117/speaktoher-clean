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

// Define tier priorities (adjust based on your needs) - CASE INSENSITIVE
const TIER_PRIORITIES = {
  'money': 1,
  'Money': 1,
  'love': 1,
  'Love': 1,
  'career': 2,
  'Career': 2,
  'health': 2,
  'Health': 2,
  'family': 2,
  'Family': 2,
  'friendship': 3,
  'Friendship': 3,
  // Add more categories and their tiers as needed
};

// Helper function to get tier priority case-insensitively
function getTierPriority(category: string): number {
  // First try exact match
  if (TIER_PRIORITIES[category as keyof typeof TIER_PRIORITIES]) {
    return TIER_PRIORITIES[category as keyof typeof TIER_PRIORITIES];
  }
  
  // Try case-insensitive match
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(TIER_PRIORITIES)) {
    if (key.toLowerCase() === lowerCategory) {
      return value;
    }
  }
  
  return 999; // Default tier for unknown categories
}

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

// Function to find matching categories with improved scoring
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
      
      // Method 1: Exact input match (highest priority)
      if (inputLower === keywordLower) {
        matchedKeywords.add(keyword);
        score += 15; // Very high score for exact matches
        console.log(`EXACT MATCH: "${inputLower}" === "${keywordLower}" in category ${category}`);
        continue;
      }
      
      // Method 2: Exact phrase match with word boundaries (high score)
      const keywordWithBoundaries = ` ${keywordLower} `;
      if (inputText.includes(keywordWithBoundaries)) {
        matchedKeywords.add(keyword);
        score += 10; // High score for exact phrase matches
        console.log(`PHRASE MATCH: "${inputText}" includes "${keywordWithBoundaries}" in category ${category}`);
        continue;
      }
      
      // Method 3: Multi-word keyword matching
      const keywordWords = keywordLower.split(/\s+/);
      if (keywordWords.length > 1) {
        // For multi-word keywords, check if all words are present
        const allWordsPresent = keywordWords.every(kw => 
          inputWords.some(iw => iw === kw || (kw.length > 3 && iw.includes(kw)))
        );
        
        if (allWordsPresent) {
          matchedKeywords.add(keyword);
          score += 8; // Good score for multi-word matches
          console.log(`MULTI-WORD MATCH: "${keywordLower}" in category ${category}`);
          continue;
        }
      }
      
      // Method 4: Individual word matching - SIMPLIFIED AND IMPROVED
      if (keywordWords.length === 1) {
        for (const inputWord of inputWords) {
          // Exact word match (best for single words)
          if (inputWord === keywordLower) {
            matchedKeywords.add(keyword);
            score += 12; // High score for exact word matches
            console.log(`WORD MATCH: "${inputWord}" === "${keywordLower}" in category ${category}`);
            break;
          }
          
          // Special handling for abbreviations and partial matches
          if (inputWord.length >= 2 && keywordLower.length >= 2) {
            // Check if input is abbreviation of keyword (like "bf" for "boyfriend")
            if (keywordLower.startsWith(inputWord) || inputWord.startsWith(keywordLower)) {
              matchedKeywords.add(keyword);
              score += 8; // Good score for prefix matches
              console.log(`PREFIX MATCH: "${inputWord}" matches "${keywordLower}" in category ${category}`);
              break;
            }
            
            // Check for substring matches
            if (inputWord.includes(keywordLower) || keywordLower.includes(inputWord)) {
              const similarity = Math.min(inputWord.length, keywordLower.length) / Math.max(inputWord.length, keywordLower.length);
              if (similarity > 0.4) { // Further reduced threshold
                matchedKeywords.add(keyword);
                score += 4; // Moderate score for partial matches
                console.log(`SUBSTRING MATCH: "${inputWord}" matches "${keywordLower}" in category ${category}, similarity: ${similarity}`);
                break;
              }
            }
          }
        }
      }
    }
    
    if (score > 0) {
      const tier = getTierPriority(category);
      matches.push({ category, score, tier });
      console.log(`Category ${category} scored ${score} points with tier ${tier}`);
    }
  }
  
  console.log(`Total matches found: ${matches.length}`);
  return matches;
}

// Function to select best matching category - IMPROVED
function selectBestCategory(matches: Array<{category: string, score: number, tier: number}>): string | null {
  console.log('Selecting best category from matches:', matches);
  
  if (matches.length === 0) {
    console.log('No matches found');
    return null;
  }
  
  // Lower threshold to 1 for very permissive matching
  const strongMatches = matches.filter(match => match.score >= 1);
  console.log('Strong matches (score >= 1):', strongMatches);
  
  if (strongMatches.length === 0) {
    console.log('No strong matches, trying highest scoring match');
    const highestScore = Math.max(...matches.map(m => m.score));
    const bestMatches = matches.filter(m => m.score === highestScore);
    console.log('Best matches by score:', bestMatches);
    if (bestMatches.length > 0) {
      return bestMatches[0].category;
    }
    return null;
  }
  
  // Sort by score first (higher is better), then by tier (lower is better)
  strongMatches.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score; // Higher score wins
    }
    return a.tier - b.tier; // Lower tier wins
  });
  
  console.log('Selected category:', strongMatches[0].category);
  return strongMatches[0].category;
}

// Function to get random whisper from category - CASE INSENSITIVE
function getRandomWhisper(category: string, whispers: WhispersMap): Whisper | null {
  console.log(`Looking for whispers in category: "${category}"`);
  console.log('Available whisper categories:', Object.keys(whispers));
  
  // First try exact match
  if (whispers[category] && Array.isArray(whispers[category]) && whispers[category].length > 0) {
    const categoryWhispers = whispers[category];
    const randomIndex = Math.floor(Math.random() * categoryWhispers.length);
    console.log(`Found ${categoryWhispers.length} whispers in category "${category}", selected index ${randomIndex}`);
    return categoryWhispers[randomIndex];
  }
  
  // If exact match fails, try case-insensitive search
  const lowerCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(whispers)) {
    if (key.toLowerCase() === lowerCategory) {
      console.log(`Found case-insensitive match: "${key}" for "${category}"`);
      if (Array.isArray(value) && value.length > 0) {
        const randomIndex = Math.floor(Math.random() * value.length);
        console.log(`Found ${value.length} whispers in category "${key}", selected index ${randomIndex}`);
        return value[randomIndex];
      }
    }
  }
  
  console.log(`No whispers found for category "${category}" (case-insensitive search failed)`);
  return null;
}

// Function to get fallback whisper
function getFallbackWhisper(inputType: 'gibberish' | 'offensive' | 'unknown'): Whisper {
  try {
    const fallbackPath = path.join(process.cwd(), 'data', 'fallback.txt');
    const fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    
    if (Array.isArray(fallbackData) && fallbackData.length > 0) {
      const randomIndex = Math.floor(Math.random() * fallbackData.length);
      return fallbackData[randomIndex];
    }
    
    return fallbackData;
  } catch (error) {
    console.error('Error reading fallback data:', error);
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
        whisperResponse = getFallbackWhisper('unknown');
        categoryUsed = 'fallback_no_whispers';
        fallbackReason = 'no_whispers_in_category';
      }
    } else {
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