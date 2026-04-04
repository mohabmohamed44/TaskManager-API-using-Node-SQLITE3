-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_providers TEXT DEFAULT '[]';
