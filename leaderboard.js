(function () {
  'use strict';

  /* ── State ─────────────────────────────────────────────────────── */
  var gameKey      = null;
  var cachedScores = [];
  var pendingScore = null;
  var doneCallback = null;

  /* ── DOM refs (populated after injection) ───────────────────────── */
  var lbBody, lbOverlay, initBoxes, submitBtn, skipBtn, scoreLabel;

  /* ── Styles ─────────────────────────────────────────────────────── */
  var CSS = '\
    .lb-panel {\
      position: absolute;\
      left: calc(100% + 14px);\
      top: 0;\
      width: 250px;\
      background: var(--bg-secondary);\
      border: 1px solid var(--border-accessible);\
      border-radius: var(--border-radius-lg);\
      padding: var(--space-md);\
    }\
    @media (max-width: 1000px) {\
      .lb-panel { position: static; width: 250px; margin: var(--space-lg) auto 0; }\
    }\
    .lb-heading {\
      font-family: var(--font-mono);\
      font-size: 0.72rem;\
      letter-spacing: 0.2em;\
      text-transform: uppercase;\
      color: var(--color-green);\
      text-align: center;\
      margin-bottom: var(--space-md);\
    }\
    .lb-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 0.85rem; }\
    .lb-table th {\
      color: var(--text-muted);\
      font-size: 0.68rem;\
      letter-spacing: 0.1em;\
      text-transform: uppercase;\
      padding: 6px 8px;\
      border-bottom: 1px solid var(--border-accessible);\
      text-align: left;\
    }\
    .lb-table th:last-child, .lb-table td:last-child { text-align: right; }\
    .lb-table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); }\
    .lb-rank  { color: var(--text-muted); width: 2.2rem; }\
    .lb-name  { color: var(--color-cyan); font-weight: 600; letter-spacing: 0.18em; }\
    .lb-score { color: var(--color-green); }\
    .lb-empty { text-align: center; color: var(--text-muted); padding: 20px 8px; }\
    tr.lb-new .lb-name, tr.lb-new .lb-score { color: var(--color-orange); }\
    .lb-initials-overlay {\
      position: fixed;\
      inset: 0;\
      z-index: 2000;\
      display: none;\
      align-items: center;\
      justify-content: center;\
      padding: 24px;\
      background: rgba(7, 7, 15, 0.88);\
      overflow-y: auto;\
    }\
    .lb-initials-overlay.active { display: flex; }\
    .lb-initials-card {\
      background: var(--bg-secondary);\
      border: 2px solid var(--color-green);\
      border-radius: var(--border-radius-lg);\
      box-shadow: var(--glow-green);\
      padding: var(--space-lg);\
      max-width: 340px;\
      width: 100%;\
      text-align: center;\
      margin: auto;\
    }\
    .lb-initials-overlay h2 { color: var(--color-green); margin-bottom: var(--space-sm); }\
    .lb-initials-overlay p  { color: var(--text-description); margin-bottom: var(--space-sm); }\
    .lb-initials-row {\
      display: flex;\
      gap: 12px;\
      justify-content: center;\
      margin: var(--space-sm) 0 var(--space-lg);\
    }\
    .lb-initial-box {\
      width: 52px;\
      height: 60px;\
      background: var(--bg-secondary);\
      border: 2px solid var(--color-green);\
      border-radius: var(--border-radius);\
      color: var(--color-green);\
      font-family: var(--font-logo);\
      font-size: 1.3rem;\
      text-align: center;\
      text-transform: uppercase;\
      caret-color: transparent;\
      outline: none;\
      box-shadow: var(--glow-green);\
      transition: border-color 0.15s, color 0.15s, box-shadow 0.15s;\
    }\
    .lb-initial-box:focus { border-color: var(--color-cyan); color: var(--color-cyan); box-shadow: var(--glow-cyan); }\
    .lb-initials-actions { display: flex; gap: 12px; justify-content: center; }\
  ';

  function injectStyles() {
    if (document.getElementById('lb-styles')) return;
    var style = document.createElement('style');
    style.id = 'lb-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ── Inject panel + initials overlay into .game-stage ──────────── */
  function injectHTML(stage) {
    var panel = document.createElement('section');
    panel.className = 'lb-panel';
    panel.setAttribute('aria-labelledby', 'lb-heading');
    panel.innerHTML =
      '<p class="lb-heading" id="lb-heading">// Monthly Leaderboard //</p>' +
      '<table class="lb-table" aria-label="Monthly leaderboard">' +
        '<thead><tr>' +
          '<th scope="col">#</th>' +
          '<th scope="col">Name</th>' +
          '<th scope="col">Score</th>' +
        '</tr></thead>' +
        '<tbody id="lb-body">' +
          '<tr><td colspan="3" class="lb-empty">Loading…</td></tr>' +
        '</tbody>' +
      '</table>';
    stage.appendChild(panel);
    lbBody = document.getElementById('lb-body');

    lbOverlay = document.createElement('div');
    lbOverlay.className = 'lb-initials-overlay';
    lbOverlay.setAttribute('role', 'dialog');
    lbOverlay.setAttribute('aria-modal', 'true');
    lbOverlay.setAttribute('aria-labelledby', 'lb-overlay-title');
    lbOverlay.innerHTML =
      '<div class="lb-initials-card">' +
        '<h2 id="lb-overlay-title">🏆 Top Score!</h2>' +
        '<p id="lb-score-label"></p>' +
        '<p style="margin-bottom:0">Enter your initials:</p>' +
        '<div class="lb-initials-row">' +
          '<input class="lb-initial-box" id="lb-i0" type="text" maxlength="1" inputmode="text" autocomplete="off" spellcheck="false" aria-label="First initial" />' +
          '<input class="lb-initial-box" id="lb-i1" type="text" maxlength="1" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Second initial" />' +
          '<input class="lb-initial-box" id="lb-i2" type="text" maxlength="1" inputmode="text" autocomplete="off" spellcheck="false" aria-label="Third initial" />' +
        '</div>' +
        '<div class="lb-initials-actions">' +
          '<button type="button" class="btn btn-outline-cyan" id="lb-skip">Skip</button>' +
          '<button type="button" class="btn btn-primary" id="lb-submit">Submit</button>' +
        '</div>' +
      '</div>';
    stage.appendChild(lbOverlay);

    scoreLabel = document.getElementById('lb-score-label');
    submitBtn  = document.getElementById('lb-submit');
    skipBtn    = document.getElementById('lb-skip');
    initBoxes  = [
      document.getElementById('lb-i0'),
      document.getElementById('lb-i1'),
      document.getElementById('lb-i2')
    ];

    initBoxes.forEach(function (box, idx) {
      // No manual .focus() on pointerdown here (there used to be one) — it
      // fires at the very start of the tap, before the browser's own native
      // focus grant lands at the end of it, and the two racing on iOS
      // Safari is what was causing the keyboard to flash open and
      // immediately close. A plain tap already focuses a text input
      // natively; no JS needed.
      box.addEventListener('keydown', function (e) {
        if (e.key === 'Backspace')   { e.preventDefault(); box.value = ''; if (idx > 0) initBoxes[idx - 1].focus(); return; }
        if (e.key === 'Enter')       { e.preventDefault(); submitBtn.click(); return; }
        if (e.key === 'ArrowLeft'  && idx > 0) { e.preventDefault(); initBoxes[idx - 1].focus(); return; }
        if (e.key === 'ArrowRight' && idx < 2) { e.preventDefault(); initBoxes[idx + 1].focus(); return; }
      });
      box.addEventListener('input', function () {
        var val = box.value.replace(/[^A-Za-z]/g, '').slice(-1).toUpperCase();
        box.value = val;
        if (val && idx < 2) initBoxes[idx + 1].focus();
      });
    });

    // Bound to both pointerup (fires immediately and reliably on touch —
    // these buttons live in an overlay that pops up mid-gameplay, right as
    // the player dies, which is the same "needs a second tap" situation the
    // power-up cards had) and click (keyboard/mouse activation never fires
    // pointerup). actionsLocked stops a mouse click — which fires both
    // pointerup and click — from running the handler twice; it's reset
    // each time the overlay is (re)shown in trySubmit.
    submitBtn.addEventListener('pointerup', guardedSubmit);
    submitBtn.addEventListener('click', guardedSubmit);
    skipBtn.addEventListener('pointerup', guardedSkip);
    skipBtn.addEventListener('click', guardedSkip);
  }

  var actionsLocked = false;
  function guardedSubmit() {
    if (actionsLocked) return;
    actionsLocked = true;
    // handleSubmit bails out (returns false) if the initials aren't filled
    // in yet — unlock immediately so the player can fix them and try again,
    // rather than locking the button after a no-op tap.
    if (handleSubmit() === false) actionsLocked = false;
  }
  function guardedSkip() {
    if (actionsLocked) return;
    actionsLocked = true;
    handleSkip();
  }

  /* ── API calls ──────────────────────────────────────────────────── */
  function fetchScores() {
    fetch('/api/scores?game=' + gameKey)
      .then(function (r) { return r.json().then(function (d) { return r.ok ? d : null; }); })
      .then(function (data) { render(data && data.scores ? data.scores : [], null); })
      .catch(function () { render([], null); });
  }

  function handleSubmit() {
    var initials = initBoxes.map(function (b) { return b.value.toUpperCase(); }).join('');
    if (!/^[A-Z]{3}$/.test(initials)) return false;

    submitBtn.disabled    = true;
    skipBtn.disabled      = true;
    submitBtn.textContent = 'Saving…';

    fetch('/api/submit-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game: gameKey, initials: initials, score: pendingScore })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.accepted && data.scores) { render(data.scores, initials); }
        closeOverlay(true);
      })
      .catch(function () { closeOverlay(false); })
      .finally(function () {
        submitBtn.disabled    = false;
        skipBtn.disabled      = false;
        submitBtn.textContent = 'Submit';
      });
    return true;
  }

  function handleSkip() { closeOverlay(false); }

  function closeOverlay(accepted) {
    lbOverlay.classList.remove('active');
    if (typeof doneCallback === 'function') doneCallback(accepted);
  }

  /* ── Render leaderboard rows ────────────────────────────────────── */
  function render(scores, newInitials) {
    cachedScores = scores || [];
    if (!cachedScores.length) {
      lbBody.innerHTML = '<tr><td colspan="3" class="lb-empty">No scores yet this month. Be first!</td></tr>';
      return;
    }
    lbBody.innerHTML = cachedScores.map(function (row, i) {
      var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
      var isNew = newInitials && i === cachedScores.findIndex(function (s) { return s.initials === newInitials; });
      return '<tr' + (isNew ? ' class="lb-new"' : '') + '>' +
        '<td class="lb-rank">'  + medal + '</td>' +
        '<td class="lb-name">'  + row.initials + '</td>' +
        '<td class="lb-score">' + row.score    + '</td>' +
        '</tr>';
    }).join('');
  }

  /* ── Compact top-N board, for embedding in a game's own end-of-game
     popup (see gnome-crawler.html's #gameOverModal). Reuses .lb-heading/
     .lb-table so it looks consistent with the full .lb-panel. ─────── */
  function renderCompact(container, count) {
    var n = count || 3;
    var scores = cachedScores.slice(0, n);
    var rowsHtml = scores.length
      ? scores.map(function (row, i) {
          var medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
          return '<tr>' +
            '<td class="lb-rank">'  + medal + '</td>' +
            '<td class="lb-name">'  + row.initials + '</td>' +
            '<td class="lb-score">' + row.score    + '</td>' +
            '</tr>';
        }).join('')
      : '<tr><td colspan="3" class="lb-empty">No scores yet this month. Be first!</td></tr>';
    container.innerHTML =
      '<p class="lb-heading">// Top ' + n + ' //</p>' +
      '<table class="lb-table" aria-label="Top scores">' +
        '<thead><tr>' +
          '<th scope="col">#</th>' +
          '<th scope="col">Name</th>' +
          '<th scope="col">Score</th>' +
        '</tr></thead>' +
        '<tbody>' + rowsHtml + '</tbody>' +
      '</table>';
  }

  /* ── Public API ─────────────────────────────────────────────────── */
  window.Leaderboard = {

    /* Call once on page load.  config: { gameKey: 'snake' } */
    init: function (config) {
      gameKey = config.gameKey;
      var stage = document.querySelector('.game-stage');
      if (!stage) return;
      stage.style.position = 'relative';
      injectStyles();
      injectHTML(stage);
      fetchScores();
    },

    /* Renders a compact top-N table into the given container element.
       Call after trySubmit's onDone fires, so cachedScores reflects any
       score that was just accepted. */
    renderCompact: renderCompact,

    /* Call on game-over / win.
       Shows the initials overlay if score qualifies for top 10.
       onDone(accepted) is called after submit or skip. */
    trySubmit: function (score, onDone) {
      pendingScore = score;
      doneCallback = onDone;
      var qualifies = score > 0 && (
        cachedScores.length < 10 ||
        score > cachedScores[cachedScores.length - 1].score
      );
      if (qualifies) {
        scoreLabel.textContent = 'You scored ' + score + '!';
        initBoxes.forEach(function (b) { b.value = ''; });
        actionsLocked = false;
        lbOverlay.classList.add('active');
        // No auto-focus here: trySubmit is called from deep inside the game
        // loop (a collision/game-over check), not from a user gesture, and
        // iOS Safari only reliably focuses/shows the keyboard for a .focus()
        // call made synchronously within one. Calling it anyway left the
        // first box in a half-focused state that took an extra real tap to
        // actually engage — better to just let the player's own tap focus
        // it normally.
      } else {
        if (typeof onDone === 'function') onDone(false);
      }
    }
  };

})();
