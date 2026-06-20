-- GRaiT GAMES leaderboard schema
-- Run once via: Cloudflare Dashboard → D1 → graitgames-scores → Console → paste & Execute

CREATE TABLE IF NOT EXISTS scores (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  game         TEXT    NOT NULL,
  initials     TEXT    NOT NULL CHECK(length(initials) = 3),
  score        INTEGER NOT NULL CHECK(score > 0),
  period       TEXT    NOT NULL,          -- 'YYYY-MM' in GMT, e.g. '2026-06'
  ip_hash      TEXT    NOT NULL DEFAULT '',
  submitted_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scores_game_period
  ON scores (game, period, score DESC);
