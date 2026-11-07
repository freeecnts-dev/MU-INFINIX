/*
# Create monsters and players tables for MU INFINIX admin panel

1. New Tables
- `monsters`
  - `id` (uuid, primary key)
  - `name` (text, not null) - monster name
  - `level` (integer, not null) - monster level
  - `hp` (integer, not null) - monster health/vida
  - `damage` (integer, not null) - monster damage
  - `created_at` (timestamptz)
- `players`
  - `id` (uuid, primary key)
  - `name` (text, not null) - player name
  - `level` (integer, not null) - player level
  - `class` (text, not null) - player class (e.g. Knight, Wizard, Elf)
  - `hp` (integer, not null) - player health
  - `created_at` (timestamptz)

2. Security
- Enable RLS on both tables.
- Grant CRUD to `anon` + `authenticated` so the Data API can reach the table.
- Allow anon + authenticated CRUD because this is a single-tenant admin panel with no sign-in.
*/

CREATE TABLE IF NOT EXISTS monsters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  hp integer NOT NULL DEFAULT 100,
  damage integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON monsters TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_monsters" ON monsters;
CREATE POLICY "anon_select_monsters" ON monsters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_monsters" ON monsters;
CREATE POLICY "anon_insert_monsters" ON monsters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_monsters" ON monsters;
CREATE POLICY "anon_update_monsters" ON monsters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_monsters" ON monsters;
CREATE POLICY "anon_delete_monsters" ON monsters FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  class text NOT NULL DEFAULT 'Aventureiro',
  hp integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON players TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_players" ON players;
CREATE POLICY "anon_select_players" ON players FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_players" ON players;
CREATE POLICY "anon_insert_players" ON players FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_players" ON players;
CREATE POLICY "anon_update_players" ON players FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_players" ON players;
CREATE POLICY "anon_delete_players" ON players FOR DELETE
  TO anon, authenticated USING (true);