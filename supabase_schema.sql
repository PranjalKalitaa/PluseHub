-- Cleanup existing legacy tables if present
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS voice_reactions CASCADE;
DROP TABLE IF EXISTS challenge_likes CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS story_entries CASCADE;
DROP TABLE IF EXISTS story_threads CASCADE;
DROP TABLE IF EXISTS voice_notes CASCADE;
DROP TABLE IF EXISTS challenge_posts CASCADE;
DROP TABLE IF EXISTS daily_challenges CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users,
    handle TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar TEXT,
    bio TEXT,
    sparks INTEGER DEFAULT 0,
    badges TEXT[] DEFAULT '{}',
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    referral_code TEXT UNIQUE,
    push_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Challenge Posts table
CREATE TABLE IF NOT EXISTS challenge_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hashtag TEXT,
    caption TEXT,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    thumbnail TEXT,
    duration_sec INTEGER,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Voice Notes table
CREATE TABLE IF NOT EXISTS voice_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    topic TEXT,
    caption TEXT,
    duration_sec INTEGER,
    reactions JSONB DEFAULT '{"heart": 0, "laugh": 0, "clap": 0}'::jsonb,
    duet_of UUID REFERENCES voice_notes(id) ON DELETE SET NULL,
    audio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Story Threads table
CREATE TABLE IF NOT EXISTS story_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    tags TEXT[],
    ink_points INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Story Entries table
CREATE TABLE IF NOT EXISTS story_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES story_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT,
    text TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Daily Challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT,
    hashtag TEXT,
    active_date DATE UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (follower_id, following_id)
);

-- Challenge Likes table
CREATE TABLE IF NOT EXISTS challenge_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES challenge_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, post_id)
);

-- Voice Reactions table
CREATE TABLE IF NOT EXISTS voice_reactions (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    note_id UUID REFERENCES voice_notes(id) ON DELETE CASCADE,
    reaction TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, note_id, reaction)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL,
    post_type TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users
CREATE POLICY "everyone_select_users" ON users FOR SELECT USING (true);
CREATE POLICY "owner_insert_users" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "owner_update_users" ON users FOR UPDATE USING (auth.uid() = id);

-- Challenge Posts
CREATE POLICY "everyone_select_challenge_posts" ON challenge_posts FOR SELECT USING (true);
CREATE POLICY "auth_insert_challenge_posts" ON challenge_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_challenge_posts" ON challenge_posts FOR UPDATE USING (auth.uid() != null);
CREATE POLICY "owner_delete_challenge_posts" ON challenge_posts FOR DELETE USING (auth.uid() = user_id);

-- Voice Notes
CREATE POLICY "everyone_select_voice_notes" ON voice_notes FOR SELECT USING (true);
CREATE POLICY "auth_insert_voice_notes" ON voice_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_update_voice_notes" ON voice_notes FOR UPDATE USING (auth.uid() != null);
CREATE POLICY "owner_delete_voice_notes" ON voice_notes FOR DELETE USING (auth.uid() = user_id);

-- Story Threads
CREATE POLICY "everyone_select_story_threads" ON story_threads FOR SELECT USING (true);
CREATE POLICY "auth_insert_story_threads" ON story_threads FOR INSERT WITH CHECK (auth.uid() != null);
CREATE POLICY "auth_update_story_threads" ON story_threads FOR UPDATE USING (auth.uid() != null);

-- Story Entries
CREATE POLICY "everyone_select_story_entries" ON story_entries FOR SELECT USING (true);
CREATE POLICY "auth_insert_story_entries" ON story_entries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE POLICY "owner_select_notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner_update_notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "auth_insert_notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() != null);

-- Daily Challenges
CREATE POLICY "everyone_select_daily_challenges" ON daily_challenges FOR SELECT USING (true);

-- Follows
CREATE POLICY "everyone_select_follows" ON follows FOR SELECT USING (true);
CREATE POLICY "auth_insert_follows" ON follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "auth_delete_follows" ON follows FOR DELETE USING (auth.uid() = follower_id);

-- Challenge Likes
CREATE POLICY "everyone_select_challenge_likes" ON challenge_likes FOR SELECT USING (true);
CREATE POLICY "auth_insert_challenge_likes" ON challenge_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_challenge_likes" ON challenge_likes FOR DELETE USING (auth.uid() = user_id);

-- Voice Reactions
CREATE POLICY "everyone_select_voice_reactions" ON voice_reactions FOR SELECT USING (true);
CREATE POLICY "auth_insert_voice_reactions" ON voice_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "auth_delete_voice_reactions" ON voice_reactions FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "everyone_select_comments" ON comments FOR SELECT USING (true);
CREATE POLICY "auth_insert_comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Triggers

-- Trigger function for followers/following count
CREATE OR REPLACE FUNCTION handle_follow_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET following = following + 1 WHERE id = NEW.follower_id;
    UPDATE users SET followers = followers + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET following = following - 1 WHERE id = OLD.follower_id;
    UPDATE users SET followers = followers - 1 WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_follow_change
AFTER INSERT OR DELETE ON follows
FOR EACH ROW EXECUTE FUNCTION handle_follow_change();

-- Trigger function for challenge likes count
CREATE OR REPLACE FUNCTION handle_like_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE challenge_posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE challenge_posts SET likes = likes - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_change
AFTER INSERT OR DELETE ON challenge_likes
FOR EACH ROW EXECUTE FUNCTION handle_like_change();

-- Indexes
CREATE INDEX IF NOT EXISTS challenge_posts_created_at_idx ON challenge_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS voice_notes_created_at_idx ON voice_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS daily_challenges_active_date_idx ON daily_challenges(active_date);
CREATE INDEX IF NOT EXISTS users_sparks_idx ON users(sparks DESC);
CREATE INDEX IF NOT EXISTS story_entries_thread_id_idx ON story_entries(thread_id);

-- Enable Realtime
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE challenge_posts, voice_notes, story_threads, story_entries, notifications;
COMMIT;
