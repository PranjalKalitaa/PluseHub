# PulseHub

A single social app that combines the three concepts from *New Plan and Idea.docx* —
**TrendTribe** (daily video challenges), **VibeCast** (voice notes), and **QuestShot**
(collaborative micro-stories) — into one Instagram/Facebook-style experience with a
unified home feed, gamified points ("Sparks"), and a shared social graph.

Built with **React Native + Expo** (works on iOS, Android, and web).

## Features implemented

**Onboarding & Auth**
- Welcome screen introducing the three content pillars
- Minimal-friction sign up (name + handle + optional referral code)
- Login / session persistence via AsyncStorage

**Home (unified feed)**
- Single scrolling feed mixing challenge clips, voice notes, and story threads
- Filter chips to view All / Challenges / Voice / Stories only

**Challenges (TrendTribe)**
- Daily rotating prompt with countdown ("expires in Xh")
- Record screen with camera preview (expo-camera) and caption
- Like counter, hashtag tagging, submissions grid

**Voice (VibeCast)**
- Record short voice notes (expo-av) with topic tags
- Reactions (❤️ 😂 👏) and "duet" style voice replies/threads
- Waveform-style player UI

**Stories (QuestShot)**
- Start a collaborative story thread with title, opening line, tags
- Anyone can add the next line; thread view shows the full chain
- "Ink points" tracked per thread

**Gamification (shared across all 3 features)**
- Unified "Sparks" point currency (`src/utils/points.js`)
- Points for posting a challenge, recording/duetting a voice note, starting/continuing
  a story, and referrals
- Badge tiers (Newcomer → Rising Star → Trendsetter → Icon → Legend) with progress bar
- Leaderboard ranking all users by Sparks

**Social**
- Profile screen: avatar, bio, followers/following, badges, referral code + share sheet
- Notifications feed for challenge drops, voice replies, story updates, referral bonuses
- Local push reminder helper for the daily challenge (`src/utils/notifications.js`)

## Project structure

```
PulseHub/
├── App.js                     # Root: providers + navigation + auth gating
├── app.json                   # Expo config
├── package.json
├── babel.config.js
└── src/
    ├── theme/colors.js         # Design tokens (colors, spacing, radius, type)
    ├── data/mockData.js        # Seed/mock data (swap for real API later)
    ├── utils/points.js         # Sparks + badge rules
    ├── utils/notifications.js  # Local push reminder helper
    ├── context/
    │   ├── AuthContext.js      # Session, signup/login, sparks balance
    │   └── DataContext.js      # Feed/challenges/voice/stories state + actions
    ├── navigation/
    │   ├── AuthNavigator.js    # Onboarding → Signup/Login
    │   └── AppNavigator.js     # Bottom tabs, one stack per tab
    ├── components/             # Avatar, Button, PointsBadge, PostCard,
    │                            # ChallengeCard, VoiceNoteCard, StoryThreadCard, TabBarIcon
    └── screens/
        ├── Onboarding/
        ├── Auth/                (Signup, Login)
        ├── Home/                (HomeFeedScreen — unified feed)
        ├── Challenges/          (ChallengesScreen, RecordChallengeScreen)
        ├── Voice/               (VoiceFeedScreen, RecordVoiceScreen)
        ├── Stories/             (StoriesScreen, NewStoryScreen, StoryThreadScreen)
        ├── Profile/             (ProfileScreen)
        ├── Leaderboard/         (LeaderboardScreen)
        └── Notifications/       (NotificationsScreen)
```

## Running it

1. Install [Node.js](https://nodejs.org) and the Expo Go app on your phone (or an
   iOS/Android simulator).
2. From the `PulseHub` folder:
   ```bash
   npm install
   npx expo start
   ```
3. Scan the QR code with Expo Go, or press `i` / `a` for a simulator, or `w` for web.

No backend or API keys are required — the app runs entirely on local mock data and
device storage (AsyncStorage), so you can try every flow immediately.

## Going to production

This build is a fully-wired frontend prototype. To ship it for real:

- Replace `src/data/mockData.js` reads/writes with real API calls (e.g. wrap them in
  a `src/api/` layer) and swap `AsyncStorage` session storage for real auth tokens.
- Add actual media upload/storage (S3, Cloudflare R2, Mux, etc.) for challenge videos
  and voice note audio files — the record screens are wired to Expo's camera/audio
  APIs and just need an upload step added after `stopRecording`/`recordAsync`.
- Add a moderation queue for story threads and challenge submissions.
- Add push notification registration (Expo Push Tokens) to actually deliver the
  reminders scheduled in `src/utils/notifications.js`.

## Notes

- All avatars use emoji placeholders instead of photos to keep the project
  dependency-free and instantly runnable.
- Camera/microphone recording UI is fully wired to Expo's APIs; actual file upload to
  a media server is left as the one integration point for a real backend (see above).

## Supabase authentication setup

PulseHub creates the authentication callback URL at runtime. In an installed app it is `pulsehub://auth/callback`; in Expo Go it is the current `exp://.../--/auth/callback` development URL.

1. In **Authentication / URL Configuration**, add `pulsehub://auth/callback` for installed builds and `exp://**` for Expo Go LAN testing to **Redirect URLs**. Do not use `localhost:3000` as the mobile redirect.
2. In **Authentication / Providers**, enable and configure Google using your Google OAuth web client credentials.
3. For Expo Go, start the project with `npx expo start --lan`, keep Expo Go open, and open email links on the same phone. For reliable production redirects, build and install the app later (`npx expo run:android` / `npx expo run:ios` or EAS).
