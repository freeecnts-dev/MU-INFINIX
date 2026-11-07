/*
# Add login, zen, and online status columns to players table

1. Modified Tables
- `players`
  - Added `login` (text, not null, unique) - player login/username for the game
  - Added `zen` (bigint, not null, default 0) - in-game currency (Zen)
  - Added `is_online` (boolean, not null, default false) - online/offline status

2. Notes
- Existing rows (if any) get login = concatenation of name + '_login', zen = 0, is_online = false.
- The login column has a unique constraint to prevent duplicate logins.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'login') THEN
    ALTER TABLE players ADD COLUMN login text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'zen') THEN
    ALTER TABLE players ADD COLUMN zen bigint NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'players' AND column_name = 'is_online') THEN
    ALTER TABLE players ADD COLUMN is_online boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Ensure unique logins (only add if doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'players_login_key') THEN
    ALTER TABLE players ADD CONSTRAINT players_login_key UNIQUE (login);
  END IF;
END $$;