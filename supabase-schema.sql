-- ============================================================================
-- GK Holidays: Supabase PostgreSQL Schema
-- Tables: packages, settings, feedback
-- ============================================================================

-- 1. PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    region TEXT NOT NULL,
    type TEXT NOT NULL,
    days TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    summary TEXT NOT NULL,
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
    inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packages_region ON public.packages(region);

-- 2. SETTINGS TABLE (Enforced Singleton with id = 1)
CREATE TABLE IF NOT EXISTS public.settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    address TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT NOT NULL,
    "phoneNumbers" JSONB NOT NULL DEFAULT '[]'::jsonb,
    "instagramHandle" TEXT DEFAULT '',
    "instagramUrl" TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.feedback (
    id TEXT PRIMARY KEY,
    "collegeName" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "foodRating" INTEGER NOT NULL CHECK ("foodRating" >= 1 AND "foodRating" <= 5),
    "travelRating" INTEGER NOT NULL CHECK ("travelRating" >= 1 AND "travelRating" <= 5),
    "placesRating" INTEGER NOT NULL CHECK ("placesRating" >= 1 AND "placesRating" <= 5),
    comments TEXT DEFAULT '',
    "submittedDate" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_submitted_date ON public.feedback("submittedDate" DESC);
