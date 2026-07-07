# GRaiT GAMES — graitgames-website

This is the **live, deployed** GRaiT GAMES site repo (www.graitgames.com) — a
father-and-son project building browser games and learning to code together.
Static site (HTML + CSS + vanilla JS), hosted on **Cloudflare Pages**, which
auto-deploys on every push to `main`. See [README.md](README.md) for the full
project structure and brand quick-reference.

**If you were pointed at a different folder for a "GRaiT GAMES" task, stop and
confirm — there are stale duplicate copies of some games elsewhere on this
machine (e.g. under `Documents\Benjamin\Grait Games\Games\`) that are NOT
this repo and should not be edited.**

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
  Functions (GitHub OAuth proxy, leaderboard score submission).
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
- **New game without a leaderboard/joystick** (puzzle, word game, turn-based)
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
- SVG icons only for UI glyphs (back arrow, restart, close) — never Unicode
  characters like `←`/`↺`, which render as emoji on mobile Safari.
- Only commit and push when explicitly asked.
