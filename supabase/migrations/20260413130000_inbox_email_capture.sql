-- ============================================================
-- FLOWBOARD — MIGRATION: INBOX EMAIL CAPTURE
-- ============================================================

-- 1. ADD CAPTURE EMAIL TO PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inbound_capture_email TEXT UNIQUE;

-- 2. FUNCTION TO GENERATE UNIQUE CAPTURE EMAIL
CREATE OR REPLACE FUNCTION generate_unique_capture_email()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_random_id TEXT;
    v_email     TEXT;
    v_exists    BOOLEAN;
BEGIN
    LOOP
        -- Generate a short random ID (e.g., 6 chars)
        v_random_id := lower(substring(encode(gen_random_bytes(6), 'hex') from 1 for 8));
        v_email := v_random_id || '@capture.flowboard.io';
        
        -- Check if it exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE inbound_capture_email = v_email) INTO v_exists;
        
        EXIT WHEN NOT v_exists;
    END LOOP;
    
    RETURN v_email;
END;
$$;

-- 3. TRIGGER TO AUTOMATICALLY SET CAPTURE EMAIL
CREATE OR REPLACE FUNCTION set_inbound_capture_email()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.inbound_capture_email IS NULL THEN
        NEW.inbound_capture_email := generate_unique_capture_email();
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_set_capture_email ON public.profiles;
CREATE TRIGGER tr_set_capture_email
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION set_inbound_capture_email();

-- 4. BACKFILL EXISTING PROFILES
UPDATE public.profiles 
SET inbound_capture_email = generate_unique_capture_email()
WHERE inbound_capture_email IS NULL;
