-- ============================================================
-- FLOWBOARD — MIGRATION: AI INTELLIGENCE LAYER
-- ============================================================

-- 1. EXTEND INBOX ITEMS
-- To store structured AI insights from natural language capture
ALTER TABLE inbox_items 
ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{}'::JSONB;

-- 2. EXTEND CARDS
-- Adding behavioral metadata for smarter AI scheduling
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS energy_level INT CHECK (energy_level >= 1 AND energy_level <= 5) DEFAULT 3,
ADD COLUMN IF NOT EXISTS estimated_minutes INT DEFAULT 30,
ADD COLUMN IF NOT EXISTS focus_score FLOAT DEFAULT 0.5;

-- 3. USER AI PREFERENCES
CREATE TABLE IF NOT EXISTS user_ai_preferences (
    user_id          UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    optimization_goal TEXT DEFAULT 'BALANCED', -- 'PRODUCTIVITY', 'WELLBEING', 'BALANCED'
    work_start_time   TIME DEFAULT '09:00:00',
    work_end_time     TIME DEFAULT '17:00:00',
    ai_tone           TEXT DEFAULT 'PROFESSIONAL',
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_ai_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own AI preferences"
    ON user_ai_preferences FOR ALL
    USING (auth.uid() = user_id);

-- 4. HELPER FUNCTION: GET USER CONTEXT FOR AI
CREATE OR REPLACE FUNCTION get_user_ai_context(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_prefs JSONB;
    v_recent_tasks JSONB;
BEGIN
    SELECT json_build_object(
        'goal', optimization_goal,
        'schedule', json_build_object('start', work_start_time, 'end', work_end_time)
    ) INTO v_prefs FROM user_ai_preferences WHERE user_id = p_user_id;

    RETURN json_build_object(
        'preferences', COALESCE(v_prefs, '{}'::JSONB)
    );
END;
$$;
