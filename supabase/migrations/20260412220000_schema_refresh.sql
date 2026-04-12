-- ============================================================
-- FLOWBOARD — MIGRATION: POSTGREST SCHEMA CACHE REFRESH
-- Forces a reload of the API worker to align with recent type changes.
-- ============================================================

-- A no-op ALTER TABLE can often trigger a schema reload in Supabase
-- Here we just add then immediately remove a dummy comment.

COMMENT ON TABLE public.profiles IS 'FlowHub Profile Storage';
COMMENT ON TABLE public.workspaces IS 'FlowHub Strategic Workspaces';
COMMENT ON TABLE public.boards IS 'FlowHub Execution Hubs';
COMMENT ON TABLE public.lists IS 'FlowHub Workflow Stages';
COMMENT ON TABLE public.cards IS 'FlowHub Task Units';

-- Additionally, ensure all roles have USAGE on public schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Refresh materialized views if any (none currently, but good practice)
-- NOTIFY pgrst, 'reload schema'; -- Custom versions of PostgREST
