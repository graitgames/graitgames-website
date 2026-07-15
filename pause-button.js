/* ============================================================================
   PAUSE-BUTTON.JS — shared pause control for game pages
   ----------------------------------------------------------------------------
   A single icon button, pinned to the top-right corner of the element it's
   given, that toggles between a pause and play glyph and shows a lightweight
   "Paused" card over that same element. The button owns its own click + Esc/P
   keyboard shortcut handling; the host game only reacts via the onPause/
   onResume callbacks (freezing its own update loop, resetting delta time on
   resume, etc.) — this component never touches the game's state directly.

   Usage:
     var pauseBtn = PauseButton.init({
       parent: 'gameViewport',        // element id (or ref) to append into —
                                       // must be position:relative and sized
                                       // to the play area (the same element
                                       // the game's own overlay is appended
                                       // to), so the button + card line up
                                       // with the canvas, not the whole page
       onPause: function () { ... },  // e.g. paused = true;
       onResume: function () { ... }  // e.g. paused = false;
     });

     // enable/disable alongside your own running state:
     startGame() { ...; pauseBtn.setEnabled(true); }
     endGame()   { ...; pauseBtn.setEnabled(false); }
   ============================================================================ */

var PauseButton = (function () {
  'use strict';

  var ICON_PAUSE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>';
  var ICON_PLAY = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l14 8-14 8V4z"></path></svg>';

  var CSS = '\
    .gg-pause-btn {\
      position: absolute;\
      top: 10px;\
      right: 10px;\
      /* Must sit ABOVE the .gg-pause-card (z-index 8) so it stays visible and\
         tappable while paused — otherwise the card covers it and there is no\
         way to resume on touch devices (no Esc/P keyboard shortcut). */\
      z-index: 9;\
      display: inline-flex;\
      align-items: center;\
      justify-content: center;\
      width: 2.2rem;\
      height: 2.2rem;\
      padding: 0;\
      background: rgba(7, 7, 15, 0.55);\
      border: 2px solid var(--color-cyan);\
      border-radius: var(--border-radius);\
      color: var(--color-cyan);\
      cursor: pointer;\
      transition: background 0.15s, box-shadow 0.15s, color 0.15s, border-color 0.15s;\
    }\
    .gg-pause-btn:hover { background: rgba(0, 234, 255, 0.15); box-shadow: var(--glow-cyan); }\
    .gg-pause-btn:focus-visible { outline: 2px solid var(--color-cyan); outline-offset: 3px; }\
    .gg-pause-btn[aria-pressed="true"] { border-color: var(--color-orange); color: var(--color-orange); }\
    .gg-pause-btn[aria-pressed="true"]:hover { background: rgba(255, 107, 43, 0.15); box-shadow: var(--glow-orange); }\
    .gg-pause-btn:disabled { opacity: 0.35; cursor: not-allowed; box-shadow: none; }\
    .gg-pause-card {\
      position: absolute;\
      inset: 0;\
      z-index: 8;\
      display: flex;\
      flex-direction: column;\
      align-items: center;\
      justify-content: center;\
      gap: 8px;\
      background: rgba(7, 7, 15, 0.82);\
      border-radius: var(--border-radius-lg);\
      text-align: center;\
      padding: 24px;\
    }\
    .gg-pause-card.hidden { display: none; }\
    .gg-pause-card h2 {\
      font-family: var(--font-headline);\
      font-size: 1.4rem;\
      color: var(--color-cyan);\
      text-shadow: var(--glow-cyan);\
      letter-spacing: 1px;\
      margin: 0;\
    }\
    .gg-pause-card p {\
      font-family: var(--font-mono);\
      font-size: 0.75rem;\
      color: var(--text-muted);\
      margin: 0;\
    }\
  ';

  function injectStyles() {
    if (document.getElementById('pause-button-styles')) return;
    var style = document.createElement('style');
    style.id = 'pause-button-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function init(opts) {
    var parent = typeof opts.parent === 'string' ? document.getElementById(opts.parent) : opts.parent;
    if (!parent) return null;

    injectStyles();

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gg-pause-btn';
    btn.setAttribute('aria-label', 'Pause game');
    btn.setAttribute('aria-pressed', 'false');
    btn.disabled = true;
    btn.innerHTML = ICON_PAUSE;
    parent.appendChild(btn);

    var card = document.createElement('div');
    card.className = 'gg-pause-card hidden';
    card.innerHTML = '<h2>⏸ Paused</h2><p>Press Esc, P, or the pause button to resume</p>';
    parent.appendChild(card);

    var paused = false;

    function setPaused(next) {
      if (btn.disabled) return;
      paused = next;
      btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      btn.innerHTML = paused ? ICON_PLAY : ICON_PAUSE;
      card.classList.toggle('hidden', !paused);
      if (paused) { if (opts.onPause) opts.onPause(); }
      else { if (opts.onResume) opts.onResume(); }
    }

    function toggle() { setPaused(!paused); }

    btn.addEventListener('click', toggle);

    document.addEventListener('keydown', function (e) {
      if (btn.disabled) return;
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') toggle();
    });

    return {
      button: btn,
      isPaused: function () { return paused; },
      setEnabled: function (enabled) {
        btn.disabled = !enabled;
        if (!enabled && paused) {
          paused = false;
          btn.setAttribute('aria-pressed', 'false');
          btn.innerHTML = ICON_PAUSE;
          card.classList.add('hidden');
        }
      }
    };
  }

  return { init: init };
})();
