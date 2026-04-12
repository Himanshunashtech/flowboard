-- ============================================================
-- FLOWBOARD — MIGRATION: REMOVE GITHUB INTEGRATION
-- ============================================================

-- 1. Drop GitHub-specific tables
DROP TABLE IF EXISTS card_github_items CASCADE;
DROP TABLE IF EXISTS board_repositories CASCADE;
DROP TABLE IF EXISTS github_webhook_logs CASCADE;
DROP TABLE IF EXISTS github_accounts CASCADE;

-- 2. Drop GitHub-specific helper functions
DROP FUNCTION IF EXISTS encrypt_github_token(TEXT, TEXT);
DROP FUNCTION IF EXISTS decrypt_github_token_secure(UUID);

-- NOTE: We leave 'integrated_accounts' and 'integration_hub' as they are 
-- multi-service, but the GitHub-specific components are now purged.
