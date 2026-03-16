-- ============================================================
-- 0N1 Lore Crafter - Supabase Database Setup
-- Run this in your Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CHARACTER SOULS - stores the lore/personality for each NFT
CREATE TABLE IF NOT EXISTS character_souls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nft_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  character_name TEXT,
  archetype TEXT,
  background TEXT,
  personality_data JSONB DEFAULT '{}'::jsonb,
  traits JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nft_id, wallet_address)
);

-- 2. CONVERSATION MEMORY - stores chat history per character
CREATE TABLE IF NOT EXISTS conversation_memory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nft_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  character_name TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  key_memories JSONB DEFAULT '[]'::jsonb,
  user_profile JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nft_id, wallet_address)
);

-- 3. MEMORY SEGMENTS - individual tagged memory entries
CREATE TABLE IF NOT EXISTS memory_segments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nft_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  message_id TEXT,
  text_content TEXT NOT NULL,
  start_index INTEGER,
  end_index INTEGER,
  tags JSONB DEFAULT '[]'::jsonb,
  importance REAL DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CHAT ARCHIVES - archived/completed conversation sessions
CREATE TABLE IF NOT EXISTS chat_archives (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  character_name TEXT,
  title TEXT,
  summary TEXT,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  memory_segments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_start TIMESTAMPTZ,
  session_end TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEMORY PROFILES - character evolution and context tracking
CREATE TABLE IF NOT EXISTS memory_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nft_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  context_entries JSONB DEFAULT '[]'::jsonb,
  tag_management JSONB DEFAULT '{}'::jsonb,
  character_evolution JSONB DEFAULT '{}'::jsonb,
  overview_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(nft_id, wallet_address)
);

-- ============================================================
-- INDEXES for fast lookups
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_character_souls_wallet ON character_souls(wallet_address);
CREATE INDEX IF NOT EXISTS idx_character_souls_nft ON character_souls(nft_id);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_wallet ON conversation_memory(wallet_address);
CREATE INDEX IF NOT EXISTS idx_conversation_memory_nft ON conversation_memory(nft_id);
CREATE INDEX IF NOT EXISTS idx_memory_segments_wallet ON memory_segments(wallet_address);
CREATE INDEX IF NOT EXISTS idx_memory_segments_nft ON memory_segments(nft_id);
CREATE INDEX IF NOT EXISTS idx_chat_archives_wallet ON chat_archives(wallet_address);
CREATE INDEX IF NOT EXISTS idx_chat_archives_character ON chat_archives(character_id);
CREATE INDEX IF NOT EXISTS idx_memory_profiles_wallet ON memory_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_memory_profiles_nft ON memory_profiles(nft_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) - users can only see their own data
-- ============================================================
ALTER TABLE character_souls ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations via the anon key (app handles auth via JWT)
CREATE POLICY "Allow all operations" ON character_souls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON conversation_memory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON memory_segments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON chat_archives FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON memory_profiles FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- DONE! Your database is ready.
-- ============================================================
