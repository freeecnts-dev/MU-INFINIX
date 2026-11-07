/*
# Update players class default and normalize old class values

1. Modified Tables
- `players`
  - Changed column default for `class` from 'Aventureiro' to 'Dark Knight' (a valid MU Online class).

2. Data Migration
- Any existing players with a class not in the allowed list (Dark Knight, Dark Wizard, Fairy Elf, Magic Gladiator, Dark Lord, Summoner, Rage Fighter) will have their class set to 'Dark Knight'.

3. Notes
- This ensures data consistency with the new 7-class MU Online list.
- No data is lost; only the class field is normalized for invalid values.
*/

ALTER TABLE players ALTER COLUMN class SET DEFAULT 'Dark Knight';

UPDATE players
SET class = 'Dark Knight'
WHERE class NOT IN ('Dark Knight', 'Dark Wizard', 'Fairy Elf', 'Magic Gladiator', 'Dark Lord', 'Summoner', 'Rage Fighter');