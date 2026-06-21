/* ============================================================================
   CLOUDFLARE PAGES FUNCTION — GET /api/scores
   ----------------------------------------------------------------------------
   Returns the top 10 scores for a given game in the current GMT month.

   Query params:
     game  (required) — e.g. "snake"

   Response: { period: "2026-06", scores: [{ initials, score }, …] }

   D1 binding required: DB → graitgames-scores
   ============================================================================ */

const ALLOWED_GAMES = new Set(['snake', 'space-dogfight', '4ordle', 'memory-match', 'tic-tac-toe', 'save-my-chicks']);

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.DB) {
    return respond({ error: 'Database binding (DB) not configured on this deployment' }, 503);
  }

  const url = new URL(request.url);
  const game = url.searchParams.get('game');

  if (!game || !ALLOWED_GAMES.has(game)) {
    return respond({ error: 'Unknown or missing game parameter' }, 400);
  }

  const period = currentPeriod();

  const { results } = await env.DB.prepare(
    'SELECT initials, score FROM scores WHERE game = ? AND period = ? ORDER BY score DESC LIMIT 10'
  ).bind(game, period).all();

  return respond({ period, scores: results });
}

function currentPeriod() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function respond(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
