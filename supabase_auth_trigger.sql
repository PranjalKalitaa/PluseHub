-- AUTOMATIC USER PROFILE CREATION & REFERRAL TRIGGER
-- Run this in Supabase SQL Editor to automatically create a user profile in public.users on signup.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_handle TEXT;
  user_name TEXT;
  ref_code TEXT;
  used_ref_code TEXT;
BEGIN
  -- Extract user metadata passed from auth signup
  clean_handle := LOWER(COALESCE(NEW.raw_user_meta_data->>'handle', 'user_' || SUBSTRING(NEW.id::text FROM 1 FOR 8)));
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'New User');
  used_ref_code := UPPER(COALESCE(NEW.raw_user_meta_data->>'referral_code', ''));
  
  -- Generate unique referral code for the new user
  ref_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  
  -- Insert profile row in public.users table
  INSERT INTO public.users (id, handle, name, avatar, bio, sparks, referral_code)
  VALUES (
    NEW.id,
    clean_handle,
    user_name,
    '⚡',
    'Hey there! I am using PulseHub.',
    50, -- 50 Welcome Sparks Bonus
    ref_code
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    handle = EXCLUDED.handle;

  -- Award 100 bonus Sparks to referrer if a valid referral code was used
  IF used_ref_code <> '' THEN
    UPDATE public.users
    SET sparks = sparks + 100
    WHERE referral_code = used_ref_code;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
