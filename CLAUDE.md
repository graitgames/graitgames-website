# GRaiT GAMES — graitgames-website

This is the **live, deployed** GRaiT GAMES site repo (www.graitgames.com) — a
father-and-son project building browser games and learning to code together.
Static site (HTML + CSS + vanilla JS), hosted on **Cloudflare Pages**, which
auto-deploys on every push to `main`. See [README.md](README.md) for the full
project structure and brand quick-reference.

**If you were pointed at a different folder for a "GRaiT GAMES" task, stop and
confirm — there may be stale duplicate copies of games elsewhere on this
machine (`Documents\`, `Downloads\`, older clones) that are NOT this repo and
should not be edited.**

## Where things live

- `games/*.html` — every game, one self-contained HTML file each. This is the
  only place game files should be edited.
- Root-level `*.js` files (`nav.js`, `footer.js`, `leaderboard.js`,
  `game-over-card.js`, `touch-joystick.js`, `game-fullscreen.js`,
  `pause-button.js`) — shared components used across multiple games, included
  via `<script src="../component-name.js">`. `styles.css` is the shared
  design system.
- `games.html` — the game catalog page (cards + filtering).
- `admin/`, `functions/api/` — the Decap CMS editor and its Cloudflare Pages
  Functions: `auth.js` + `callback.js` (GitHub OAuth proxy), `scores.js`
  (GET the leaderboard for a game), `submit-score.js` (POST a new score,
  with per-game caps in `GAME_CAPS`).
- `blog/posts/` — blog posts as Markdown files.

## Before starting game work, read the relevant guide

- **New game with a leaderboard + mobile joystick** (continuous directional
  movement, e.g. Save My Chicks, Gnome Crawler) →
  [LEADERBOARD_JOYSTICK_GAME_STARTER.md](LEADERBOARD_JOYSTICK_GAME_STARTER.md).
  This documents the exact shared-component integration pattern (IIFE +
  self-injecting styles + `init(opts)` returning a handle) that
  `touch-joystick.js`, `game-over-card.js`, `game-fullscreen.js`, and
  `pause-button.js` all follow — new reusable UI should match this pattern,
  not be built inline per-game.
- **New word/keyboard game** (on-screen + physical keyboard input, typically
  no leaderboard, e.g. 4ordle, Fix My 4ordle) →
  [WORD_KEYBOARD_GAME_STARTER.md](WORD_KEYBOARD_GAME_STARTER.md). Documents
  the Tap to Play gate pattern, why the keyboard must NOT be tagged
  `data-fs-role="controls"`, and the flex/grid sizing gotchas for making the
  play area stretch to fill mobile fullscreen.
- **New game without a leaderboard/joystick/keyboard** (puzzle, turn-based)
  → [NEW_GAME_STARTER.md](NEW_GAME_STARTER.md).
- **Adding/reordering a game on the catalog page** →
  [GAME-CATALOG-MANAGEMENT-GUIDE.md](GAME-CATALOG-MANAGEMENT-GUIDE.md).
- **Blog posts / CMS** → [BLOG-CMS-SETUP.md](BLOG-CMS-SETUP.md) and
  [DECAP-CMS-TROUBLESHOOTING.md](DECAP-CMS-TROUBLESHOOTING.md).

## Local preview

`.claude/launch.json` already has a `"graitgames"` server config (a
PowerShell static file server on port 8000, no Node/Python needed) — use
`preview_start` with that name, then browse to
`http://localhost:8000/games/[game-name].html`.

## Conventions worth knowing

- Every game is pure HTML + CSS + vanilla JS in one file, wrapped in
  `(function () { 'use strict'; ... })();` — no frameworks, no build step.
- Brand colors/fonts are CSS custom properties already defined in
  `styles.css` — never hardcode hex values in a game file.
- **The desktop/PC play area is 760px wide on every game**
  (`.game-stage { max-width: 760px }`, with the play field at `width: 100%`
  inside it). Keep new games on that standard so they don't look smaller
  than the rest of the catalog, and cap any row meant to align with the play
  area (ability/buff bars, hint text) at the same 760px. Mobile fullscreen
  overrides this separately, so it only affects desktop.
- SVG icons only for UI glyphs (back arrow, restart, close) — never Unicode
  characters like `←`/`↺`, which render as emoji on mobile Safari.
- **When adding a new shared JS file at the repo root** (e.g. another game
  component alongside `leaderboard.js` / `pause-button.js`), add an explicit
  cache-control entry for its path in `_headers`. Cloudflare Pages' default is
  a **4-hour edge cache** on unspecified static assets, which is long enough
  to mask a deploy — a bugfix to a shared component can appear live on your
  machine but still serve stale to visitors for hours. Copy the pattern of an
  existing entry in `_headers` and be sure to name the exact path (not a
  glob) so revalidation is immediate.
- Only commit and push when explicitly asked.
