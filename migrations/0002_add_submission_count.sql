-- GRaiT GAMES leaderboard schema — submission rate limiting
-- Run once via: Cloudflare Dashboard → D1 → graitgames-scores → Console → paste & Execute
--
-- Personal-best dedup means a returning player's submissions UPDATE their
-- existing row instead of INSERTing a new one, so row count per ip_hash can
-- no longer be used to rate-limit submission attempts. This column tracks
-- the actual attempt count per player per game per month.

ALTER TABLE scores ADD COLUMN submission_count INTEGER NOT NULL DEFAULT 1;
