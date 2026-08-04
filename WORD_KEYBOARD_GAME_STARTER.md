# GRaiT GAMES — Word/Keyboard Game Starter

Use this file when prototyping a new **word/keyboard game** — a game driven
by an on-screen (and physical) keyboard rather than continuous directional
movement, typically with no leaderboard, exactly like **4ordle** and
**Fix My 4ordle**. If your new game needs a mobile joystick + leaderboard
(continuous movement, e.g. an arcade/RPG-style game), use
`LEADERBOARD_JOYSTICK_GAME_STARTER.md` instead.

This archetype looks simpler than the joystick one at first glance — no
canvas, no touch controls to build — but the mobile fullscreen layout has
its own sharp edges, almost all discovered by shipping 4ordle and its clone.
The checklists below exist because of specific, real bugs, not busywork:
a keyboard squeezed to unreadable width, a "dead" keyboard key bug that
took two attempts to get right, and a flex/grid sizing gotcha that silently
prevented the play area from filling the screen.

**How to use:**
1. Click the copy button on the Artifacts prompt block below.
2. Paste into a new Claude Artifacts conversation.
3. Fill in the placeholders (`[GAME NAME]`, `[GAME TITLE IN CAPS]`,
   description, win/lose rules) and send.
4. Once the game plays well in Artifacts, follow the **Integration
   Checklist** to wire it into the live site's shared components.

---

## Artifacts Prompt — copy in one click

~~~
Build a browser game for GRaiT GAMES called [GAME NAME].

[1–2 sentence description of the game concept and win/lose condition.]

This game is keyboard-driven (an on-screen keyboard plus physical keyboard
input), with no leaderboard.

---

### Tech rules
- Pure HTML + CSS + vanilla JavaScript in a single file — no frameworks, no libraries, no build step.
- Wrap all JS in an IIFE: (function () { 'use strict'; /* … */ })();
- No TypeScript, no JSX, no ES modules.
- Keep code readable — this is a father-and-son educational project.
- Call e.preventDefault() in the keydown handler for every key the game uses (letters, Enter,
  Backspace, arrow keys if relevant) — otherwise Backspace/Space/arrows scroll or navigate the
  page instead of just controlling the game.
- Add <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,
  user-scalable=no, viewport-fit=cover" /> — stops the browser's double-tap-to-zoom gesture from
  firing when a player taps the same on-screen key twice quickly.
- Also add touch-action: manipulation; to the game's root container for the same reason.

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

  /* Tile state colors (adapt names if your game isn't Wordle-style) */
  --tile-correct:  #39FF14; /* right letter, right position */
  --tile-present:  #FF6B2B; /* right letter, wrong position */
  --tile-absent:   #1a1a2e; /* not in the word */

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

/* Compact status line (e.g. "2/4 solved · Guess 5/9") — optional, some
   word games won't need one at all */
.game-status-bar {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 6px;
}
#status {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-muted);
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

/* Full-viewport popup — used for both the Tap to Play gate and the
   end-of-game screen (see Required HTML structure below) */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(7, 7, 15, 0.88);
  padding: 24px;
}
.overlay.hidden { display: none; }
.overlay-card {
  position: relative;
  background: var(--bg-panel);
  border: 2px solid var(--color-orange);
  border-radius: 10px;
  box-shadow: var(--glow-orange);
  padding: 28px 24px;
  max-width: 380px;
  width: 100%;
  text-align: center;
}
.overlay-card h2 {
  color: var(--color-orange);
  font-size: 1.2rem;
  letter-spacing: 1px;
  margin: 0 0 12px;
}
.overlay-card p {
  color: var(--text-description);
  line-height: 1.5;
  font-size: 0.85rem;
  margin: 0 0 8px;
}
/* Dismisses the end-of-game popup without restarting */
.game-over-close {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 2px solid var(--color-orange);
  color: var(--color-orange);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
}
@media (hover: hover) {
  .game-over-close:hover { background: var(--color-orange); color: var(--bg-primary); }
}

/* ---- On-screen keyboard ---- */
#keyboard {
  margin: 4px auto 0;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.krow {
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 5px;
}
.key {
  background: var(--bg-panel);
  border: 1px solid var(--border-accessible);
  color: var(--text-primary);
  padding: 6px 6px;
  min-width: 28px;
  border-radius: 5px;
  font-family: var(--font-headline);
  font-weight: 700;
  font-size: 1.48rem;
  cursor: pointer;
  flex: 1;
  max-width: 42px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.key.wide { flex: 1.7; max-width: 68px; font-size: 1.27rem; }
.key:hover:not(:disabled) { filter: brightness(1.2); }
.key:focus-visible { outline: 2px solid var(--color-cyan); outline-offset: 2px; }
/* "Dead" key: a used letter that's in none of the word(s) — a clearly
   distinct mid-grey, darker than the label so contrast holds */
.key.dead {
  background: #3a3a45;
  border-color: rgba(255, 255, 255, 0.08);
}

@media (max-width: 600px) {
  .key { padding: 6px 4px; font-size: 1.27rem; }
}

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
      <button class="btn-restart" id="restartBtn" disabled aria-label="Restart game">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>

    <!-- [Optional status line — see .game-status-bar CSS above] -->
    <div class="game-status-bar">
      <span id="status" aria-live="polite" aria-atomic="true">Loading…</span>
    </div>

    <!-- [YOUR GAME BOARD/GRID MARKUP HERE — rendered dynamically by JS] -->
    <div id="board" role="group" aria-label="[describe the play area]"></div>

    <!-- Transient feedback (e.g. "Not in word list") — aria-live="assertive"
         since it's time-sensitive; reserve a fixed height so it appearing/
         disappearing doesn't jolt the layout -->
    <div id="message" role="status" aria-live="assertive" aria-atomic="true"
         style="height:24px; margin-top:8px; text-align:center; color:var(--color-cyan); font-family:var(--font-mono);"></div>

    <div id="keyboard" role="group" aria-label="Letter keyboard"></div>

    <!-- Tap to Play gate — shown immediately on page load, on both desktop
         and mobile. If the game needs to fetch/prepare anything async
         before it can actually start, keep this button disabled until
         that's done (see Integration Checklist). This tap is also the
         real user gesture mobile fullscreen enters on. -->
    <div class="overlay" id="startOverlay" role="dialog" aria-modal="true" aria-labelledby="startOverlayTitle">
      <div class="overlay-card">
        <h2 id="startOverlayTitle">Ready?</h2>
        <p>[Start instructions.]</p>
        <button type="button" class="btn btn-secondary" id="startBtn">▶ Start Game</button>
      </div>
    </div>

    <div class="overlay hidden" id="endOverlay" role="dialog" aria-modal="true" aria-labelledby="endOverlayTitle">
      <div class="overlay-card">
        <button type="button" class="game-over-close" id="endOverlayClose" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
        </button>
        <h2 id="endOverlayTitle">Game Over</h2>
        <p id="endOverlayText"></p>
        <button type="button" class="btn btn-secondary" id="playAgainBtn">Play Again</button>
      </div>
    </div>

  </div>

  <script>
  (function () {
    'use strict';

    var restartBtn   = document.getElementById('restartBtn');
    var startOverlay = document.getElementById('startOverlay');
    var startBtn     = document.getElementById('startBtn');
    var endOverlay   = document.getElementById('endOverlay');

    function showEndOverlay(title, text) {
      document.getElementById('endOverlayTitle').textContent = title;
      document.getElementById('endOverlayText').innerHTML = text;
      endOverlay.classList.remove('hidden');
    }
    function hideEndOverlay() { endOverlay.classList.add('hidden'); }

    function newGame() {
      /* [Reset all game state, render the fresh board/keyboard.] */
      hideEndOverlay();
    }

    function gameOver(won) {
      /* [No leaderboard in this archetype — just show the result.] */
      showEndOverlay(won ? '🎉 You Solved It!' : '💀 Game Over', '[Result text.]');
    }

    /* Restart re-shows the Tap to Play gate rather than jumping straight
       into a new round — Play Again (below) is the one that skips it. */
    restartBtn.addEventListener('click', function () {
      startOverlay.classList.remove('hidden');
    });
    startBtn.addEventListener('click', function () {
      startOverlay.classList.add('hidden');
      newGame();
    });
    document.getElementById('playAgainBtn').addEventListener('click', function () {
      hideEndOverlay();
      newGame();
    });
    document.getElementById('endOverlayClose').addEventListener('click', hideEndOverlay);

    /* [Your keydown handler, on-screen key click handler, board rendering,
       and win/lose logic here.] */

    restartBtn.disabled = false; // enable once any async setup finishes
  })();
  </script>

</body>

---

### Accessibility rules
- Every interactive element without visible text needs an aria-label.
- Score / status displays that update dynamically: add role="status" aria-live="polite"
  (or aria-live="assertive" for time-sensitive feedback like an invalid-guess message).
- Focus rings: use a bright cyan, green, or orange outline on :focus-visible — never remove outlines.
- Minimum touch target: 44×44 px for any tappable element on mobile (on-screen keyboard keys
  can run smaller than this in practice — 4ordle's are ~28-42px wide — but keep them as close
  to that as the layout allows).
- Never use color alone to communicate state (add a label, icon, or pattern too).

---

### Do NOT include in the Artifact
These are injected automatically on the live site — leave them out of the prototype:
- The GRaiT GAMES navigation bar (injected by nav.js) and site footer (injected by footer.js)
- A <link> to styles.css (not available in Artifacts — inline all CSS)
- game-fullscreen.js — build the Tap to Play gate and overlay structure above so the game
  already has the right shape, but the actual fullscreen entry/exit logic is wired in during
  integration.

---

Build the complete game now. Make it fun and polished.
When the game is complete, output the full single-file HTML ready to save.
~~~

---

## Integration Checklist — after Artifacts → live site

Copy the finished file to `/games/[game-name].html`, then work through this list.

### CSS
- [ ] Remove the inlined `:root` variables block, `.game-header`/`.game-title-bar`/`.btn-icon`/
      `.btn-restart`/`.btn`/`.overlay` rules — already in `styles.css`
- [ ] Keep only game-specific rules (board/tile styling, keyboard, custom layout) in the inline
      `<style>` block

### HTML head
- [ ] Replace the Artifact font `<link>` with the full stack:
      `Press+Start+2P&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Share+Tech+Mono`
- [ ] Add `<link rel="stylesheet" href="../styles.css" />` after the font link
- [ ] Keep the `maximum-scale=1.0, user-scalable=no` viewport meta tag from the Artifacts prompt

### HTML body
- [ ] Add `<a href="#game" class="skip-link">Skip to game</a>` as the first element inside `<body>`
- [ ] Add `<nav id="main-nav"></nav>` immediately before `<main>`
- [ ] Wrap game content in `<main class="container-narrow section" id="game">` (the id `game`
      is required — the fullscreen shell targets it)
- [ ] Add `<script src="../nav.js"></script>` and `<script src="../footer.js"></script>` before `</body>`

### Mobile fullscreen wiring
- [ ] Add `<script src="../game-fullscreen.js"></script>` before your game's own `<script>` block
- [ ] Add a `MOBILE_FULLSCREEN = true` flag and call:
      `var fullscreen = GameFullscreen.init({ el: 'game', enabled: MOBILE_FULLSCREEN });`
      (no `onChange` callback needed unless the game has a canvas to resize — most games in this
      archetype are pure DOM/CSS and don't)
- [ ] In the Tap to Play gate's Start button handler, call `if (fullscreen) fullscreen.enter();`
      before hiding the gate and starting the game — this is the real user gesture the browser
      requires to grant fullscreen
- [ ] **If the game needs to load anything asynchronously before it can start** (a word
      dictionary, remote data, etc.), keep the Start button `disabled` with "Loading…" text until
      that finishes, exactly like the Restart button already does — don't let the player tap
      Start into a game that isn't ready yet
- [ ] Restart re-shows the Tap to Play gate (`startOverlay.classList.remove('hidden')`) rather
      than immediately starting a new round; Play Again in the end-of-game popup skips the gate
      and starts immediately — this matches the joystick archetype's games and should be
      followed exactly, the same distinction players will already expect
- [ ] Tag `.game-header` with `data-fs-role="header"`, the status line (if present) with
      `data-fs-role="stats"`, and the main play area with `data-fs-role="stage"`
- [ ] **Do NOT tag the on-screen keyboard with `data-fs-role="controls"`.** That role's shared
      CSS (15vw side padding, full-viewport-width breakout) was built for the joystick archetype's
      thumb-reachable joystick+button pair, and badly squeezes a full keyboard row — a 10-key row
      needs roughly 325px minimum and 15vw padding on each side can leave less than half that.
      Leave the keyboard **untagged**; its own existing `max-width`/`flex` CSS already centers
      and sizes it correctly as a plain flex child.
- [ ] Decide per-game whether the status line should be hidden on mobile fullscreen entirely
      (4ordle's choice: `#game.is-mobile-fullscreen .game-status-bar { display: none; }`) or kept —
      there's no single right answer, it depends how much the player needs it at a glance

### Making the play area actually stretch (the hard-won part)
If your play area (word grid, board, etc.) should grow to fill the available mobile fullscreen
height rather than staying its natural/fixed size, three gotchas will bite you in order:

1. **A `display: grid` or `display: flex` element tagged `data-fs-role="stage"` needs
   `flex: 1 1 0` (not the shared role's default `flex: 1 1 auto`)** to actually grow to fill its
   allotted space. `flex-basis: auto` lets the browser fall back to the element's own
   content-based preferred size first, silently capping it below what flex-grow should give it —
   this cost real debugging time on 4ordle (the board rendered ~50px shorter than the available
   space, with the shortfall showing up as unexplained gap before the keyboard). Override with a
   more specific selector, e.g. `#game.is-mobile-fullscreen #boards { flex: 1 1 0; }`.
2. **`height: 100%` needs to cascade through every intermediate level explicitly** — a plain
   block or grid child does not automatically fill a flex parent's stretched height just because
   the parent grew. Every level between the stage element and the innermost stretchy piece needs
   `height: 100%; min-height: 0;` (or `flex: 1 1 auto; height: 100%;` if that level is itself a
   flex container).
3. **To size rows/cells proportionally instead of at a fixed pixel height** (e.g. "the active
   row should always be 4/3 the height of every other row"), use `flex-grow` ratios on a
   flex-column container instead of hardcoded pixel heights: give the "normal" rows
   `flex: 3 1 0` and the emphasized row `flex: 4 1 0` (or whatever ratio fits). This scales
   correctly at any screen height, unlike fixed px values which just leave unused space on a
   tall phone.
- [ ] If a design needs **exact** percentage gaps between specific elements (not just "roughly
      X%, plus whatever the shared shell's uniform flex gap adds on top"), override
      `#game.is-mobile-fullscreen { gap: 0; }` and set precise `margin-top`/`margin-bottom` (in
      `vh`, not `%` — CSS resolves vertical `%` padding/margin against the container's *width*,
      not height, a classic gotcha) on each element individually instead

### Pause button (optional — rarely needed for word games)
Most word games in this archetype (4ordle, Fix My 4ordle) don't have any
continuous state that needs pausing — turns are player-driven, so the game
already "waits." Skip pause wiring unless your game does have a
time-pressure element (a countdown timer, an animation loop, etc.). If it
does:
- [ ] Add `<script src="../pause-button.js"></script>` before your game's own `<script>` block
- [ ] Call, once at setup, on a positioned play-area element:
      ```
      var pauseBtn = PauseButton.init({
        parent: 'gameViewport',                          // element id — must be position:relative
        onPause:  function () { paused = true; },        // freeze your timer/animation
        onResume: function () { paused = false; }
      });
      ```
- [ ] Call `pauseBtn.setEnabled(true)` when a run starts and `pauseBtn.setEnabled(false)` at game over
- [ ] Skip Esc/P wiring in your own key handler — the component owns those shortcuts, and Esc in
      a word game otherwise tends to mean "clear the current guess," which would conflict

### Transient feedback text (e.g. "Not in word list")
- [ ] Decide how it fits into the mobile layout: hide it entirely, give it its own small
      reserved margin (4ordle's choice — 1.5vh above and below, with the play area claiming
      whatever space that frees up versus a more generous default), or overlay it on top of the
      play area. All three are legitimate; there's no default to blindly copy.

### On-screen keyboard letter-status coloring (if your game tracks per-letter state)
If letters on the keyboard change color based on guesses (correct/present/absent, or similar),
two specific bugs are easy to reintroduce — both come from conflating "this letter has never
been interacted with" with "this letter has no useful information right now":
- [ ] A letter that's **never been guessed** must stay completely neutral (no color, not marked
      "dead") — don't bulk-write status for every possible letter into your tracking state at
      once (e.g. looping the whole alphabet) just to backfill one edge case; it silently makes
      every never-guessed letter register as "interacted with," and every one of them ends up
      looking dead the moment any part of the game resolves. Fix any such gap at *render time*
      instead — derive an effective per-letter status when rendering, without mutating the
      underlying tracking state for letters that were never actually typed.
- [ ] If part of the game can become "resolved" independently (e.g. one board out of several
      solved, while others are still active), a letter's resolved-part status should still show
      *some* color once guessed, not go transparent/invisible — explicitly excluding a status
      value once part of the game resolves (rather than substituting a neutral "moot" color)
      leaves that quadrant unreadable against the background.
- [ ] Test both by playing until part of the game resolves, then continuing: check a letter
      that's never been typed (should be neutral), a letter that was part of the resolved
      answer (should show a clear, readable "resolved" color, not invisible), and a brand-new
      letter typed for the first time *after* that part resolved (should also show as resolved
      for that part, correctly colored for the still-active parts).

### Word dictionary (if applicable — Wordle-style validation)
4ordle's pattern, reusable as-is if your game needs to validate typed words against a real
dictionary: fetch a word list once from `https://raw.githubusercontent.com/tabatkins/wordle-list/main/words`,
filter to clean lowercase entries matching your word length, cache the result in
`localStorage` so repeat visits load instantly, and fall back to a smaller built-in answer pool
if the fetch fails. Note this list is intentionally permissive (built to avoid rejecting a real
player's reasonable guess) and includes plenty of obscure/unrecognizable entries — fine for
*validating what a player types*, but a bad source for anything the game itself needs to
generate or display as if it were a natural word (pick from your own curated answer pool for
that instead).

### Touch reliability (learned the hard way — check these proactively)
- [ ] Any custom interactive element that appears **mid-gameplay** (not present/visible from
      page load) must bind its handler to **both** `pointerup` and `click`, not `click` alone —
      iOS Safari can delay or drop a plain `click` on an element that just became interactive
      mid-touch, requiring an unwanted second tap. Guard against double-firing if the action has
      a side effect that must only run once:
      ```
      var handled = false;
      function doAction() { if (handled) return; handled = true; /* ... */ }
      el.addEventListener('pointerup', doAction);
      el.addEventListener('click', doAction);
      ```
      Reset `handled = false` each time the element becomes relevant again (e.g. each time the
      end-of-game popup reopens). The end-of-game popup's Play Again and close button both need
      this; a static, always-present Restart/Start button does not.
- [ ] Any custom `:hover`-styled element should gate the hover rule behind
      `@media (hover: hover) { ... }` — otherwise the first tap on a touch device only triggers
      the hover state, requiring a second tap for the actual click. (Shared classes like
      `.btn-restart` already have this; only matters for new custom hover styles you add.)

### Catalog
- [ ] Add a game card to `games.html` (copy an existing card; update title, description,
      category, href) with `<p class="game-card-lb-label no-lb">No Leaderboard</p>` in the
      footer, matching 4ordle's card, unless this game genuinely has one
- [ ] If the game is a **daily** puzzle (one play per IP per local calendar day, no
      leaderboard), use `<p class="game-card-lb-label daily-play">Daily Play Game!</p>`
      instead and wire the game to `/api/daily-play` — see `4ordle.html` /
      `fix-my-4ordle.html` (search for `DAILY-PLAY GATE`) for the reference implementation.
      Register the game key in `functions/api/daily-play.js`'s `ALLOWED_GAMES` set.
- [ ] Set `data-creator="father"` or `data-creator="son"` on the `<article class="game-card">`
      element — required on every card (planned "made by father / made by son" catalog filter;
      extensible if more creators join later)
- [ ] Insert the new card FIRST in `#game-grid` and renumber the `<!-- N. ... -->` comments
- [ ] Add a real 16:9 thumbnail image to `/images/[game-name].jpg` (resize to ~800×450,
      compress well under 100KB) and swap it in for the placeholder `.game-thumb-label`

### QA
- [ ] Resize to mobile width (or use a real phone) and tap Start — confirm fullscreen engages,
      header/stats/stage/keyboard stack in the standard order, and the keyboard is full width
      and readable (not squeezed)
- [ ] Confirm the play area actually stretches to fill the available height, not just the
      outer container — check for unexplained gaps between the play area and the keyboard
- [ ] If the game tracks per-letter keyboard status: solve/resolve part of the game, then
      continue playing — confirm never-guessed letters stay neutral, the resolved part's letters
      show a readable color (not invisible), and a brand-new letter typed afterward is handled
      correctly too
- [ ] Restart from the header — confirm it re-shows the Tap to Play gate rather than jumping
      straight into a new round; Play Again from the end-of-game popup should skip the gate
- [ ] Tap the end-of-game popup's close (X) button — confirm it dismisses without restarting,
      and the header's Back/Restart buttons are reachable underneath
- [ ] Play a longer session (several restarts in a row) — layout/state bugs in this archetype
      have tended to surface after repeated play, not a single quick test
- [ ] Desktop: confirm physical keyboard input still works, and nothing mobile-specific
      (hidden status line, tightened margins) leaked into the desktop layout

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

**End-of-game popup close (X in a circle):**

```html
<button type="button" class="game-over-close" id="endOverlayClose" aria-label="Close">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M18 6L6 18"/><path d="M6 6l12 12"/>
  </svg>
</button>
```
