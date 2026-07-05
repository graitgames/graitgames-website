/* ============================================================================
   GAME-OVER-CARD.JS — shared end-of-game popup for leaderboard games
   ----------------------------------------------------------------------------
   A full-viewport popup (position:fixed, not confined to the play area, so
   it's never squeezed by a shrinking canvas) shown when a run ends. Title
   ("✓ Score Saved!" / "💀 Game Over") is set automatically from whether the
   score qualified for the leaderboard; a close (X) button dismisses without
   restarting, so the player can screenshot their result or reach the
   header's Back/Restart buttons underneath. Every game gets the identical
   layout and behavior — only the accent color and the one line of result
   text in between are game-specific.

   Usage:
     var gameOverCard = GameOverCard.init({
       parent: 'game',                  // element id (or ref) to append into
       color: 'blue',                   // 'blue' | 'orange' | 'green'
       onPlayAgain: function () { ... } // the game's own restart logic
     });

     // at game-over, after Leaderboard.trySubmit's callback fires:
     Leaderboard.trySubmit(score, function (accepted) {
       gameOverCard.show({ accepted: accepted, text: 'You collected ' + n + ' relics.' });
     });

     // wire the header's own Restart button to also dismiss the popup:
     restartBtn.addEventListener('click', function () { gameOverCard.hide(); ... });
   ============================================================================ */

var GameOverCard = (function () {
  'use strict';

  var COLOR_VARS = {
    blue:   { color: '--color-cyan',   glow: '--glow-cyan' },
    orange: { color: '--color-orange', glow: '--glow-orange' },
    green:  { color: '--color-green',  glow: '--glow-green' }
  };

  var CSS = '\
    .game-over-modal {\
      position: fixed;\
      inset: 0;\
      z-index: 2000;\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      background: rgba(7, 7, 15, 0.88);\
      padding: 24px;\
      overflow-y: auto;\
    }\
    .game-over-modal.hidden { display: none; }\
    .game-over-card {\
      position: relative;\
      background: var(--bg-panel);\
      border: 2px solid var(--goc-color);\
      border-radius: var(--border-radius-lg);\
      box-shadow: var(--goc-glow);\
      padding: 28px 24px;\
      max-width: 380px;\
      width: 100%;\
      text-align: center;\
      margin: auto;\
    }\
    .game-over-card h2 {\
      font-family: var(--font-headline);\
      font-size: 1.2rem;\
      letter-spacing: 1px;\
      color: var(--goc-color);\
      text-shadow: var(--goc-glow);\
      margin: 0 0 12px;\
    }\
    .game-over-card p {\
      font-family: var(--font-body);\
      font-size: 0.9rem;\
      color: var(--text-description);\
      margin: 0 0 16px;\
    }\
    .game-over-leaderboard { margin-top: 20px; text-align: left; }\
    .game-over-close {\
      position: absolute;\
      top: 12px;\
      left: 12px;\
      width: 32px;\
      height: 32px;\
      border-radius: 50%;\
      background: transparent;\
      border: 2px solid var(--goc-color);\
      color: var(--goc-color);\
      display: flex;\
      align-items: center;\
      justify-content: center;\
      padding: 0;\
      cursor: pointer;\
    }\
    @media (hover: hover) {\
      .game-over-close:hover { background: var(--goc-color); color: var(--bg-primary); }\
    }\
  ';

  function injectStyles() {
    if (document.getElementById('game-over-card-styles')) return;
    var style = document.createElement('style');
    style.id = 'game-over-card-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function init(opts) {
    var parent = typeof opts.parent === 'string' ? document.getElementById(opts.parent) : opts.parent;
    if (!parent) return null;

    injectStyles();

    var colorVars = COLOR_VARS[opts.color] || COLOR_VARS.blue;

    var modal = document.createElement('div');
    modal.className = 'game-over-modal hidden';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'gameOverCardTitle');
    modal.innerHTML =
      '<div class="game-over-card">' +
        '<button type="button" class="game-over-close" aria-label="Close">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>' +
        '</button>' +
        '<h2 id="gameOverCardTitle"></h2>' +
        '<p></p>' +
        '<button type="button" class="btn btn-secondary">▶ Play Again</button>' +
        '<div class="game-over-leaderboard"></div>' +
      '</div>';
    parent.appendChild(modal);

    var card = modal.querySelector('.game-over-card');
    card.style.setProperty('--goc-color', 'var(' + colorVars.color + ')');
    card.style.setProperty('--goc-glow', 'var(' + colorVars.glow + ')');

    var closeBtn = modal.querySelector('.game-over-close');
    var titleEl = modal.querySelector('h2');
    var textEl = modal.querySelector('p');
    var playAgainBtn = modal.querySelector('.btn-secondary');
    var leaderboardEl = modal.querySelector('.game-over-leaderboard');

    // pointerup+click (guarded against double-firing on mouse, which fires
    // both) — this popup appears mid-gameplay, the same situation that
    // needs a second tap on a plain click in iOS Safari.
    var closeHandled = false, playAgainHandled = false;
    function guardedClose() {
      if (closeHandled) return;
      closeHandled = true;
      modal.classList.add('hidden');
    }
    function guardedPlayAgain() {
      if (playAgainHandled) return;
      playAgainHandled = true;
      modal.classList.add('hidden');
      if (opts.onPlayAgain) opts.onPlayAgain();
    }
    closeBtn.addEventListener('pointerup', guardedClose);
    closeBtn.addEventListener('click', guardedClose);
    playAgainBtn.addEventListener('pointerup', guardedPlayAgain);
    playAgainBtn.addEventListener('click', guardedPlayAgain);

    return {
      /* config: { accepted: bool, text: 'One line of result text.' } */
      show: function (config) {
        var accepted = !!(config && config.accepted);
        titleEl.textContent = accepted ? '✓ Score Saved!' : '💀 Game Over';
        textEl.textContent = (config && config.text) || '';
        if (window.Leaderboard && Leaderboard.renderCompact) {
          Leaderboard.renderCompact(leaderboardEl, 3);
        }
        closeHandled = false;
        playAgainHandled = false;
        modal.classList.remove('hidden');
      },
      hide: function () {
        modal.classList.add('hidden');
      }
    };
  }

  return { init: init };
})();
