DROP POLICY IF EXISTS "owner_insert_users" ON public.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  referral TEXT := NULLIF(NEW.raw_user_meta_data ->> 'referral_code', '');
BEGIN
  INSERT INTO public.users (id, handle, name, avatar, bio, sparks, badges, followers, following, referral_code)
  VALUES (
    NEW.id,
    LOWER(NEW.raw_user_meta_data ->> 'handle'),
    COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'name', ''), 'New User'),
    '🙂',
    'New to PulseHub',
    120 + CASE WHEN referral IS NULL THEN 0 ELSE 20 END,
    ARRAY['Newcomer'],
    0,
    0,
    'YOU-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4))
  ) ON CONFLICT (id) DO NOTHING;

  IF referral IS NOT NULL THEN
    UPDATE public.users
    SET sparks = sparks + 20
    WHERE referral_code = UPPER(referral);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
