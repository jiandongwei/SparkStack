-- Migration: add assistant fields to chats table
-- Adds assistant_message, assistant_model, assistant_created_at, assistant_response

ALTER TABLE chats
  ADD COLUMN IF NOT EXISTS assistant_message TEXT,
  ADD COLUMN IF NOT EXISTS assistant_model TEXT,
  ADD COLUMN IF NOT EXISTS assistant_created_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS assistant_response JSONB;
