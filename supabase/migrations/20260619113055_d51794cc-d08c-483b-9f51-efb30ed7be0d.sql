
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  home_city TEXT,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- trips
CREATE TYPE public.trip_status AS ENUM ('draft','planned','ongoing','completed');

CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration INT NOT NULL DEFAULT 0,
  budget NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  group_size INT NOT NULL DEFAULT 1,
  itinerary JSONB,
  status public.trip_status NOT NULL DEFAULT 'draft',
  is_public BOOLEAN NOT NULL DEFAULT false,
  public_id TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT SELECT ON public.trips TO anon;
GRANT ALL ON public.trips TO service_role;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own trips" ON public.trips
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "anyone can read public trips" ON public.trips
  FOR SELECT TO anon, authenticated
  USING (is_public = true AND public_id IS NOT NULL);

CREATE INDEX trips_user_id_idx ON public.trips(user_id);
CREATE INDEX trips_public_id_idx ON public.trips(public_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tm_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tm_set_updated_at();
CREATE TRIGGER trips_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.tm_set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
