-- Storage Buckets setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 2097152, ARRAY['image/*']),
  ('videos', 'videos', true, 52428800, ARRAY['video/*']),
  ('voice-notes', 'voice-notes', true, 10485760, ARRAY['audio/*'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Avatars Policies
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() != null);

-- Videos Policies
CREATE POLICY "Videos are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Anyone can upload a video." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.uid() != null);

-- Voice Notes Policies
CREATE POLICY "Voice notes are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'voice-notes');
CREATE POLICY "Anyone can upload a voice note." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'voice-notes' AND auth.uid() != null);
