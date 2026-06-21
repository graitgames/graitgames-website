-- GRaiT GAMES leaderboard schema — switch rate limit to a 24-hour window
-- Run once via: Cloudflare Dashboard → D1 → graitgames-scores → Console → paste & Execute
--
-- Rate limiting moves from "N submissions per calendar month" to "N attempts
-- per rolling 24-hour window per player per game". window_started_at marks
-- when the player's current 5-attempt window began; once 24 hours have
-- passed since that timestamp, submit-score.js treats the window as expired
-- and resets it on the next attempt. Existing rows get NULL, which is
-- treated as "expired" — every player simply gets a fresh window.

ALTER TABLE scores ADD COLUMN window_started_at TEXT;
