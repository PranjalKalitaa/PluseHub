// DEPRECATED: This file contains legacy mock data. All data now comes from Supabase. Kept for reference only.
// Mock/seed data. In production this would be replaced by API calls to a
// real backend (see README "Going to production").

export const currentUser = {
  id: "u0",
  handle: "you",
  name: "You",
  avatar: "🙂",
  bio: "New to PulseHub",
  sparks: 120, // unified points currency (challenge + voice + ink points)
  badges: ["Newcomer"],
  followers: 12,
  following: 20,
  referralCode: "YOU-4F2A",
};

export const users = [
  { id: "u1", handle: "mia.codes", name: "Mia", avatar: "🎬", sparks: 3200 },
  { id: "u2", handle: "jrock", name: "J Rock", avatar: "🎤", sparks: 2100 },
  { id: "u3", handle: "sana_writes", name: "Sana", avatar: "📖", sparks: 1800 },
  { id: "u4", handle: "devon.tv", name: "Devon", avatar: "🎥", sparks: 1500 },
  { id: "u5", handle: "kiki", name: "Kiki", avatar: "✨", sparks: 990 },
];

// --- TrendTribe: daily micro-challenges (short video) ---
export const dailyChallenge = {
  id: "c-today",
  prompt: "Show us your 'get ready in 10 seconds' routine",
  hashtag: "#GetReadyFast",
  expiresInHours: 14,
};

export const challengePosts = [
  {
    id: "ch1",
    type: "challenge",
    user: users[0],
    hashtag: "#GetReadyFast",
    caption: "10 seconds flat 😤",
    likes: 482,
    comments: 31,
    thumbnail: "🎬",
    durationSec: 12,
  },
  {
    id: "ch2",
    type: "challenge",
    user: users[3],
    hashtag: "#GetReadyFast",
    caption: "okay this took me 9 tries",
    likes: 210,
    comments: 14,
    thumbnail: "🎥",
    durationSec: 15,
  },
];

// --- VibeCast: short voice notes ---
export const voiceNotes = [
  {
    id: "v1",
    type: "voice",
    user: users[1],
    topic: "#DailyHumor",
    caption: "the office wifi story you asked for",
    durationSec: 22,
    reactions: { heart: 44, laugh: 19, clap: 6 },
    duetOf: null,
  },
  {
    id: "v2",
    type: "voice",
    user: users[4],
    topic: "#Motivation",
    caption: "reply to Mia's morning thoughts",
    durationSec: 18,
    reactions: { heart: 12, laugh: 1, clap: 9 },
    duetOf: "v1",
  },
];

// --- QuestShot: collaborative micro-story threads ---
export const storyThreads = [
  {
    id: "s1",
    type: "story",
    title: "The door that shouldn't open",
    tags: ["#PlotTwist", "#Horror"],
    entries: [
      { id: "e1", user: users[2], text: "The basement door was locked. It had always been locked." },
      { id: "e2", user: users[0], text: "Until the night the power went out and I heard it creak." },
      { id: "e3", user: users[4], text: "I told myself it was the wind. The wind doesn't knock twice." },
    ],
    inkPoints: 340,
    isPublic: true,
  },
  {
    id: "s2",
    type: "story",
    title: "Last bus to nowhere",
    tags: ["#Sci-Fi"],
    entries: [
      { id: "e4", user: users[3], text: "The bus arrived exactly on time, which was the first sign something was wrong." },
    ],
    inkPoints: 90,
    isPublic: true,
  },
];

export const leaderboard = [...users, { ...currentUser }]
  .sort((a, b) => b.sparks - a.sparks)
  .map((u, i) => ({ rank: i + 1, ...u }));

export const notificationsSeed = [
  { id: "n1", kind: "challenge", text: "New daily challenge just dropped: #GetReadyFast", time: "2h" },
  { id: "n2", kind: "voice", text: "Kiki replied to your voice note", time: "5h" },
  { id: "n3", kind: "story", text: "Sana added a new twist to 'The door that shouldn't open'", time: "1d" },
  { id: "n4", kind: "referral", text: "Devon joined using your invite code — +20 sparks!", time: "2d" },
];

// Unified feed = interleave of all three content types, newest-ish first.
export function buildUnifiedFeed() {
  return [...challengePosts, ...voiceNotes, ...storyThreads].sort(() => Math.random() - 0.5);
}
