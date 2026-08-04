-- GRaiT GAMES daily-play schema (word games — 4ordle, fix-my-4ordle)
-- Run once via: Cloudflare Dashboard → D1 → graitgames-scores → Console → paste & Execute

CREATE TABLE IF NOT EXISTS daily_plays (
  game        TEXT    NOT NULL,
  local_date  TEXT    NOT NULL,                         -- 'YYYY-MM-DD' in the IP's timezone
  ip_hash     TEXT    NOT NULL,
  token       TEXT    NOT NULL DEFAULT '',              -- per-browser localStorage id
  timezone    TEXT    NOT NULL,                         -- e.g. 'America/Denver'
  started_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  outcome     TEXT    NOT NULL DEFAULT 'in_progress',   -- 'in_progress' | 'won' | 'lost'
  guesses     INTEGER NOT NULL DEFAULT 0,
  targets     TEXT    NOT NULL,                         -- JSON array of the puzzle's target words
  PRIMARY KEY (game, local_date, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_daily_plays_token
  ON daily_plays (game, local_date, token);
