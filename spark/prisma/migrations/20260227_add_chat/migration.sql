-- Migration: create chats table
-- Adds a simple chats table used by the chat API

CREATE TABLE IF NOT EXISTS chats (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
