# GRaiT GAMES — New Game Starter

Use this file whenever you want to prototype a new game in **Claude Artifacts**.

**How to use:**
1. Click the copy button on the block below (top-right corner of the grey box).
2. Paste into a new Claude Artifacts conversation.
3. Fill in the three placeholders — `[GAME NAME]`, `[GAME TITLE IN CAPS]`, and the description lines — then decide on the leaderboard line and send.
4. Once the game plays well in Artifacts, follow the **Integration Checklist** at the bottom to wire it into the live site.

---

## Artifacts Prompt — copy in one click

~~~
Build a browser game for GRaiT GAMES called [GAME NAME].

[1–2 sentence description of the game concept and win condition.]

LEADERBOARD DECISION (delete one before sending):
> This game DOES have a leaderboard. Include all sections marked [LEADERBOARD].
> This game DOES NOT have a leaderboard. Delete all sections marked [LEADERBOARD].

---

### Tech rules
- Pure HTML + CSS + vanilla JavaScript in a single file — no frameworks, no libraries, no build step.
- Wrap all JS in an IIFE: (function () { 'use strict'; /* … */ })();
- No TypeScript, no JSX, no ES modules.
- Keep code readable — this is a father-and-son educational project.
- If the game uses keyboard input (arrow keys, WASD, space) for movement or firing, call
  e.preventDefault() in the keydown handler for every key the game uses. Without this,
  arrow keys and space scroll the whole page during gameplay instead of just controlling the game.

---

### Brand & visual style
Retro-futuristic synthwave arcade. Dark backgrounds, neon glow accents, high contrast.
Primary colors: orange #FF6B2B and green #39FF14. Cyan #00EAFF is a supporting accent.
No washed-out pastels. No heavy purple or magenta in primary UI chrome.

Use these CSS custom properties at the top of your <style> block.
Do not hardcode any hex values anywhere else in the file.

:root {
  /* Brand colors */
  --color-orange:      #FF6B2B;
  --color-green:       #39FF14;
  --color-cyan:        #00EAFF;
  --color-cyan-2:      #00C8DC;

  /* Backgrounds */
  --bg-primary:        #07070F;
  --bg-secondary:      #0D0D1A;
  --bg-panel:          #131323;

  /* Text */
  --text-primary:      #FFFFFF;
  --text-muted:        rgba(255, 255, 255, 0.6);
  --text-description:  rgba(255, 255, 255, 0.75);

  /* Borders */
  --border-accessible: rgba(255, 255, 255, 0.15);
  --border-radius:     6px;
  --border-radius-lg:  10px;

  /* Neon glow — box-shadow / text-shadow only, never rely on for readability */
  --glow-green:        0 0 12px rgba(57, 255, 20, 0.45);
  --glow-orange:       0 0 12px rgba(255, 107, 43, 0.45);
  --glow-cyan:         0 0 12px rgba(0, 234, 255, 0.35);

  /* Typography */
  --font-logo:         'Press Start 2P', monospace;    /* pixel / game titles   */
  --font-headline:     'Orbitron', sans-serif;          /* h1–h2 headings        */
  --font-body:         'Space Grotesk', sans-serif;     /* body / nav / labels   */
  --font-mono:         'Share Tech Mono', monospace;    /* stats / scores / code */
}

Load all four fonts from Google Fonts in the <head>:

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />

---

### Required CSS — paste inside your <style> block

/* Page base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
}

/* Header bar: back | title | restart */
.game-header {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  border-bottom: 1px solid var(--border-accessible);
  padding-bottom: 10px;
  margin-bottom: 12px;
}

/* Game title — Press Start 2P, cyan, 0.9rem */
.game-title-bar {
  margin: 0;
  font-family: var(--font-logo);
  font-size: 0.9rem;
  letter-spacing: 2px;
  line-height: 1;
  color: var(--color-cyan);
  display: flex;
  align-items: center;
  height: 2.4rem;
}

/* Back button — square, cyan outline. Always combine with .btn and
   .btn-outline-cyan (see Required HTML structure below) — .btn-icon
   alone is unstyled on the live site. */
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  min-height: 2.4rem;
  padding: 0;
  flex-shrink: 0;
  background: transparent;
  border: 2px solid var(--color-cyan);
  border-radius: var(--border-radius);
  color: var(--color-cyan);
  cursor: pointer;
  text-decoration: none;
  transition: background 0.15s, box-shadow 0.15s;
}
.btn-icon:hover { background: rgba(0, 234, 255, 0.1); box-shadow: var(--glow-cyan); }

/* Restart button — square, green outline */
.btn-restart {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.4rem;
  height: 2.4rem;
  min-height: 2.4rem;
  padding: 0;
  flex-shrink: 0;
  background: transparent;
  border: 2px solid var(--color-green);
  border-radius: var(--border-radius);
  color: var(--color-green);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
}
.btn-restart:hover    { background: var(--color-green); color: var(--bg-primary); box-shadow: var(--glow-green); }
.btn-restart:disabled { border-color: var(--border-accessible); color: var(--text-muted); cursor: not-allowed; }
.btn-restart:focus-visible { outline: 2px solid var(--color-cyan); outline-offset: 3px; }

/* Stats row */
.game-stats {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}
.stat-box {
  flex: 1 1 0;
  min-width: 100px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-accessible);
  border-radius: var(--border-radius-lg);
  padding: 12px;
  text-align: center;
}
.stat-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.stat-value {
  font-family: var(--font-headline);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-green);
}

/* Game stage — wrapper around the play area.
   760px is the SITE-WIDE STANDARD play-area width for PC/desktop gameplay.
   Every game uses it (Save My Chicks, Aim Trainer, Gnome Crawler) so the play
   field is the same size everywhere in the catalog — do NOT pick a different
   max-width. Give the play field itself width:100% inside this stage and let
   its own aspect-ratio set the height. Mobile fullscreen overrides this cap
   separately, so it only affects desktop. */
.game-stage {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

/* General-purpose action button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  font-family: var(--font-headline);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  cursor: pointer;
  text-decoration: none;
  transition: box-shadow 0.15s, background 0.15s;
}
.btn-primary      { background: var(--color-green);  color: var(--bg-primary); border-color: var(--color-green); }
.btn-primary:hover      { box-shadow: var(--glow-green); }
.btn-secondary    { background: var(--color-orange); color: var(--bg-primary); border-color: var(--color-orange); }
.btn-secondary:hover    { box-shadow: var(--glow-orange); }
.btn-outline-cyan { background: transparent; color: var(--color-cyan); border-color: var(--color-cyan); }
.btn-outline-cyan:hover { background: rgba(0,234,255,0.08); box-shadow: var(--glow-cyan); }

---

### Required HTML structure — paste inside <body>

<body style="margin:0; background:var(--bg-primary); color:var(--text-primary); font-family:var(--font-body);">

  <!-- Game container -->
  <div style="max-width:800px; margin:0 auto; padding:24px 16px;">

    <!-- HEADER BAR: back | game title | restart — required on every game page -->
    <div class="game-header">

      <!-- Back button — SVG left-arrow, never a text character.
           class must be "btn btn-outline-cyan btn-icon" (all three) to match the live site. -->
      <a href="/games.html" class="btn btn-outline-cyan btn-icon" aria-label="Back to Catalog">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
        </svg>
      </a>

      <!-- Game title: Press Start 2P, cyan, 0.9rem -->
      <p class="game-title-bar" role="heading" aria-level="1">[GAME TITLE IN CAPS]</p>

      <!-- Restart button — SVG circular arrow, never the ↺ character (renders as emoji on Safari) -->
      <button type="button" class="btn-restart" id="restartBtn" aria-label="Restart game">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>

    <!-- Description line -->
    <p style="text-align:center; color:var(--text-description); margin-bottom:24px; font-family:var(--font-body);">
      [One-sentence description.]
    </p>

    <!-- Stats row -->
    <div class="game-stats">
      <div class="stat-box">
        <div class="stat-label">Score</div>
        <div class="stat-value" id="score">0</div>
      </div>
    </div>

    <!-- Game area — class="game-stage" is required. On the live site this is the
         element the shared leaderboard module anchors its panel/overlay to
         [LEADERBOARD], so keep the class even though nothing leaderboard-related
         needs to be built here in Artifacts.

         IMPORTANT if your game surface is a <canvas> (or anything else sized with
         position:absolute; inset:0): put that sizing on an INNER wrapper, not
         directly on .game-stage. Example:
           <div class="game-stage">
             <div class="game-frame" style="position:relative; width:100%; aspect-ratio:4/3;">
               <canvas style="position:absolute; inset:0; width:100%; height:100%;"></canvas>
               <div class="overlay" id="overlay">...</div>
             </div>
           </div>
         Reason: .game-stage must have real, normal-flow height of its own.
         [LEADERBOARD] leaderboard.js appends its Top 10 panel as a plain in-flow
         child of .game-stage. If everything inside .game-stage is absolutely
         positioned (true of most canvas games), the panel has nothing to flow
         below and ends up overlapping the game instead of appearing underneath
         it on mobile. -->
    <div class="game-stage">

      <!-- [YOUR GAME MARKUP HERE] -->

      <!-- Standard overlay (ready / paused / game-over) -->
      <div class="overlay" id="overlay">
        <h2 id="overlay-title">Ready?</h2>
        <p id="overlay-text">[Start instructions]</p>
        <button type="button" class="btn btn-secondary" id="start-btn">▶ Start Game</button>
      </div>

    </div><!-- /.game-stage -->

  </div>

  <script>
  (function () {
    'use strict';

    /* ── YOUR GAME LOGIC HERE ── */
    var currentScore = 0;

    function showStandardOverlay(title, text, btnText) {
      document.getElementById('overlay-title').textContent = title;
      document.getElementById('overlay-text').innerHTML = text;
      document.getElementById('start-btn').textContent = btnText;
      document.getElementById('overlay').classList.remove('hidden');
    }

    function gameOver() {
      /* [LEADERBOARD] On the live site this becomes:
         Leaderboard.trySubmit(currentScore, function (accepted) {
           showStandardOverlay(accepted ? '✓ Score Saved!' : '💀 Game Over',
             accepted ? 'Check the leaderboard!' : 'Better luck next time.', '▶ Play Again');
         });
         Don't build the leaderboard UI here — leaderboard.js (shared site module)
         injects the Top 10 panel and the initials-entry overlay automatically. */
      showStandardOverlay('💀 Game Over', 'Better luck next time.', '▶ Play Again');
    }

    document.getElementById('restartBtn').addEventListener('click', init);

    function init() {
      currentScore = 0;
    }

    init();
  })();
  </script>

</body>

---

### Accessibility rules
- Every interactive element without visible text needs an aria-label.
- Score / status displays that update dynamically: add role="status" aria-live="polite".
- Focus rings: use a bright cyan, green, or orange outline on :focus-visible — never remove outlines.
- Minimum touch target: 44×44 px for any tappable element on mobile.
- Never use color alone to communicate state (add a label, icon, or pattern too).

---

### Do NOT include in the Artifact
These are injected automatically on the live site — leave them out of the prototype:
- The GRaiT GAMES navigation bar (injected by nav.js)
- The site footer and newsletter form (injected by footer.js)
- A <link> to styles.css (not available in Artifacts — inline all CSS)
- [LEADERBOARD] Any leaderboard UI, initials-entry overlay, or fetch('/api/...') calls —
  the shared leaderboard.js module on the live site builds and wires all of that up.
  Just leave a gameOver()-style hook that's easy to swap for Leaderboard.trySubmit() later.

---

Build the complete game now. Make it fun and polished.
When the game is complete, output the full single-file HTML ready to save.
~~~

---

## Integration Checklist — after Artifacts → live site

Copy the finished file to `/games/[game-name].html`, then work through this list:

**CSS**
- [ ] Remove the inlined `:root` variables block — already in `styles.css`
- [ ] Remove the inlined `.game-header`, `.game-title-bar`, `.btn-icon`, `.btn-restart`, `.stat-box`, `.btn` rules — already in `styles.css`
- [ ] Keep only game-specific rules in the inline `<style>` block

**HTML head**
- [ ] Replace the Artifact font `<link>` with the full stack:
      `Press+Start+2P&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Share+Tech+Mono`
- [ ] Add `<link rel="stylesheet" href="../styles.css" />` after the font link

**HTML body**
- [ ] Add `<a href="#game" class="skip-link">Skip to game</a>` as the first element inside `<body>`
- [ ] Add `<nav id="main-nav"></nav>` immediately before `<main>` (nav.js replaces this)
- [ ] Wrap game content in `<main class="container-narrow section" id="game">`
- [ ] Confirm the back button keeps the `class="btn btn-outline-cyan btn-icon"` combination
- [ ] Add `<script src="../nav.js"></script>` and `<script src="../footer.js"></script>` before `</body>`

**Leaderboard wiring [LEADERBOARD]**
- [ ] Add `<script src="../leaderboard.js"></script>` *before* your game's own `<script>` block
- [ ] At the end of your `init()`, call `Leaderboard.init({ gameKey: '[game-key]' })`
      (gameKey must match a new entry you add to `GAME_CAPS`, e.g. `'snake'`, `'space-dogfight'`)
- [ ] In your `gameOver()` / win handler, replace the direct overlay call with:
      `Leaderboard.trySubmit(currentScore, function (accepted) { /* show win/game-over overlay */ })`
- [ ] Add the game key + max possible score to `GAME_CAPS` in `functions/api/submit-score.js`
- [ ] Do not hand-write any leaderboard panel, initials boxes, or `fetch('/api/...')` calls —
      `leaderboard.js` injects its own `.lb-panel` / `.lb-initials-overlay` markup and styles into `.game-stage`

**Catalog**
- [ ] Add a game card to `games.html` (copy an existing card; update title, description, category, href)
- [ ] Insert the new card FIRST in `#game-grid` (the "All Games" view always shows newest → oldest, top to
      bottom) and renumber the `<!-- N. ... -->` comments above each card to match the new order
- [ ] If the game introduces a new category, add the sidebar button + `.category-count` badge in `games.html`

**QA**
- [ ] Desktop: measure the play area at a wide (1280px) viewport — it should render 760px wide,
      matching Save My Chicks, Aim Trainer, and Gnome Crawler. Also check any sibling rows meant
      to line up with it use the SAME 760px cap, not a narrower one.
- [ ] Test header bar on mobile (320px) — back, title, and restart must stay in one row
- [ ] Test restart button — confirm it resets all game state cleanly
- [ ] Check focus rings are visible on all interactive elements (keyboard nav)
- [ ] Verify ARIA labels on both icon buttons and live regions on dynamic score/status displays
- [ ] If the game uses arrow keys/WASD/space, confirm the page does NOT scroll while playing
- [ ] [LEADERBOARD] Resize to mobile width and confirm the Top 10 panel renders *below* the game,
      not overlapping it — if it overlaps, your game surface is likely absolutely positioned
      directly inside `.game-stage` (see the canvas note above)
- [ ] [LEADERBOARD] Play a round with a qualifying score — confirm the initials prompt (from `leaderboard.js`) appears and the score saves
- [ ] [LEADERBOARD] Refresh the page — confirm the saved score appears in the Top 10 panel

---

## SVG Icon Reference

Always use these SVG icons. Never substitute Unicode characters (`←`, `↺`) — they render as emoji ovals on mobile Safari.

**Back to Catalog (left arrow):**

```html
<a href="/games.html" class="btn btn-outline-cyan btn-icon" aria-label="Back to Catalog">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
  </svg>
</a>
```

**Restart (circular arrow):**

```html
<button type="button" class="btn-restart" id="restartBtn" aria-label="Restart game">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
</button>
```
