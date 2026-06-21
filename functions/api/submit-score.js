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

   D1 binding required: DB → graitgames-scores
   ============================================================================ */

const GAME_CAPS = {
  'snake':        4000,
  'space-dogfight': 9999,
  '4ordle':       9999,
  'memory-match': 8000,
};

const MAX_SUBMISSIONS_PER_MONTH = 25;

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
  // submission_count tracks total attempts, since a returning player's row is
  // updated in place rather than getting a new row per submission.
  const ipHash = hashIP(request.headers.get('CF-Connecting-IP') || '');
  const { results: ownRows } = await env.DB.prepare(
    'SELECT id, score, submission_count FROM scores WHERE game = ? AND period = ? AND ip_hash = ?'
  ).bind(game, period, ipHash).all();
  const ownRow = ownRows[0];

  // Rate limit: max submission attempts per IP per game per month
  const attemptCount = ownRow ? ownRow.submission_count : 0;
  if (attemptCount >= MAX_SUBMISSIONS_PER_MONTH) {
    return respond({ error: 'Too many submissions this month' }, 429);
  }

  if (ownRow) {
    // Returning player: only update if this beats their own previous best
    if (s <= ownRow.score) {
      await env.DB.prepare(
        'UPDATE scores SET submission_count = submission_count + 1 WHERE id = ?'
      ).bind(ownRow.id).run();
      return respond({ accepted: false, message: 'Not higher than your best score this month' });
    }
    await env.DB.prepare(
      'UPDATE scores SET initials = ?, score = ?, submission_count = submission_count + 1, submitted_at = datetime(\'now\') WHERE id = ?'
    ).bind(initials, s, ownRow.id).run();
  } else {
    // New player: must crack the current top 10 to get a first row
    const { results: top10 } = await env.DB.prepare(
      'SELECT score FROM scores WHERE game = ? AND period = ? ORDER BY score DESC LIMIT 10'
    ).bind(game, period).all();

    if (top10.length >= 10 && s <= top10[top10.length - 1].score) {
      return respond({ accepted: false, message: 'Score did not make the top 10 this month' });
    }

    await env.DB.prepare(
      'INSERT INTO scores (game, initials, score, period, ip_hash) VALUES (?, ?, ?, ?, ?)'
    ).bind(game, initials, s, period, ipHash).run();
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
