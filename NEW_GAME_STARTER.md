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

/* Back button — square, cyan outline */
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

/* ── [LEADERBOARD] Initials entry (shown inside overlay on qualifying score) ── */
#ov-initials { display: none; }
#ov-initials h2 { color: var(--color-green); }
.initials-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 12px 0 20px;
}
.initial-box {
  width: 52px;
  height: 60px;
  background: var(--bg-secondary);
  border: 2px solid var(--color-green);
  border-radius: var(--border-radius);
  color: var(--color-green);
  font-family: var(--font-logo);
  font-size: 1.3rem;
  text-align: center;
  text-transform: uppercase;
  caret-color: transparent;
  outline: none;
  box-shadow: var(--glow-green);
  transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;
}
.initial-box:focus { border-color: var(--color-cyan); color: var(--color-cyan); box-shadow: var(--glow-cyan); }
.initials-actions { display: flex; gap: 12px; justify-content: center; }

/* ── [LEADERBOARD] Top 10 panel (positioned right of game-stage) ── */
.game-stage { position: relative; }
.leaderboard {
  position: absolute;
  left: calc(100% + 14px);
  top: 0;
  width: 250px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-accessible);
  border-radius: var(--border-radius-lg);
  padding: 16px;
}
@media (max-width: 960px) {
  .leaderboard { position: static; width: 250px; margin: 20px 0 0 auto; }
}
.lb-heading {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-green);
  text-align: center;
  margin-bottom: 12px;
}
.lb-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.85rem; }
.lb-table th {
  color: var(--text-muted);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-accessible);
  text-align: left;
}
.lb-table th:last-child, .lb-table td:last-child { text-align: right; }
.lb-table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.lb-rank  { color: var(--text-muted); width: 2.2rem; }
.lb-name  { color: var(--color-cyan); font-weight: 600; letter-spacing: 0.18em; }
.lb-score { color: var(--color-green); }
.lb-empty { text-align: center; color: var(--text-muted); padding: 20px 8px; }
tr.lb-new .lb-name, tr.lb-new .lb-score { color: var(--color-orange); }

---

### Required HTML structure — paste inside <body>

<body style="margin:0; background:var(--bg-primary); color:var(--text-primary); font-family:var(--font-body);">

  <!-- Game container -->
  <div style="max-width:800px; margin:0 auto; padding:24px 16px;">

    <!-- HEADER BAR: back | game title | restart — required on every game page -->
    <div class="game-header">

      <!-- Back button — SVG left-arrow, never a text character -->
      <a href="/games.html" class="btn-icon" aria-label="Back to Catalog">
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

    <!-- Game area — add class="game-stage" so the leaderboard can anchor to it [LEADERBOARD] -->
    <div class="game-stage">

      <!-- [YOUR GAME MARKUP HERE] -->

      <!-- ── [LEADERBOARD] Overlay must contain BOTH panels ── -->
      <!-- Standard overlay (ready / paused / game-over) -->
      <div class="overlay" id="overlay">
        <div id="ov-standard">
          <h2 id="overlay-title">Ready?</h2>
          <p id="overlay-text">[Start instructions]</p>
          <button type="button" class="btn btn-secondary" id="start-btn">▶ Start Game</button>
        </div>

        <!-- [LEADERBOARD] Initials entry panel — hidden until a qualifying score -->
        <div id="ov-initials">
          <h2>🏆 Top Score!</h2>
          <p id="ov-score-label"></p>
          <p style="margin-bottom:0;">Enter your initials:</p>
          <div class="initials-row">
            <input class="initial-box" id="i0" type="text" maxlength="1"
                   inputmode="text" autocomplete="off" spellcheck="false" aria-label="First initial" />
            <input class="initial-box" id="i1" type="text" maxlength="1"
                   inputmode="text" autocomplete="off" spellcheck="false" aria-label="Second initial" />
            <input class="initial-box" id="i2" type="text" maxlength="1"
                   inputmode="text" autocomplete="off" spellcheck="false" aria-label="Third initial" />
          </div>
          <div class="initials-actions">
            <button type="button" class="btn btn-primary"      id="submit-initials">Submit</button>
            <button type="button" class="btn btn-outline-cyan" id="skip-initials">Skip</button>
          </div>
        </div>
      </div>
      <!-- ── end overlay ── -->

      <!-- [LEADERBOARD] Top 10 panel — sits to the right of the game on desktop -->
      <section class="leaderboard" aria-labelledby="lb-heading">
        <p class="lb-heading" id="lb-heading">// Top 10 This Month //</p>
        <table class="lb-table" aria-label="Monthly leaderboard">
          <thead>
            <tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Score</th></tr>
          </thead>
          <tbody id="lb-body">
            <tr><td colspan="3" class="lb-empty">Loading…</td></tr>
          </tbody>
        </table>
      </section>

    </div><!-- /.game-stage -->

  </div>

  <script>
  (function () {
    'use strict';

    /* ── [LEADERBOARD] Config ── */
    var GAME_KEY = '[game-key]';  /* e.g. 'snake', 'space-dogfight' — must match GAME_CAPS in submit-score.js */
    var cachedScores = [];

    /* ── [LEADERBOARD] DOM refs ── */
    var ovStandard    = document.getElementById('ov-standard');
    var ovInitials    = document.getElementById('ov-initials');
    var ovScoreLbl    = document.getElementById('ov-score-label');
    var submitInitBtn = document.getElementById('submit-initials');
    var skipInitBtn   = document.getElementById('skip-initials');
    var initBoxes     = [document.getElementById('i0'), document.getElementById('i1'), document.getElementById('i2')];
    var lbBody        = document.getElementById('lb-body');

    /* ── [LEADERBOARD] Fetch top 10 on page load ── */
    function fetchLeaderboard() {
      fetch('/api/scores?game=' + GAME_KEY)
        .then(function (r) { return r.json().then(function (d) { return r.ok ? d : null; }); })
        .then(function (data) { renderLeaderboard(data && data.scores ? data.scores : [], null); })
        .catch(function ()   { renderLeaderboard([], null); });
    }

    function renderLeaderboard(scores, newInitials) {
      if (!scores || scores.length === 0) {
        lbBody.innerHTML = '<tr><td colspan="3" class="lb-empty">No scores yet this month. Be first!</td></tr>';
        return;
      }
      lbBody.innerHTML = scores.map(function (row, i) {
        var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
        var isNew = newInitials && i === scores.findIndex(function (s) { return s.initials === newInitials; });
        return '<tr' + (isNew ? ' class="lb-new"' : '') + '>' +
          '<td class="lb-rank">'  + medal + '</td>' +
          '<td class="lb-name">'  + row.initials + '</td>' +
          '<td class="lb-score">' + row.score + '</td>' +
          '</tr>';
      }).join('');
    }

    function qualifiesForLeaderboard(s) {
      if (s <= 0) return false;
      if (cachedScores.length < 10) return true;
      return s > cachedScores[cachedScores.length - 1].score;
    }

    /* ── [LEADERBOARD] Overlay helpers ── */
    function showInitialsEntry(currentScore) {
      ovScoreLbl.textContent = 'You scored ' + currentScore + '!';
      ovStandard.style.display = 'none';
      ovInitials.style.display = 'block';
      initBoxes.forEach(function (b) { b.value = ''; });
      initBoxes[0].focus();
    }

    function showStandardOverlay(title, text, btnText) {
      ovInitials.style.display = 'none';
      ovStandard.style.display = '';
      document.getElementById('overlay-title').textContent = title;
      document.getElementById('overlay-text').innerHTML = text;
      document.getElementById('start-btn').textContent = btnText;
      document.getElementById('overlay').classList.remove('hidden');
    }

    /* ── [LEADERBOARD] Initials box keyboard handling ── */
    initBoxes.forEach(function (box, idx) {
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace')  { e.preventDefault(); box.value = ''; if (idx > 0) initBoxes[idx - 1].focus(); return; }
        if (e.key === 'Enter')      { e.preventDefault(); submitInitBtn.click(); return; }
        if (e.key === 'ArrowLeft'  && idx > 0) { e.preventDefault(); initBoxes[idx - 1].focus(); return; }
        if (e.key === 'ArrowRight' && idx < 2) { e.preventDefault(); initBoxes[idx + 1].focus(); return; }
      });
      box.addEventListener('input', function () {
        var val = box.value.replace(/[^A-Za-z]/g, '').slice(-1).toUpperCase();
        box.value = val;
        if (val && idx < 2) initBoxes[idx + 1].focus();
      });
    });

    /* ── [LEADERBOARD] Submit initials ── */
    submitInitBtn.addEventListener('click', function () {
      var initials = initBoxes.map(function (b) { return b.value.toUpperCase(); }).join('');
      if (!/^[A-Z]{3}$/.test(initials)) return;
      submitInitBtn.disabled = true; skipInitBtn.disabled = true;
      submitInitBtn.textContent = 'Saving…';
      fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: GAME_KEY, initials: initials, score: currentScore })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.accepted && data.scores) { cachedScores = data.scores; renderLeaderboard(cachedScores, initials); }
          showStandardOverlay(
            data.accepted ? '✓ Score Saved!' : '💀 Game Over',
            data.accepted ? 'Check the leaderboard!' : 'Better luck next time.',
            '▶ Play Again'
          );
        })
        .catch(function () { showStandardOverlay('💀 Game Over', 'Better luck next time.', '▶ Play Again'); })
        .finally(function () { submitInitBtn.disabled = false; skipInitBtn.disabled = false; submitInitBtn.textContent = 'Submit'; });
    });

    skipInitBtn.addEventListener('click', function () {
      showStandardOverlay('💀 Game Over', 'Better luck next time.', '▶ Play Again');
    });
    /* ── end [LEADERBOARD] ── */


    /* ── YOUR GAME LOGIC HERE ── */
    var currentScore = 0;  /* [LEADERBOARD] keep this var in scope for submitInitBtn */

    function gameOver() {
      /* [LEADERBOARD] replace your standard overlay call with this block: */
      if (qualifiesForLeaderboard(currentScore)) {
        document.getElementById('overlay').classList.remove('hidden');
        showInitialsEntry(currentScore);
      } else {
        showStandardOverlay('💀 Game Over', 'Better luck next time.', '▶ Play Again');
      }
      /* [NO LEADERBOARD] just show your standard overlay instead */
    }

    document.getElementById('restartBtn').addEventListener('click', init);

    function init() {
      currentScore = 0;
      /* [LEADERBOARD] */ fetchLeaderboard();
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
- [ ] [LEADERBOARD] Keep the `.leaderboard`, `.lb-*`, `.initials-*`, `.initial-box`, `#ov-initials` rules

**HTML head**
- [ ] Replace the Artifact font `<link>` with the full stack:
      `Press+Start+2P&family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Share+Tech+Mono`
- [ ] Add `<link rel="stylesheet" href="../styles.css" />` after the font link

**HTML body**
- [ ] Add `<a href="#game" class="skip-link">Skip to game</a>` as the first element inside `<body>`
- [ ] Add `<nav id="main-nav"></nav>` immediately before `<main>` (nav.js replaces this)
- [ ] Wrap game content in `<main class="container-narrow section" id="game">`
- [ ] Add `<script src="../nav.js"></script>` and `<script src="../footer.js"></script>` before `</body>`
- [ ] [LEADERBOARD] Add the game key to `GAME_CAPS` in `functions/api/submit-score.js`

**Catalog**
- [ ] Add a game card to `games.html` (copy an existing card; update title, description, category, href)
- [ ] If the game introduces a new category, add the sidebar button + `.category-count` badge in `games.html`

**QA**
- [ ] Test header bar on mobile (320px) — back, title, and restart must stay in one row
- [ ] Test restart button — confirm it resets all game state cleanly
- [ ] Check focus rings are visible on all interactive elements (keyboard nav)
- [ ] Verify ARIA labels on both icon buttons and live regions on dynamic score/status displays
- [ ] [LEADERBOARD] Play a round with a qualifying score — confirm initials prompt appears and score saves
- [ ] [LEADERBOARD] Refresh the page — confirm the saved score appears in the Top 10 panel

---

## SVG Icon Reference

Always use these SVG icons. Never substitute Unicode characters (`←`, `↺`) — they render as emoji ovals on mobile Safari.

**Back to Catalog (left arrow):**

```html
<a href="/games.html" class="btn-icon" aria-label="Back to Catalog">
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
