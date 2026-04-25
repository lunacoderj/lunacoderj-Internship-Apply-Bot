-- ApplyPilot Final Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extending auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    resume_url TEXT,
    onboarding_status TEXT DEFAULT 'pending', -- pending, resume_uploaded, education_parsed, preferences_set, complete
    job_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Education Details (Parsed from resume)
CREATE TABLE IF NOT EXISTS public.education_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    institution TEXT,
    degree TEXT,
    field TEXT,
    start_date TEXT,
    end_date TEXT,
    gpa TEXT,
    summary TEXT,
    skills TEXT[],
    experience_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. API Keys (Encrypted - matching keys.js)
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL, -- 'gemini', 'openai', 'anthropic', 'openrouter'
    encrypted_value TEXT NOT NULL,
    key_hint TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, key_name)
);

-- 4. Email Logs (For Resend webhooks)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resend_email_id TEXT UNIQUE,
    from_address TEXT,
    subject TEXT,
    raw_body TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Offers (Extracted from emails)
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email_log_id UUID REFERENCES public.email_logs(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    description TEXT,
    apply_url TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'queued', 'applying', 'applied', 'failed')),
    received_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, apply_url)
);

-- 6. Applications (Tracking Bot actions - matching applications.js)
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES public.offers(id) ON DELETE CASCADE,
    job_url TEXT, -- Added for direct tracking
    platform TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'success', 'failed')),
    error_message TEXT,
    applypilot_output JSONB,
    applied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own education" ON public.education_details;
CREATE POLICY "Users can manage own education" ON public.education_details FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own keys" ON public.api_keys;
CREATE POLICY "Users can manage own keys" ON public.api_keys FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own email logs" ON public.email_logs;
CREATE POLICY "Users can manage own email logs" ON public.email_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own offers" ON public.offers;
CREATE POLICY "Users can manage own offers" ON public.offers FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own applications" ON public.applications;
CREATE POLICY "Users can manage own applications" ON public.applications FOR ALL USING (auth.uid() = user_id);

-- Updated at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS tr_education_updated_at ON public.education_details;
CREATE TRIGGER tr_education_updated_at BEFORE UPDATE ON public.education_details FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS tr_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER tr_api_keys_updated_at BEFORE UPDATE ON public.api_keys FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS tr_applications_updated_at ON public.applications;
CREATE TRIGGER tr_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();