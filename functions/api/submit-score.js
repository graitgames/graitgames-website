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

   D1 binding required: DB → graitgames-scores
   ============================================================================ */

const GAME_CAPS = {
  'snake':        4000,
  'space-dogfight': 9999,
  '4ordle':       9999,
  'memory-match': 9999,
  'tic-tac-toe':  9999,
};

const MAX_SUBMISSIONS_PER_MONTH = 5;

export async function onRequestPost(context) {
  const { env, request } = context;

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

  // Rate limit: max submissions per IP per game per month
  const ipHash = hashIP(request.headers.get('CF-Connecting-IP') || '');
  const { results: rateRows } = await env.DB.prepare(
    'SELECT COUNT(*) AS cnt FROM scores WHERE game = ? AND period = ? AND ip_hash = ?'
  ).bind(game, period, ipHash).all();

  if (rateRows[0].cnt >= MAX_SUBMISSIONS_PER_MONTH) {
    return respond({ error: 'Too many submissions this month' }, 429);
  }

  // Check whether score beats the current 10th-place entry
  const { results: top10 } = await env.DB.prepare(
    'SELECT score FROM scores WHERE game = ? AND period = ? ORDER BY score DESC LIMIT 10'
  ).bind(game, period).all();

  if (top10.length >= 10 && s <= top10[top10.length - 1].score) {
    return respond({ accepted: false, message: 'Score did not make the top 10 this month' });
  }

  // Insert the new score
  await env.DB.prepare(
    'INSERT INTO scores (game, initials, score, period, ip_hash) VALUES (?, ?, ?, ?, ?)'
  ).bind(game, initials, s, period, ipHash).run();

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
