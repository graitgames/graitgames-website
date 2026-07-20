# GRaiT GAMES — Leaderboard + Joystick Game Starter

Use this file when prototyping a new **leaderboard + joystick** game — a
game with a monthly Top 10 leaderboard *and* touch controls (a drag joystick
plus a round action button) for mobile, exactly like **Gnome Crawler** and
**Save My Chicks**. If your new game doesn't need a joystick (a word game,
a puzzle, anything not driven by continuous directional movement), use
`NEW_GAME_STARTER.md` instead.

This archetype has more moving parts than a basic game, because three
shared systems have to wire together correctly: the mobile fullscreen
shell, the joystick component, and the game-over popup. Nearly every hard
bug found while building the first two games in this category came from
getting one of those three wrong — the checklists below exist because of
that, not as busywork.

**How to use:**
1. Click the copy button on the Artifacts prompt block below.
2. Paste into a new Claude Artifacts conversation.
3. Fill in the placeholders (`[GAME NAME]`, `[GAME TITLE IN CAPS]`,
   description, stat boxes, dominant color) and send.
4. Once the game plays well in Artifacts — including the placeholder
   joystick — follow the **Integration Checklist** to wire it into the
   live site's shared components.

---

## Artifacts Prompt — copy in one click

~~~
Build a browser game for GRaiT GAMES called [GAME NAME].

[1–2 sentence description of the game concept and win/lose condition.]

This game has a monthly leaderboard AND mobile touch controls (a drag
joystick + one action button). Include all sections marked [LEADERBOARD]
and [JOYSTICK].

---

### Tech rules
- Pure HTML + CSS + vanilla JavaScript in a single file — no frameworks, no libraries, no build step.
- Wrap all JS in an IIFE: (function () { 'use strict'; /* … */ })();
- No TypeScript, no JSX, no ES modules.
- Keep code readable — this is a father-and-son educational project.
- If the game uses keyboard input (arrow keys, WASD, space) for movement or firing, call
  e.preventDefault() in the keydown handler for every key the game uses. Without this,
  arrow keys and space scroll the whole page during gameplay instead of just controlling the game.
- [JOYSTICK] All movement input — keyboard AND joystick — must read from ONE shared
  `keys` object (e.g. `keys['arrowup']`, `keys['ArrowUp']`, whatever casing you pick, just
  be consistent). Never do `keys = {}` to reset it (on restart or anywhere else) — always
  clear it in place: `for (var k in keys) keys[k] = false;`. This matters later: the real
  joystick component is handed a *reference* to this exact object once, and reassigning it
  orphans that reference, silently breaking the joystick after the first restart.

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

DECIDE NOW which of the three brand colors is this game's dominant accent
— blue (cyan), orange, or green. You'll use this same color for the
game-over popup's border/glow later, so pick whichever already fits the
game's own theme (e.g. Gnome Crawler is blue/cyan, Save My Chicks is
orange).

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
   .btn-outline-cyan (see Required HTML structure below). */
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
  flex-wrap: wrap;
}
.stat-box {
  flex: 1 1 0;
  min-width: 90px;
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
   max-width. Give the canvas-frame width:100% inside this stage and let its
   own aspect-ratio set the height. Mobile fullscreen overrides this cap
   separately (see the fullscreen section), so it only affects desktop. */
.game-stage {
  position: relative;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
}

/* Optional XP/health bar — only include if the game has a leveling or
   health mechanic (Gnome Crawler has one, Save My Chicks doesn't). Should
   span the SAME width as the stat boxes row above it — don't cap it to a
   narrower max-width than .game-stats. */
.xp-bar-wrap { width: 100%; margin-bottom: 14px; }
.xp-bar-label {
  display: flex; justify-content: space-between;
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-bottom: 4px;
}
.xp-bar-track {
  width: 100%; height: 10px; background: var(--bg-secondary);
  border: 1px solid var(--border-accessible); border-radius: var(--border-radius); overflow: hidden;
}
.xp-bar-fill { height: 100%; background: var(--color-green); box-shadow: var(--glow-green); width: 0%; transition: width 0.2s; }

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

/* [JOYSTICK] Placeholder mobile controls — a real shared component
   replaces this during integration, but build the prototype with this
   exact look so play-testing in Artifacts feels like the final game. Only
   ever shown on touch/narrow viewports. */
.touch-controls {
  display: none;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 4px;
}
@media (pointer: coarse), (max-width: 820px) {
  .touch-controls { display: flex; }
}
.joystick-base {
  position: relative;
  width: 116px;
  height: 116px;
  border-radius: 50%;
  background: var(--bg-panel);
  border: 2px solid var(--color-cyan);
  touch-action: none;
}
.joystick-thumb {
  position: absolute;
  top: 50%; left: 50%;
  width: 52px; height: 52px;
  margin: -26px 0 0 -26px;
  border-radius: 50%;
  background: rgba(0, 234, 255, 0.25);
  border: 2px solid var(--color-cyan);
  box-shadow: var(--glow-cyan);
  pointer-events: none;
}
.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 64px; height: 64px;
  border-radius: 50%;
  background: var(--bg-panel);
  border: 2px solid var(--color-orange);
  color: var(--color-orange);
  font-family: var(--font-mono);
  font-size: 0.6rem;
  touch-action: none;
}
.action-btn:active { background: rgba(255,107,43,0.25); box-shadow: var(--glow-orange); }

---

### Required HTML structure — paste inside <body>

<body style="margin:0; background:var(--bg-primary); color:var(--text-primary); font-family:var(--font-body);">

  <div style="max-width:800px; margin:0 auto; padding:24px 16px;">

    <div class="game-header">
      <a href="/games.html" class="btn btn-outline-cyan btn-icon" aria-label="Back to Catalog">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
        </svg>
      </a>
      <p class="game-title-bar" role="heading" aria-level="1">[GAME TITLE IN CAPS]</p>
      <button type="button" class="btn-restart" id="restartBtn" aria-label="Restart game">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>

    <p style="text-align:center; color:var(--text-description); margin-bottom:24px; font-family:var(--font-body);">
      [One-sentence description.]
    </p>

    <div class="game-stats">
      <div class="stat-box">
        <div class="stat-label">Score</div>
        <div class="stat-value" id="score" role="status" aria-live="polite">0</div>
      </div>
      <!-- [Add more stat boxes as needed — lives, wave, level, etc.] -->
    </div>

    <!-- [Optional XP/health bar — see .xp-bar-wrap CSS above] -->

    <!-- class="game-stage" is required — the shared leaderboard module
         anchors its Top 10 panel / initials overlay here on the live site.
         If your game surface is a <canvas>, size it via an inner wrapper,
         not directly on .game-stage:
           <div class="game-stage">
             <div class="game-frame" style="position:relative; width:100%; aspect-ratio:4/3;">
               <canvas style="position:absolute; inset:0; width:100%; height:100%;"></canvas>
               <div class="overlay" id="overlay">...</div>
             </div>
           </div>
         .game-stage must keep real, normal-flow height of its own, or the
         leaderboard panel (a plain in-flow child appended after your game
         markup) has nothing to flow below and overlaps the game instead. -->
    <div class="game-stage">

      <!-- [YOUR GAME MARKUP HERE] -->

      <div class="overlay" id="overlay">
        <h2 id="overlay-title">Ready?</h2>
        <p id="overlay-text">[Start instructions]</p>
        <button type="button" class="btn btn-secondary" id="start-btn">▶ Start Game</button>
      </div>

    </div><!-- /.game-stage -->

    <!-- [JOYSTICK] Placeholder touch controls -->
    <div class="touch-controls" id="touchControls">
      <div class="joystick-base" id="joystickBase" aria-label="Move" role="slider" aria-valuetext="Drag to move">
        <div class="joystick-thumb" id="joystickThumb"></div>
      </div>
      <button type="button" class="action-btn" id="actionBtn" aria-label="[Action name, e.g. Fire]">
        [Icon + short label, e.g. FIRE]
      </button>
    </div>

  </div>

  <script>
  (function () {
    'use strict';

    var currentScore = 0;
    var keys = {}; // shared by keyboard AND the joystick — see Tech rules above

    /* [JOYSTICK] Minimal placeholder drag logic — snaps to one of 4
       cardinal directions (no diagonals), matching the real component's
       behavior exactly so gameplay feel doesn't change after integration. */
    (function setupTouchControls() {
      var joyBase = document.getElementById('joystickBase');
      var joyThumb = document.getElementById('joystickThumb');
      var joyPointerId = null;
      var DIR_KEYS = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright']; // match your own key names

      function clearDirKeys() { for (var i = 0; i < DIR_KEYS.length; i++) keys[DIR_KEYS[i]] = false; }

      function updateJoystick(clientX, clientY) {
        var rect = joyBase.getBoundingClientRect();
        var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        var maxDist = rect.width / 2;
        var dx = clientX - cx, dy = clientY - cy;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; dist = maxDist; }
        joyThumb.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
        clearDirKeys();
        if (dist / maxDist <= 0.25) return;
        var angle = Math.atan2(dx, -dy) * 180 / Math.PI;
        if (angle > -45 && angle <= 45) keys['arrowup'] = true;
        else if (angle > 45 && angle <= 135) keys['arrowright'] = true;
        else if (angle > -135 && angle <= -45) keys['arrowleft'] = true;
        else keys['arrowdown'] = true;
      }

      joyBase.addEventListener('pointerdown', function (e) {
        e.preventDefault(); joyPointerId = e.pointerId;
        joyBase.setPointerCapture(joyPointerId);
        updateJoystick(e.clientX, e.clientY);
      });
      joyBase.addEventListener('pointermove', function (e) {
        if (e.pointerId !== joyPointerId) return;
        e.preventDefault(); updateJoystick(e.clientX, e.clientY);
      });
      function endJoystick(e) {
        if (joyPointerId === null || (e && e.pointerId !== joyPointerId)) return;
        joyPointerId = null;
        joyThumb.style.transform = 'translate(0px, 0px)';
        clearDirKeys();
      }
      joyBase.addEventListener('pointerup', endJoystick);
      joyBase.addEventListener('pointercancel', endJoystick);
      joyBase.addEventListener('pointerleave', endJoystick);

      document.getElementById('actionBtn').addEventListener('pointerdown', function (e) {
        e.preventDefault();
        /* [Your action trigger here, e.g. fire a shot / dash] */
      });
    })();

    function showStandardOverlay(title, text, btnText) {
      document.getElementById('overlay-title').textContent = title;
      document.getElementById('overlay-text').innerHTML = text;
      document.getElementById('start-btn').textContent = btnText;
      document.getElementById('overlay').classList.remove('hidden');
    }

    function gameOver() {
      /* [LEADERBOARD] On the live site this becomes:
         Leaderboard.trySubmit(currentScore, function (accepted) {
           gameOverCard.show({ accepted: accepted, text: 'One line describing the result.' });
         });
         Don't build any leaderboard UI here — leaderboard.js and
         game-over-card.js (shared site modules) handle all of that. */
      showStandardOverlay('💀 Game Over', 'Better luck next time.', '▶ Play Again');
    }

    function init() {
      currentScore = 0;
      // Clear keys IN PLACE, never `keys = {}` — see Tech rules above.
      for (var k in keys) keys[k] = false;
    }

    document.getElementById('restartBtn').addEventListener('click', init);
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
- The GRaiT GAMES navigation bar (injected by nav.js) and site footer (injected by footer.js)
- A <link> to styles.css (not available in Artifacts — inline all CSS)
- Any leaderboard UI, initials-entry overlay, game-over popup styling, or fetch('/api/...') calls —
  leaderboard.js and game-over-card.js build and wire all of that up during integration.
  Just leave a gameOver()-style hook that's easy to swap for Leaderboard.trySubmit() + a
  GameOverCard.show() call later.
- The REAL joystick component (touch-joystick.js) — build the placeholder described above so
  gameplay already works with 4-directional input, but it gets replaced wholesale during integration.

---

Build the complete game now. Make it fun and polished.
When the game is complete, output the full single-file HTML ready to save.
~~~

---

## Integration Checklist — after Artifacts → live site

Copy the finished file to `/games/[game-name].html`, then work through this list.

### CSS
- [ ] Remove the inlined `:root` variables block, `.game-header`/`.game-title-bar`/`.btn-icon`/
      `.btn-restart`/`.stat-box`/`.btn` rules — already in `styles.css`
- [ ] Remove the inlined placeholder `.touch-controls`/`.joystick-base`/`.joystick-thumb`/
      `.action-btn` CSS — the real `touch-joystick.js` injects its own
- [ ] Keep only game-specific rules (canvas frame, sprites, custom overlays) in the inline `<style>` block
- [ ] If the game has an XP/health bar, make sure it has no `max-width` narrower than `.game-stats`
      (they should visually span the same width)
- [ ] Confirm the desktop play area uses the standard `max-width: 760px` — and that any sibling
      rows meant to line up with it (ability/buff bars, hint text) use the SAME 760px, not a
      narrower value. Anything capped below 760px makes the game look smaller than the rest of
      the catalog.

### HTML head
- [ ] Replace the Artifact font `<link>` with the full stack (unchanged from base starter):
      `Press+Start+2P&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Share+Tech+Mono`
- [ ] Add `<link rel="stylesheet" href="../styles.css" />` after the font link

### HTML body
- [ ] Add `<a href="#game" class="skip-link">Skip to game</a>` as the first element inside `<body>`
- [ ] Add `<nav id="main-nav"></nav>` immediately before `<main>`
- [ ] Wrap game content in `<main class="container-narrow section" id="game">` (the id `game` is
      required — every shared component below targets it)
- [ ] Add `<script src="../nav.js"></script>` and `<script src="../footer.js"></script>` before `</body>`

### Mobile fullscreen wiring
- [ ] Add `<script src="../game-fullscreen.js"></script>` before your game's own `<script>` block
- [ ] Add a `MOBILE_FULLSCREEN = true` flag and call:
      `var fullscreen = GameFullscreen.init({ el: 'game', enabled: MOBILE_FULLSCREEN, onChange: resizeCanvas });`
- [ ] In the Start Game button's click handler (a real user gesture — required by the browser),
      call `if (fullscreen) fullscreen.enter();` before starting the game
- [ ] Tag these existing elements with `data-fs-role`: `"header"` (`.game-header`), `"stats"`
      (`.game-stats`), `"bar"` (the XP/health bar, if present), `"stage"` (`.game-stage`) —
      `styles.css`'s shared shell lays these out identically across every game once tagged
- [ ] Make the canvas dynamically resizable (DPR-aware `resizeCanvas()` reading
      `canvas.clientWidth`/`clientHeight` or the frame's `getBoundingClientRect()`, NOT a fixed
      width/height baked into the `<canvas>` tag) — call it on load, `window.resize`, and
      `orientationchange`
- [ ] Give the canvas-frame an `aspect-ratio` for its normal desktop size, then override it for
      fullscreen: `#game.is-mobile-fullscreen .your-canvas-frame { aspect-ratio: unset; height: 100%; min-height: 240px; }`
      — remember `height:100%` only works if EVERY ancestor between it and the "stage" role also
      has `height:100%` (plain block elements don't inherit a flex parent's height automatically)
- [ ] Hide any purely-instructional text (a "how to play" hint, desktop-only control reminders)
      specifically in fullscreen: `#game.is-mobile-fullscreen .your-hint-class { display: none; }`
      — the shared shell already hides `.game-description` and `.game-title-bar` for you

### Touch joystick wiring
- [ ] Remove the Artifact's placeholder joystick HTML, CSS, and `setupTouchControls()` JS entirely
- [ ] Add `<script src="../touch-joystick.js"></script>`
- [ ] Call, once at setup:
      ```
      TouchJoystick.init({
        parent: 'game',
        keys: keys,
        keyNames: { up: '...', down: '...', left: '...', right: '...' }, // match whatever key strings your update loop already reads
        moveLabel: '...',           // aria-label for the joystick
        actionLabel: '...',         // button text, e.g. 'FIRE' or 'DASH'
        actionAriaLabel: '...',
        actionIcon: '<svg ...>',    // inline icon markup — a filled circle for a "shoot a projectile" action, a lightning bolt for a burst/dash action, or whatever fits
        onActionStart: function () { /* your action trigger */ },
        onActionEnd: function () { /* optional */ }
      });
      ```
- [ ] **Double-check `keys` is never reassigned** (`keys = {}`) anywhere in your restart/init logic —
      it must only ever be cleared in place (`for (var k in keys) keys[k] = false;`). This is the
      single most common bug in this whole checklist: the joystick keeps a reference to the
      original object, and reassigning orphans it — the joystick will visually drag fine but
      silently stop actually moving anything after the first restart.
- [ ] If the game only uses some of the 4 directions (e.g. up/down move, no left/right), map the
      unused directions to inert placeholder key names (e.g. `'_unused'`) rather than real ones your
      update loop reads, so dragging sideways doesn't accidentally trigger something unintended

### Game-over popup wiring
- [ ] Remove any inlined game-over overlay markup/CSS from the Artifact prototype
- [ ] Add `<script src="../game-over-card.js"></script>`
- [ ] Call, once at setup:
      ```
      var gameOverCard = GameOverCard.init({
        parent: 'game',
        color: 'blue' | 'orange' | 'green', // the dominant color decided earlier
        onPlayAgain: function () { /* however this game restarts + starts a new run */ }
      });
      ```
- [ ] In your game-over handler, inside `Leaderboard.trySubmit`'s callback:
      `gameOverCard.show({ accepted: accepted, text: 'One line describing the result.' });`
      — the title ("✓ Score Saved!" / "💀 Game Over") is set automatically; you only provide the
      result line. A compact Top 3 board renders automatically too.
- [ ] Call `gameOverCard.hide();` in your Restart button's handler and inside `init()`/reset logic,
      so a mid-popup restart doesn't leave it stuck open

### Leaderboard wiring
- [ ] Add `<script src="../leaderboard.js"></script>` — load it *before* `game-fullscreen.js`,
      `touch-joystick.js`, and `game-over-card.js`, since `GameOverCard.show()` calls
      `Leaderboard.renderCompact()` internally
- [ ] At the end of setup, call `Leaderboard.init({ gameKey: '[game-key]' })` (kebab-case, matching
      the game's filename)
- [ ] Add the game key to `ALLOWED_GAMES` in `functions/api/scores.js`
- [ ] Add the game key + a realistic max possible score to `GAME_CAPS` in
      `functions/api/submit-score.js` — pick a cap a legitimate great run couldn't exceed, but a
      cheated/broken score would; err generous rather than blocking a real high score
- [ ] Do not hand-write any leaderboard panel, initials boxes, or `fetch('/api/...')` calls —
      `leaderboard.js` injects its own `.lb-panel` / `.lb-initials-overlay` markup into `.game-stage`

### Touch reliability (learned the hard way — check these proactively)
- [ ] Any custom interactive element that appears **mid-gameplay** (not present/visible from page
      load — a level-up choice card, a special power-up button, anything shown in response to a
      game event rather than a page load) must bind its handler to **both** `pointerup` and `click`,
      not `click` alone. iOS Safari can delay or drop a plain `click` on an element that just became
      interactive mid-touch, requiring an unwanted second tap. If the action has a side effect that
      must only run once (submitting a score, applying an upgrade), guard it:
      ```
      var handled = false;
      function doAction() { if (handled) return; handled = true; /* ... */ }
      el.addEventListener('pointerup', doAction);
      el.addEventListener('click', doAction);
      ```
      Reset `handled = false` each time the element becomes relevant again (e.g. each time a popup reopens).
- [ ] Any custom `:hover`-styled element gate the hover rule behind `@media (hover: hover) { ... }` —
      otherwise the first tap on a touch device only triggers the hover state, requiring a second
      tap for the actual click. (Shared classes like `.btn-restart` and `.btn-outline-cyan` already
      have this; only matters for NEW custom hover styles you add.)
- [ ] Don't manually call `.focus()` on a text input from `pointerdown` — it fires before the tap
      completes and races the browser's own native focus grant, which can make an iOS on-screen
      keyboard flash open and immediately close. If a manual focus call is ever needed, bind it to
      `pointerup` instead (harmless to call `.focus()` on an already-focused element, so no guard needed).

### Catalog
- [ ] Add a game card to `games.html` (copy an existing card; update title, description, category, href)
- [ ] Insert the new card FIRST in `#game-grid` and renumber the `<!-- N. ... -->` comments above each card
- [ ] If the game introduces a new category, add the sidebar button + `.category-count` badge
- [ ] Add a real 16:9 thumbnail image to `/images/[game-name].jpg` (resize to ~800×450, compress
      well under 100KB) and swap it in for the placeholder `.game-thumb-label` on the card

### QA
- [ ] Resize to mobile width (or use a real phone) and tap Start — confirm fullscreen engages, the
      header/stats/bar/stage/controls stack in the standard order, and nothing is cut off
- [ ] Drag the joystick in all 4 directions — confirm movement (or whichever directions are wired)
      actually applies, not just that the thumb visually drags
- [ ] Restart at least twice in a row on mobile — confirm the joystick still works after a restart
      (this is exactly the bug the `keys = {}` reassignment causes, and it only shows up after the
      *first* restart, not immediately)
- [ ] Reach a qualifying game-over on mobile — confirm the initials popup shows, a single tap
      focuses the first box (no flicker, no second tap needed), Submit/Skip work in one tap, and
      the final game-over popup shows the correct title, your result text, Play Again, and a Top 3 board
- [ ] Tap the game-over popup's close (X) button — confirm it dismisses without restarting, and the
      header's Back/Restart buttons are reachable underneath
- [ ] Press the phone's back button/gesture while in fullscreen — confirm it exits fullscreen and
      stays on the game page (first press), not straight back to the catalog
- [ ] Play a longer session (several restarts / qualifying scores in a row) — this is when
      accumulated-state bugs (scroll drift, orphaned object references) tend to surface, even if a
      single short playthrough looks fine
- [ ] Desktop: confirm keyboard controls still work, the full Top 10 leaderboard panel shows in its
      sidebar position, and nothing mobile-specific leaked into the desktop layout
- [ ] Desktop: measure the play area at a wide (1280px) viewport — it should render 760px wide,
      matching Save My Chicks, Aim Trainer, and Gnome Crawler side by side

---

## SVG Icon Reference

Always use SVG icons, never Unicode characters (`←`, `↺`) — they render as emoji ovals on mobile Safari.

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

**Game-over popup close (X in a circle) — already built into `game-over-card.js`, shown here for reference:**

```html
<button type="button" class="game-over-close" aria-label="Close">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
  </svg>
</button>
```

**Action button icon examples** — a filled circle works well for a "shoot/throw a projectile" action
(Save My Chicks' Fire button), a lightning bolt for a burst/dash action (Gnome Crawler's Dash button):

```html
<!-- Projectile / seed -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>

<!-- Dash / burst -->
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L3 14h7l-1 8 11-12h-7l1-8z"/></svg>
```
