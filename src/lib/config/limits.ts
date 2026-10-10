export const SYSTEM_LIMITS = {
  // Outreach limits
  DEFAULT_DAILY_SEND_CAP: 30,
  MAX_DAILY_SEND_CAP: 100,

  // Follow-up defaults
  DEFAULT_FIRST_FOLLOWUP_DELAY_DAYS: 4,
  DEFAULT_SECOND_FOLLOWUP_DELAY_DAYS: 7,
  MAX_FOLLOWUP_COUNT: 2,

  // Anti-spam / duplicate-outreach guards (enforced server-side in lib/outreach/send-guard.ts)
  // A company may receive 1 initial email + MAX_FOLLOWUP_COUNT follow-ups, then never again.
  MIN_DAYS_BETWEEN_TOUCHES: 4,
  SEND_CAP_WINDOW_HOURS: 24,

  // Serverless execution constraints
  MAX_COMPANIES_PER_RESEARCH_JOB: 1, // 1 per job to ensure <15s execution on Vercel
  MAX_DISCOVER_BATCH_SIZE: 6,

  // Safety caps
  MAX_SUBJECT_LENGTH: 120,
  MAX_BODY_CHARACTERS: 3000,
  MIN_FIT_SCORE_FOR_OUTREACH: 40,
};
