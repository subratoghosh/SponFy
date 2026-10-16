/**
 * Natural Language Count Parser for Sponsor Discovery
 *
 * Synchronizes the requested target count from natural language user prompts
 * with the Target Count selector pills and the "Discover X Sponsors" submit button.
 *
 * Supported Patterns:
 * - Action phrases: "give me 10", "give 10", "find 15", "top 20", "need 10", "show 25", "get 10"
 * - Noun counts: "10 sponsors", "20 AI companies", "5 startups", "15 brands", "10 leads"
 * - Key-value labels: "target: 10", "count: 20", "limit 15", "qty: 5"
 * - Start with count: "10 AI and dev tool sponsors...", "10"
 * - Word numbers: "give me ten", "top five", "twenty sponsors"
 */

export const WORD_TO_NUMBER: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  "twenty-five": 25,
  "twenty five": 25,
  thirty: 30,
};

const NUMBER_WORDS_PATTERN =
  "twenty-five|twenty\\s+five|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty";

/**
 * Extracts a numeric sponsor target count (1 - 30) from free-form user prompt text.
 */
export function parseCountFromPrompt(text: string): number | null {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Action verb / intent keywords followed by number (digits or words)
  // e.g. "give me 10", "give 10", "find 20", "top 10", "need 15", "suggest 5", "show 10", "get me 25"
  const actionVerbRegex = new RegExp(
    `\\b(?:give|find|get|show|top|search|discover|list|need|want|bring|fetch|suggest|recommend|provide|only|just|around|about|approx)(?:\\s+(?:me|us|for\\s+me|some|the|about|around|approx|at\\s+least|up\\s+to|like))?\\s+(\\d{1,3}|${NUMBER_WORDS_PATTERN})\\b`,
    "i"
  );
  const actionMatch = trimmed.match(actionVerbRegex);
  if (actionMatch) {
    const raw = actionMatch[1].toLowerCase().replace(/\s+/g, " ");
    const val = WORD_TO_NUMBER[raw] ?? parseInt(raw, 10);
    if (!isNaN(val) && val >= 1 && val <= 30) return val;
  }

  // 2. Number (digits or words) followed by entity noun
  // e.g. "10 sponsors", "20 AI companies", "5 brands", "ten startups", "15 leads"
  const nounRegex = new RegExp(
    `\\b(\\d{1,3}|${NUMBER_WORDS_PATTERN})\\b\\s*(?:[a-zA-Z,&\\s-]{0,35})\\s*(?:companies|sponsors|brands|leads|startups|targets|results|options|partners)\\b`,
    "i"
  );
  const nounMatch = trimmed.match(nounRegex);
  if (nounMatch) {
    const raw = nounMatch[1].toLowerCase().replace(/\s+/g, " ");
    const val = WORD_TO_NUMBER[raw] ?? parseInt(raw, 10);
    if (!isNaN(val) && val >= 1 && val <= 30) return val;
  }

  // 3. Explicit label pattern
  // e.g. "target: 10", "count: 20", "target count 15", "limit 10", "qty: 5"
  const labelMatch = trimmed.match(
    /\b(?:target\s*count|target|count|limit|quantity|qty|total|number|amount)(?:\s*(?:of|is|:|=|to))?\s*(\d{1,3})\b/i
  );
  if (labelMatch) {
    const val = parseInt(labelMatch[1], 10);
    if (!isNaN(val) && val >= 1 && val <= 30) return val;
  }

  // 4. Starts with number
  // e.g. "10 AI and dev tool companies...", "10 sponsors for hackathon", "10"
  const startMatch = trimmed.match(/^\s*(\d{1,3})\b/);
  if (startMatch) {
    const val = parseInt(startMatch[1], 10);
    if (!isNaN(val) && val >= 1 && val <= 30) return val;
  }

  // 5. Short prompt containing any 1-2 digit number (e.g. "give 10", "sponsors 10", "10")
  const tokens = trimmed.split(/\s+/);
  if (tokens.length <= 6) {
    for (const token of tokens) {
      if (/^\d{1,2}$/.test(token)) {
        const val = parseInt(token, 10);
        if (val >= 1 && val <= 30) return val;
      }
      const lower = token.toLowerCase();
      if (WORD_TO_NUMBER[lower]) {
        return WORD_TO_NUMBER[lower];
      }
    }
  }

  return null;
}

/**
 * Updates an existing count inside a prompt string when a user clicks a Target Count pill.
 * If the prompt contains a count, it replaces it smoothly.
 * If the prompt does not contain a count, it preserves the existing text.
 */
export function updateCountInPrompt(prompt: string, newCount: number): string {
  if (!prompt) return prompt;

  // 1. Action verb pattern
  const actionVerbRegex = new RegExp(
    `(\\b(?:give|find|get|show|top|search|discover|list|need|want|bring|fetch|suggest|recommend|provide|only|just|around|about|approx)(?:\\s+(?:me|us|for\\s+me|some|the|about|around|approx|at\\s+least|up\\s+to|like))?\\s+)(\\d{1,3}|${NUMBER_WORDS_PATTERN})\\b`,
    "i"
  );
  if (actionVerbRegex.test(prompt)) {
    return prompt.replace(actionVerbRegex, `$1${newCount}`);
  }

  // 2. Noun pattern
  const nounRegex = new RegExp(
    `\\b(\\d{1,3}|${NUMBER_WORDS_PATTERN})\\b(\\s*(?:[a-zA-Z,&\\s-]{0,35})\\s*(?:companies|sponsors|brands|leads|startups|targets|results|options|partners)\\b)`,
    "i"
  );
  if (nounRegex.test(prompt)) {
    return prompt.replace(nounRegex, `${newCount}$2`);
  }

  // 3. Label pattern
  const labelRegex =
    /\b((?:target\s*count|target|count|limit|quantity|qty|total|number|amount)(?:\s*(?:of|is|:|=|to))?\s*)(\d{1,3})\b/i;
  if (labelRegex.test(prompt)) {
    return prompt.replace(labelRegex, `$1${newCount}`);
  }

  // 4. Starts with number
  if (/^\s*(\d{1,3})\b/.test(prompt)) {
    return prompt.replace(/^\s*(\d{1,3})\b/, String(newCount));
  }

  // 5. Short prompt containing isolated number
  const tokens = prompt.trim().split(/\s+/);
  if (tokens.length <= 6) {
    if (/\b(\d{1,2})\b/.test(prompt)) {
      return prompt.replace(/\b(\d{1,2})\b/, String(newCount));
    }
  }

  return prompt;
}
