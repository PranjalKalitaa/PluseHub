// Shared "Sparks" points + badge logic used by all three content types
// (challenge points, voice points, ink points are unified into one currency).

export const SPARK_RULES = {
  POST_CHALLENGE: 25,
  RECORD_VOICE_NOTE: 15,
  VOICE_DUET: 20,
  ADD_STORY_ENTRY: 10,
  START_STORY_THREAD: 20,
  REFERRAL_SIGNUP: 20,
  DAILY_LOGIN_STREAK: 5,
};

export const BADGE_THRESHOLDS = [
  { sparks: 0, label: "Newcomer" },
  { sparks: 100, label: "Rising Star" },
  { sparks: 500, label: "Trendsetter" },
  { sparks: 1500, label: "Icon" },
  { sparks: 5000, label: "Legend" },
];

export function badgeForSparks(sparks) {
  let current = BADGE_THRESHOLDS[0].label;
  for (const tier of BADGE_THRESHOLDS) {
    if (sparks >= tier.sparks) current = tier.label;
  }
  return current;
}

export function nextBadgeProgress(sparks) {
  const next = BADGE_THRESHOLDS.find((t) => t.sparks > sparks);
  if (!next) return { next: null, remaining: 0, progress: 1 };
  const prevThreshold = [...BADGE_THRESHOLDS].reverse().find((t) => t.sparks <= sparks) || BADGE_THRESHOLDS[0];
  const span = next.sparks - prevThreshold.sparks;
  const progress = span === 0 ? 1 : (sparks - prevThreshold.sparks) / span;
  return { next: next.label, remaining: next.sparks - sparks, progress };
}
