/* ============================================================================
   CLOUDFLARE PAGES FUNCTION — POST /api/submit-score
   ----------------------------------------------------------------------------
   Validates and records a leaderboard entry for the current GMT month.

   Request body (JSON): { game, initials, score }
     game      — must be a known game key (e.g. "snake")
     initials  — exactly 3 uppercase A-Z characters
     score     — positive integer, must not exceed per-game cap

   Response:
     { accepted: true,  scores: [{ initials, score }, …] }  — made the board
     { accepted: false, message: "…" }                       — didn't qualify
     { error: "…" }                                          — validation error

   Each player (by ip_hash) keeps at most one row per game per month — the
   leaderboard shows personal bests only. A new submission only replaces that
   row if it beats the player's own previous score this month.

   Rate limit is a fixed 24-hour window per player per game: each player gets
   MAX_SUBMISSIONS_PER_WINDOW attempts starting from their first attempt in a
   window; once 24 hours have passed since that first attempt, the window
   resets and they get a fresh set of attempts.

   D1 binding required: DB → graitgames-scores
   ============================================================================ */

const GAME_CAPS = {
  'space-dogfight':        9999,
  'space-dogfight-easy':   999,
  'space-dogfight-medium': 999,
  'space-dogfight-hard':   999,
  '4ordle':         9999,
  'save-my-chicks': 99999,
  'gnome-crawler':  99999,
  'aim-trainer':    99999,
};

const MAX_SUBMISSIONS_PER_WINDOW = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.DB) {
    return respond({ error: 'Database binding (DB) not configured on this deployment' }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return respond({ error: 'Invalid JSON body' }, 400);
  }

  const { game, initials, score } = body;

  // Validate game
  if (!game || !(game in GAME_CAPS)) {
    return respond({ error: 'Unknown game' }, 400);
  }

  // Validate initials: exactly 3 uppercase A–Z
  if (typeof initials !== 'string' || !/^[A-Z]{3}$/.test(initials)) {
    return respond({ error: 'Initials must be exactly 3 uppercase letters A–Z' }, 400);
  }

  // Validate score
  const s = Number(score);
  if (!Number.isInteger(s) || s < 1 || s > GAME_CAPS[game]) {
    return respond({ error: 'Invalid score' }, 400);
  }

  const period = currentPeriod();

  // This player's existing row for this game/month, if any (personal best so far).
  // submission_count + window_started_at track a rolling 24-hour attempt
  // budget, since a returning player's row is updated in place rather than
  // getting a new row per submission.
  const ipHash = hashIP(request.headers.get('CF-Connecting-IP') || '');
  const { results: ownRows } = await env.DB.prepare(
    'SELECT id, score, submission_count, window_started_at FROM scores WHERE game = ? AND period = ? AND ip_hash = ?'
  ).bind(game, period, ipHash).all();
  const ownRow = ownRows[0];

  // Rate limit: max submission attempts per IP per game in a rolling 24h window.
  // A missing/expired window_started_at means the window has reset.
  const now = new Date();
  const windowStart = ownRow && ownRow.window_started_at ? new Date(ownRow.window_started_at + 'Z') : null;
  const windowExpired = !windowStart || (now - windowStart) >= RATE_LIMIT_WINDOW_MS;
  const attemptsInWindow = windowExpired ? 0 : ownRow.submission_count;

  if (attemptsInWindow >= MAX_SUBMISSIONS_PER_WINDOW) {
    return respond({ error: 'Too many submissions in the last 24 hours. Try again later.' }, 429);
  }

  const nextCount = attemptsInWindow + 1;
  const nextWindowStart = windowExpired ? sqliteNow(now) : ownRow.window_started_at;

  if (ownRow) {
    // Returning player: only update if this beats their own previous best
    if (s <= ownRow.score) {
      await env.DB.prepare(
        'UPDATE scores SET submission_count = ?, window_started_at = ? WHERE id = ?'
      ).bind(nextCount, nextWindowStart, ownRow.id).run();
      return respond({ accepted: false, message: 'Not higher than your best score this month' });
    }
    await env.DB.prepare(
      'UPDATE scores SET initials = ?, score = ?, submission_count = ?, window_started_at = ?, submitted_at = datetime(\'now\') WHERE id = ?'
    ).bind(initials, s, nextCount, nextWindowStart, ownRow.id).run();
  } else {
    // New player: must crack the current top 10 to get a first row
    const { results: top10 } = await env.DB.prepare(
      'SELECT score FROM scores WHERE game = ? AND period = ? ORDER BY score DESC LIMIT 10'
    ).bind(game, period).all();

    if (top10.length >= 10 && s <= top10[top10.length - 1].score) {
      return respond({ accepted: false, message: 'Score did not make the top 10 this month' });
    }

    await env.DB.prepare(
      'INSERT INTO scores (game, initials, score, period, ip_hash, submission_count, window_started_at) VALUES (?, ?, ?, ?, ?, 1, ?)'
    ).bind(game, initials, s, period, ipHash, sqliteNow(now)).run();
  }

  // Return the updated top 10
  const { results: updated } = await env.DB.prepare(
    'SELECT initials, score FROM scores WHERE game = ? AND period = ? ORDER BY score DESC LIMIT 10'
  ).bind(game, period).all();

  return respond({ accepted: true, scores: updated });
}

// Handle CORS preflight (not strictly needed — same-origin — but keeps fetch clean)
export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

// Formats a Date as SQLite's datetime('now') does: 'YYYY-MM-DD HH:MM:SS' in UTC
function sqliteNow(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function currentPeriod() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Non-cryptographic IP hash for rate limiting only (no raw IPs stored)
function hashIP(ip) {
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (Math.imul(31, h) + ip.charCodeAt(i)) | 0;
  }
  return String(h >>> 0);
}

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
