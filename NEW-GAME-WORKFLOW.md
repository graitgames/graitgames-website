# New Game Workflow — from Idea to Live Site

This is the **top-level entry point** for building a new browser game and
publishing it to www.graitgames.com. It ties together the three starter
files, the catalog and CMS guides, and the shared components — read this
first; it points at everything else you'll need.

The workflow is one decision + three phases:

1. **Pick the archetype** (biggest single decision — dictates which starter you use)
2. **Prototype in Claude Artifacts** using the starter's ready-to-paste prompt
3. **Integrate into the live site** using the starter's integration checklist
4. **QA on a real device** before committing

Each phase points at a dedicated document that goes deep. This one shows
how they fit together.

---

## Decide the archetype first

Match the game to one of the three starters. This is the biggest
determinant of code quality, because the archetypes reflect real bugs the
existing games surfaced — the checklists in each starter exist because
we've paid for those bugs already.

| Game shape | Starter | Live examples |
|------------|---------|---------------|
| Continuous movement + monthly leaderboard + mobile joystick | [LEADERBOARD_JOYSTICK_GAME_STARTER.md](./LEADERBOARD_JOYSTICK_GAME_STARTER.md) | Gnome Crawler, Save My Chicks, Night Fishing |
| On-screen keyboard word game (usually no leaderboard) | [WORD_KEYBOARD_GAME_STARTER.md](./WORD_KEYBOARD_GAME_STARTER.md) | 4ordle, Fix My 4ordle |
| Anything else (puzzle, turn-based, no leaderboard / joystick / keyboard) | [NEW_GAME_STARTER.md](./NEW_GAME_STARTER.md) | — |

Open the starter you picked and **read its intro paragraph before doing
anything else** — it explains which sharp edges that archetype has, and
why the checklists below exist.

---

## Phase 1 — Prototype in Claude Artifacts

1. In the starter, copy the entire `~~~`-fenced **Artifacts prompt block**
   (the "copy in one click" section). It contains the CSS tokens, HTML
   skeleton, IIFE JS boilerplate, brand tokens, and every constraint the
   site needs — pre-written.
2. Paste into a **new Claude Artifacts conversation** on claude.ai. No
   system prompt or extra context is needed; the starter IS the system
   prompt.
3. Fill in the placeholders at the top of the pasted block:
   `[GAME NAME]`, `[GAME TITLE IN CAPS]`, the one-sentence description,
   and (for the joystick starter) the dominant accent color for the
   game-over card.
4. Iterate with Claude in the same Artifacts thread until the game plays
   well. Keep it **single-file HTML + inline CSS + IIFE JS** — no
   frameworks, no build step. That constraint is baked into the prompt.

**Do NOT include in the Artifact:** the nav bar, footer, a `<link>` to
`styles.css`, or any real leaderboard / joystick UI. Each starter's
"Do NOT include" section spells this out — those come in during
integration.

---

## Phase 2 — Integrate into the live site

Once the Artifacts prototype plays well, save the file as
`games/[game-name].html` in the repo, then work top-to-bottom through the
**Integration Checklist** at the bottom of whichever starter you used.
It covers, in order:

- **CSS cleanup** — remove the inlined tokens and base classes; they're
  already in `styles.css`.
- **HTML head + body** — swap the Artifact font `<link>` for the full
  stack, add `<link rel="stylesheet" href="../styles.css" />`, add the
  `<nav id="main-nav">` and `<main class="container-narrow section" id="game">`
  shell, wire the skip link.
- **Shared components** — depending on archetype, add `<script>` tags for
  `leaderboard.js`, `game-fullscreen.js`, `game-over-card.js`,
  `touch-joystick.js`, and optionally `pause-button.js` — each with the
  `.init({...})` snippet in the checklist.
  **`touch-joystick.js` is non-negotiable** for joystick games. Every
  joystick fix (iOS "Copy…" callout suppression, lost-pointerup
  fallback, hard-drag "jam" bug) lives in that shared file. A per-game
  custom joystick will miss all of them and re-invite bugs we've
  already paid for.
- **Backend wiring (leaderboard only)** — add the game key to
  `ALLOWED_GAMES` in `functions/api/scores.js` **and** to `GAME_CAPS`
  in `functions/api/submit-score.js`. Missing `ALLOWED_GAMES` means
  scores submit but never display; missing `GAME_CAPS` means legitimate
  high scores get rejected as suspected cheating.
- **Catalog card** — add a new `<article class="game-card">` in
  `games.html`, inserted as the **first** card in `#game-grid` (the
  "All Games" view always shows newest → oldest), with `data-category`
  and `data-creator="father"|"son"` both set. Renumber the
  `<!-- N. ... -->` comments above the surrounding cards. Full
  walkthrough in
  [GAME-CATALOG-MANAGEMENT-GUIDE.md](./GAME-CATALOG-MANAGEMENT-GUIDE.md).
- **Thumbnail** — real 800×450 JPG at `images/[game-name].jpg`,
  under 100 KB. Matches every other card on the site.

Every checklist item exists because a past game broke without it. Don't
skip the ones that "look obvious" — they usually aren't.

---

## Phase 3 — QA on a real device

Each starter ends with a QA checklist tuned to its archetype. Highlights
from the joystick one, all of which came from real shipped-and-broken
moments:

- **Extreme-direction drag test.** Hold the joystick hard-right for 5+
  seconds, then hard-left, on a real iPhone. This is exactly what caught
  the Night Fishing right-jam. The joystick sits on the LEFT of the
  touch-controls row, so hard-right drags historically surface
  pointer-tracking bugs first.
- **Long-press callout test.** No iOS "Copy / Look Up" menu should
  appear on the canvas, on stat labels, or on overlay text between
  rounds.
- **Restart twice in a row on mobile.** Surfaces the `keys = {}`
  reassignment bug — a joystick loses its object reference and silently
  stops working after the first restart.

**Do not rely on desktop DevTools emulation alone.** Every joystick bug
the shared component fixes is iOS-specific.

---

## Cache-and-deploy gotcha

If you add a new file at the repo root (a new shared component, a new
asset that game pages load by plain path), add its path to `_headers`
with the same `Cache-Control: public, max-age=0, must-revalidate` block
the other entries use. Cloudflare Pages' 4-hour default edge cache will
otherwise mask fixes for hours after you push. See the "When adding a
new shared JS file" convention in [CLAUDE.md](./CLAUDE.md).

---

## Where to look when things go wrong

| Symptom | Where to look first |
|---------|---------------------|
| Game not showing on catalog page, or category count wrong | [GAME-CATALOG-MANAGEMENT-GUIDE.md](./GAME-CATALOG-MANAGEMENT-GUIDE.md) |
| `/admin/` login broken | [DECAP-CMS-TROUBLESHOOTING.md](./DECAP-CMS-TROUBLESHOOTING.md) |
| Blog post published in the CMS but not appearing on the site | [BLOG-CMS-SETUP.md](./BLOG-CMS-SETUP.md) §6 — every post also needs a rendered HTML page and a card in `blog.html` |
| Fix pushed to `main`, works locally, still broken live 30+ min later | Check `_headers` for the file — 4h Cloudflare cache. See [CLAUDE.md](./CLAUDE.md) conventions block. |
| Deploy itself failed | Cloudflare Pages dashboard → Deployments → build logs |
| Joystick / touch / overlay bug on iOS specifically | Confirm `touch-joystick.js` is loaded (not a per-game custom joystick), and that `_headers` isn't caching a stale copy |
