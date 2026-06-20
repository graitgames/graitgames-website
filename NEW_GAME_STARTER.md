# GRaiT GAMES — New Game Starter

This document contains everything needed to prototype a new GRaiT GAMES game in
**Claude Artifacts**. Copy the prompt below into a new Artifacts conversation, replace
the `[PLACEHOLDERS]`, and start building.

Once the game plays well in Artifacts, copy the finished code into a new file under
`/games/` and wire in the real `styles.css`, `nav.js`, and `footer.js` (see the
**Integration Checklist** at the bottom).

---

## Artifacts Prompt (copy everything inside the code block)

```
Build a browser game for GRaiT GAMES called [GAME NAME].

[1–2 sentence description of the game concept and win condition.]

---

### Tech rules
- Pure HTML + CSS + vanilla JavaScript in a single file — no frameworks, no libraries, no build step.
- Wrap all JS in an IIFE: `(function () { 'use strict'; /* … */ })();`
- No TypeScript, no JSX, no ES modules.
- Keep code readable — this is a father-and-son educational project.

---

### Brand & visual style
Retro-futuristic synthwave arcade. Dark backgrounds, neon glow accents, high contrast.
Primary colors: **orange #FF6B2B** and **green #39FF14**. Cyan #00EAFF is a supporting accent.
No washed-out pastels. No heavy purple or magenta in primary UI chrome.

Use these CSS custom properties at the top of your <style> block — do not hardcode the hex values anywhere else:

```css
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

  /* Neon glow (box-shadow / text-shadow only — never rely on for readability) */
  --glow-green:        0 0 12px rgba(57, 255, 20, 0.45);
  --glow-orange:       0 0 12px rgba(255, 107, 43, 0.45);
  --glow-cyan:         0 0 12px rgba(0, 234, 255, 0.35);

  /* Typography */
  --font-logo:         'Press Start 2P', monospace;   /* pixel / game titles */
  --font-headline:     'Orbitron', sans-serif;         /* h1–h2 */
  --font-body:         'Rajdhani', sans-serif;         /* body / nav / labels */
  --font-mono:         'Share Tech Mono', monospace;   /* stats / scores / code */
}
```

Load all four fonts from Google Fonts in the <head>:
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
```

---

### Page layout
Use this exact structure — it matches every other game on the site:

```html
<body style="margin:0; background:var(--bg-primary); color:var(--text-primary); font-family:var(--font-body);">

  <!-- Game container -->
  <div style="max-width:800px; margin:0 auto; padding:24px 16px;">

    <!-- HEADER BAR: back | game title | restart (required on every game page) -->
    <div class="game-header">

      <!-- Back button (SVG left-arrow — do NOT use a text character) -->
      <a href="/games.html" class="btn-icon" aria-label="Back to Catalog">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
        </svg>
      </a>

      <!-- Game title (Press Start 2P, cyan, 0.9rem) -->
      <p class="game-title-bar" role="heading" aria-level="1">[GAME TITLE IN CAPS]</p>

      <!-- Restart button (SVG circular arrow — do NOT use ↺ text character) -->
      <button type="button" class="btn-restart" id="restartBtn" aria-label="Restart game">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
        </svg>
      </button>
    </div>

    <!-- Description line (sits directly below the header bar) -->
    <p style="text-align:center; color:var(--text-description); margin-bottom:24px; font-family:var(--font-body);">
      [One-sentence game description with key terms highlighted in
      <span style="color:var(--color-orange)">orange</span> or
      <span style="color:var(--color-green)">green</span>.]
    </p>

    <!-- Stats row (optional — use for score, time, lives, etc.) -->
    <div class="game-stats">
      <div class="stat-box">
        <div class="stat-label">Score</div>
        <div class="stat-value" id="score">0</div>
      </div>
      <!-- add more stat-box divs as needed -->
    </div>

    <!-- Game area (canvas, board grid, etc.) -->
    <!-- [YOUR GAME MARKUP HERE] -->

  </div>
</body>
```

Required CSS for the header bar and shared components:

```css
/* Page base */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* Header bar */
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

/* Game title (Press Start 2P, cyan) */
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

/* Back button (square, cyan outline) */
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

/* Restart button (square, green outline) */
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
.btn-restart:hover  { background: var(--color-green); color: var(--bg-primary); box-shadow: var(--glow-green); }
.btn-restart:disabled { border-color: var(--border-accessible); color: var(--text-muted); cursor: not-allowed; }

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
.btn-primary   { background: var(--color-green);  color: var(--bg-primary);  border-color: var(--color-green); }
.btn-primary:hover   { box-shadow: var(--glow-green); }
.btn-secondary { background: var(--color-orange); color: var(--bg-primary);  border-color: var(--color-orange); }
.btn-secondary:hover { box-shadow: var(--glow-orange); }
.btn-outline-cyan { background: transparent; color: var(--color-cyan); border-color: var(--color-cyan); }
.btn-outline-cyan:hover { background: rgba(0,234,255,0.08); box-shadow: var(--glow-cyan); }
```

---

### Accessibility checklist
- All interactive elements have an `aria-label` if they lack visible text.
- Use `role="status" aria-live="polite"` on score/status displays that update dynamically.
- Keyboard focus visible: bright outline (cyan, green, or orange) on `:focus-visible`.
- Minimum touch target size: 44×44px for any tappable element.
- Do not use color as the only way to communicate state.

---

### What NOT to include in the Artifact
The following are injected automatically on the live site and must NOT be added to the
Artifact prototype:
- The GRaiT GAMES navigation bar (comes from `nav.js`)
- The site footer with newsletter signup (comes from `footer.js`)
- A `<link>` to `styles.css` (not available in Artifacts — inline everything)

---

Build the complete game now. Make it fun and polished. When the game is complete, output
the full HTML file ready to save.
```

---

## Integration Checklist (after Artifacts → live site)

When copying the finished Artifact into `/games/[game-name].html`:

- [ ] Replace the inlined `:root` variables block with `<link rel="stylesheet" href="../styles.css" />`
- [ ] Remove the inlined `.game-header`, `.btn-icon`, `.btn-restart`, `.stat-box`, `.btn` CSS — these live in `styles.css` already
- [ ] Keep only game-specific CSS in the inline `<style>` block
- [ ] Add `<nav id="main-nav"></nav>` placeholder before `<main>`
- [ ] Add `<a href="#game" class="skip-link">Skip to game</a>` as first child of `<body>`
- [ ] Replace font `<link>` with the full stack (Artifact may load a subset): `Press+Start+2P&family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&family=Share+Tech+Mono`
- [ ] Add `<script src="../nav.js"></script>` and `<script src="../footer.js"></script>` before `</body>`
- [ ] Add the game card to `games.html` (copy an existing card, update title / description / category / href)
- [ ] If the game uses a new category, add the sidebar button + `.category-count` badge in `games.html`
- [ ] Test on mobile (320px) and desktop — check header bar stays in one row
- [ ] Run a quick WCAG check: focus rings visible, ARIA labels on icon buttons, live regions on dynamic scores

---

## SVG Icon Reference

**Back button (left arrow):**
```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
</svg>
```

**Restart button (circular arrow):**
```html
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
     stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
  <path d="M3 3v5h5"/>
</svg>
```

> Always use SVG icons — never Unicode characters like `←` or `↺`.
> Unicode glyphs render as emoji on mobile Safari.
