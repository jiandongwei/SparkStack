-- Migration: add session_id to chats and remove unique user_id constraint

-- Drop common unique constraint names if present
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_user_id_key;
ALTER TABLE chats DROP CONSTRAINT IF EXISTS chats_user_id_unique;

-- Add session_id column
ALTER TABLE chats
  ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Create an index for user/session lookups
CREATE INDEX IF NOT EXISTS chats_user_session_idx ON chats (user_id, session_id);
