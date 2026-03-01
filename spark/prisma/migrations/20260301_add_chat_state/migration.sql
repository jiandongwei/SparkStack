-- Add JSONB state column to chats so we can persist variable maps
ALTER TABLE IF EXISTS chats ADD COLUMN IF NOT EXISTS state jsonb;

-- No-op default; existing rows will have NULL state
