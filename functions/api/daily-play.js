/* ============================================================================
   CLOUDFLARE PAGES FUNCTION — /api/daily-play
   ----------------------------------------------------------------------------
   Enforces the once-per-day play limit on the Word games (4ordle,
   fix-my-4ordle). One play per IP per game per LOCAL calendar day, where
   "local" is the timezone of the player's IP (via Cloudflare's request.cf).

   Verbs:
     GET  /api/daily-play?game=<key>&token=<tok>
       → { status: 'available', resetAtUtcIso, timezone }
       → { status: 'played', outcome, guesses, targets, resetAtUtcIso, timezone }

     POST /api/daily-play
       body: { game, token, targets: string[] }
       Attempts to claim today's play. Idempotent by (game, local_date, ip_hash).
       → { status: 'claimed', resetAtUtcIso, timezone }
       → { status: 'played', outcome, guesses, targets, resetAtUtcIso, timezone }

     PATCH /api/daily-play
       body: { game, token, outcome: 'won' | 'lost', guesses: number }
       Updates today's row with the final result. Fire-and-forget; never fails
       the game if the write doesn't take.

   D1 binding required: DB → graitgames-scores (table `daily_plays`, migration
   0004). The daily-play system is fully independent of the leaderboard
   `scores` table.
   ============================================================================ */

const ALLOWED_GAMES = new Set(['4ordle', 'fix-my-4ordle']);

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.DB) return respond({ error: 'Database binding (DB) not configured' }, 503);

  const url = new URL(request.url);
  const game = url.searchParams.get('game');
  if (!game || !ALLOWED_GAMES.has(game)) return respond({ error: 'Unknown game' }, 400);

  const tz = resolveTimezone(request);
  const localDate = localDateForTz(tz);
  const resetAtUtcIso = nextLocalMidnightUtcIso(tz);
  const ipHash = hashIP(request.headers.get('CF-Connecting-IP') || '');

  const existing = await readTodaysRow(env.DB, game, localDate, ipHash);
  if (existing) {
    return respond(playedPayload(existing, resetAtUtcIso, tz));
  }
  return respond({ status: 'available', resetAtUtcIso, timezone: tz });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.DB) return respond({ error: 'Database binding (DB) not configured' }, 503);

  let body;
  try { body = await request.json(); } catch { return respond({ error: 'Invalid JSON body' }, 400); }

  const { game, token, targets } = body || {};
  if (!game || !ALLOWED_GAMES.has(game)) return respond({ error: 'Unknown game' }, 400);
  if (!Array.isArray(targets) || targets.length === 0 || targets.length > 8) {
    return respond({ error: 'targets must be a 1-8 element array' }, 400);
  }
  const safeTargets = targets.map(t => String(t).slice(0, 12).toLowerCase());
  const safeToken = typeof token === 'string' ? token.slice(0, 64) : '';

  const tz = resolveTimezone(request);
  const localDate = localDateForTz(tz);
  const resetAtUtcIso = nextLocalMidnightUtcIso(tz);
  const ipHash = hashIP(request.headers.get('CF-Connecting-IP') || '');

  // Try to claim. PK conflict = someone (this same IP) already played today.
  const insert = await env.DB.prepare(
    `INSERT INTO daily_plays (game, local_date, ip_hash, token, timezone, targets)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (game, local_date, ip_hash) DO NOTHING`
  ).bind(game, localDate, ipHash, safeToken, tz, JSON.stringify(safeTargets)).run();

  const inserted = insert && insert.meta && insert.meta.changes === 1;
  if (inserted) {
    return respond({ status: 'claimed', resetAtUtcIso, timezone: tz });
  }

  const existing = await readTodaysRow(env.DB, game, localDate, ipHash);
  if (existing) return respond(playedPayload(existing, resetAtUtcIso, tz));

  // Shouldn't happen — insert was a no-op but no row is present. Treat as claim.
  return respond({ status: 'claimed', resetAtUtcIso, timezone: tz });
}

export async function onRequestPatch(context) {
  const { env, request } = context;
  if (!env.DB) return respond({ error: 'Database binding (DB) not configured' }, 503);

  let body;
  try { body = await request.json(); } catch { return respond({ error: 'Invalid JSON body' }, 400); }

  const { game, outcome, guesses } = body || {};
  if (!game || !ALLOWED_GAMES.has(game)) return respond({ error: 'Unknown game' }, 400);
  if (outcome !== 'won' && outcome !== 'lost') return respond({ error: 'Invalid outcome' }, 400);
  const g = Number(guesses);
  if (!Number.isInteger(g) || g < 0 || g > 20) return respond({ error: 'Invalid guesses' }, 400);

  const tz = resolveTimezone(request);
  const localDate = localDateForTz(tz);
  const ipHash = hashIP(request.headers.get('CF-Connecting-IP') || '');

  await env.DB.prepare(
    `UPDATE daily_plays SET outcome = ?, guesses = ?
     WHERE game = ? AND local_date = ? AND ip_hash = ? AND outcome = 'in_progress'`
  ).bind(outcome, g, game, localDate, ipHash).run();

  return respond({ ok: true });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}

/* ---------- helpers ---------- */

async function readTodaysRow(db, game, localDate, ipHash) {
  const { results } = await db.prepare(
    `SELECT outcome, guesses, targets, timezone
     FROM daily_plays
     WHERE game = ? AND local_date = ? AND ip_hash = ?`
  ).bind(game, localDate, ipHash).all();
  return results && results[0] ? results[0] : null;
}

function playedPayload(row, resetAtUtcIso, tz) {
  let targets = [];
  try { targets = JSON.parse(row.targets); } catch { /* stored corrupt — fall through */ }
  return {
    status: 'played',
    outcome: row.outcome,
    guesses: row.guesses,
    targets,
    resetAtUtcIso,
    timezone: row.timezone || tz,
  };
}

function resolveTimezone(request) {
  // request.cf.timezone is populated by Cloudflare's edge; missing in Wrangler
  // dev or when the request is proxied internally. UTC is the safest fallback.
  const tz = request.cf && request.cf.timezone;
  return typeof tz === 'string' && tz.length > 0 ? tz : 'UTC';
}

function localDateForTz(tz) {
  // en-CA formats as YYYY-MM-DD, which we want as the storage key.
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date());
}

function nextLocalMidnightUtcIso(tz) {
  // Compute the UTC instant at which tomorrow's 00:00 local time will occur.
  // Approach: read the current wall-clock in `tz`, derive the tz's current
  // UTC offset from that, then translate tomorrow-local-midnight back to UTC.
  //
  // DST caveat: this uses today's offset for tomorrow's midnight. Across a
  // DST transition day the returned UTC instant can be off by one hour. That
  // is acceptable for a countdown display used only for player messaging.
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(now);
  const get = (t) => parts.find(p => p.type === t).value;
  const y = +get('year'), m = +get('month'), d = +get('day');
  const h = +get('hour'), mi = +get('minute'), s = +get('second');
  const wallClockAsUtcMs = Date.UTC(y, m - 1, d, h, mi, s);
  const offsetMs = wallClockAsUtcMs - now.getTime();
  const tomorrowLocalMidnightAsUtcMs = Date.UTC(y, m - 1, d + 1, 0, 0, 0);
  return new Date(tomorrowLocalMidnightAsUtcMs - offsetMs).toISOString();
}

// Non-cryptographic IP hash for rate limiting only — matches submit-score.js.
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
