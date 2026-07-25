-- IMPORTANT NOTE: 
-- In production, users are created via the Supabase Auth signup flow and the 'users' table is populated
-- either via triggers or client-side logic after auth signup.
-- This file is for local development and testing only. The UUIDs here are dummy UUIDs and would not map
-- to real authenticated users unless you also seed the auth.users table.

-- Dummy user IDs
-- '11111111-1111-1111-1111-111111111111'
-- '22222222-2222-2222-2222-222222222222'
-- '33333333-3333-3333-3333-333333333333'
-- '44444444-4444-4444-4444-444444444444'
-- '55555555-5555-5555-5555-555555555555'

-- 5 sample users
INSERT INTO public.users (id, handle, name, avatar, bio, sparks, badges, followers, following, referral_code) VALUES
('11111111-1111-1111-1111-111111111111', 'alice', 'Alice Wonderland', '🐰', 'Curiouser and curiouser', 1500, ARRAY['Early Bird', 'Top 10'], 10, 5, 'ALICE2026'),
('22222222-2222-2222-2222-222222222222', 'bob_builder', 'Bob Builder', '👷', 'Can we fix it? Yes we can!', 500, ARRAY['Fixer'], 5, 2, 'BOB2026'),
('33333333-3333-3333-3333-333333333333', 'charlie_chap', 'Charlie C.', '🎩', 'Silent but deadly humor', 2500, ARRAY['Comedian'], 50, 10, 'CHAR2026'),
('44444444-4444-4444-4444-444444444444', 'diana_prince', 'Diana', '⚔️', 'Warrior princess', 3000, ARRAY['Hero'], 100, 20, 'DIANA2026'),
('55555555-5555-5555-5555-555555555555', 'edward_teach', 'Blackbeard', '🏴‍☠️', 'Sailing the seven seas', 450, ARRAY['Pirate'], 2, 50, 'ED2026')
ON CONFLICT (id) DO NOTHING;

-- 4 challenge posts
INSERT INTO public.challenge_posts (id, user_id, hashtag, caption, likes, comments, thumbnail, duration_sec, video_url) VALUES
('aaaa1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'MorningRoutine', 'Starting the day with a smile!', 0, 0, 'https://example.com/thumb1.jpg', 15, 'https://example.com/vid1.mp4'),
('aaaa2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'DIYFix', 'Fixing the sink in 10s', 0, 0, 'https://example.com/thumb2.jpg', 10, 'https://example.com/vid2.mp4'),
('aaaa3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'ComedyGold', 'Wait for the punchline', 0, 0, 'https://example.com/thumb3.jpg', 20, 'https://example.com/vid3.mp4'),
('aaaa4444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'Workout', 'Amazonian workout routine', 0, 0, 'https://example.com/thumb4.jpg', 30, 'https://example.com/vid4.mp4')
ON CONFLICT (id) DO NOTHING;

-- 4 voice notes (including 1 duet)
INSERT INTO public.voice_notes (id, user_id, topic, caption, duration_sec, audio_url) VALUES
('bbbb1111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'Sea Shanties', 'My favorite shanty', 60, 'https://example.com/audio1.mp3'),
('bbbb2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Storytime', 'The time I fell down a hole', 120, 'https://example.com/audio2.mp3'),
('bbbb3333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'Joke of the day', 'Why did the chicken...', 15, 'https://example.com/audio3.mp3')
ON CONFLICT (id) DO NOTHING;

-- Duet
INSERT INTO public.voice_notes (id, user_id, topic, caption, duration_sec, duet_of, audio_url) VALUES
('bbbb4444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Sea Shanties', 'Harmonizing with Blackbeard', 60, 'bbbb1111-1111-1111-1111-111111111111', 'https://example.com/audio4.mp3')
ON CONFLICT (id) DO NOTHING;

-- 3 story threads with multiple entries each
INSERT INTO public.story_threads (id, title, tags, ink_points, is_public) VALUES
('cccc1111-1111-1111-1111-111111111111', 'The Great Escape', ARRAY['adventure', 'fiction'], 100, true),
('cccc2222-2222-2222-2222-222222222222', 'A Day in the Life', ARRAY['vlog', 'daily'], 50, true),
('cccc3333-3333-3333-3333-333333333333', 'Mystery in the Woods', ARRAY['mystery', 'spooky'], 200, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.story_entries (thread_id, user_id, text) VALUES
('cccc1111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'It all started when the clock struck thirteen.'),
('cccc1111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'I knew something was wrong with the gears.'),
('cccc2222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Woke up, drank coffee, told a joke.'),
('cccc2222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'Went to the gym for 5 hours. Casual.'),
('cccc3333-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'Yarrr, there be ghosts in these trees.'),
('cccc3333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Or maybe it was just a very large rabbit.');

-- 8 notifications
INSERT INTO public.notifications (user_id, kind, text, read) VALUES
('11111111-1111-1111-1111-111111111111', 'follow', 'Bob Builder started following you', false),
('11111111-1111-1111-1111-111111111111', 'like', 'Charlie C. liked your post', false),
('22222222-2222-2222-2222-222222222222', 'system', 'Welcome to PulseHub!', true),
('22222222-2222-2222-2222-222222222222', 'story', 'Alice added to your story thread', false),
('33333333-3333-3333-3333-333333333333', 'voice', 'Blackbeard duetted your voice note', true),
('44444444-4444-4444-4444-444444444444', 'challenge', 'You earned 50 Sparks from your daily challenge!', false),
('55555555-5555-5555-5555-555555555555', 'referral', 'Someone used your referral code!', false),
('55555555-5555-5555-5555-555555555555', 'like', 'Diana liked your voice note', true);

-- Comments and Likes
INSERT INTO public.comments (post_id, post_type, user_id, text) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'challenge', '22222222-2222-2222-2222-222222222222', 'Great routine!'),
('bbbb1111-1111-1111-1111-111111111111', 'voice', '11111111-1111-1111-1111-111111111111', 'Love this song!');

INSERT INTO public.challenge_likes (user_id, post_id) VALUES
('33333333-3333-3333-3333-333333333333', 'aaaa1111-1111-1111-1111-111111111111'),
('44444444-4444-4444-4444-444444444444', 'aaaa1111-1111-1111-1111-111111111111');
