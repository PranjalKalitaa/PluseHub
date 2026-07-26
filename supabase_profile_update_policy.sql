-- Run this in Supabase SQL Editor if profile saving reports a permission error.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_update_users" ON public.users;
CREATE POLICY "owner_update_users"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);