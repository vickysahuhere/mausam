-- ==============================================================================
-- MAUSAM PHASE 5 SCHEMA: USER PERSISTENCE & CLOUD SYNC
-- ==============================================================================

-- 1. USER PROFILES TABLE
-- Stores personalized user preferences, blended persona vectors, and theme selections.
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_vector JSONB DEFAULT NULL,
  dominant_persona TEXT DEFAULT 'custom',
  active_theme_id TEXT DEFAULT 'custom',
  survey_completed BOOLEAN DEFAULT false,
  temp_unit TEXT DEFAULT 'C' CHECK (temp_unit IN ('C', 'F')),
  wind_speed_unit TEXT DEFAULT 'km/h' CHECK (wind_speed_unit IN ('km/h', 'm/s')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. USER LOCATIONS TABLE
-- Stores user's saved localities, coordinates, and default primary selection.
CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  lat FLOAT8 NOT NULL,
  lon FLOAT8 NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT user_location_coords_unique UNIQUE (user_id, lat, lon)
);

-- 3. USER LAYOUTS TABLE
-- Stores personalized widget ordering, selection, and active theme for the user's dashboard.
CREATE TABLE IF NOT EXISTS public.user_layouts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  active_theme_id TEXT NOT NULL DEFAULT 'custom',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON public.user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_layouts_user_id ON public.user_layouts(user_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Mandatory: Each authenticated user can ONLY view, insert, update, and delete their own data.
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_layouts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- user_profiles policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;
CREATE POLICY "Users can delete own profile"
  ON public.user_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- user_locations policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own locations" ON public.user_locations;
CREATE POLICY "Users can read own locations"
  ON public.user_locations
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own locations" ON public.user_locations;
CREATE POLICY "Users can insert own locations"
  ON public.user_locations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own locations" ON public.user_locations;
CREATE POLICY "Users can update own locations"
  ON public.user_locations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own locations" ON public.user_locations;
CREATE POLICY "Users can delete own locations"
  ON public.user_locations
  FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- user_layouts policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own layout" ON public.user_layouts;
CREATE POLICY "Users can read own layout"
  ON public.user_layouts
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own layout" ON public.user_layouts;
CREATE POLICY "Users can insert own layout"
  ON public.user_layouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own layout" ON public.user_layouts;
CREATE POLICY "Users can update own layout"
  ON public.user_layouts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own layout" ON public.user_layouts;
CREATE POLICY "Users can delete own layout"
  ON public.user_layouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- When an auth.users record is created, automatically create a default user_profiles row
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, survey_completed)
  VALUES (new.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
