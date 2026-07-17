/* ============================================================================
   TOUCH-JOYSTICK.JS — shared mobile joystick + action button for game pages
   ----------------------------------------------------------------------------
   Injects a circular drag-joystick (snaps to one of 4 cardinal directions,
   mirroring keyboard arrow-key flags — dragging diagonally still only ever
   sets one direction, never two at once) plus a round action button, styled
   identically across every game so the mobile control layout never varies.
   Only visible on touch/narrow viewports (pointer: coarse or <=820px wide);
   the CSS handles that, so it's safe to always call init().

   Usage:
     TouchJoystick.init({
       parent: 'game',                     // element id (or ref) to append into
       keys: keys,                         // the game's own keys{} object to mutate
       keyNames: {                         // which key strings the joystick sets
         up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright'
       },
       moveLabel: 'Move gnome',            // aria-label for the joystick
       actionLabel: 'DASH',                // button text
       actionAriaLabel: 'Spirit step dash',
       actionIcon: '<svg ...>...</svg>',   // inline icon markup shown above the label
       onActionStart: function () { ... }, // called on button press
       onActionEnd: function () { ... }    // called on button release (optional)
     });
   ============================================================================ */

var TouchJoystick = (function () {
  'use strict';

  var CSS = '\
    .touch-controls {\
      display: none;\
      width: 100%;\
      max-width: 640px;\
      justify-content: space-between;\
      align-items: center;\
      gap: 16px;\
      margin-top: 4px;\
      -webkit-user-select: none;\
      user-select: none;\
      -webkit-touch-callout: none;\
    }\
    @media (pointer: coarse), (max-width: 820px) {\
      .touch-controls { display: flex; }\
    }\
    .joystick-base {\
      position: relative;\
      width: 116px;\
      height: 116px;\
      border-radius: 50%;\
      background: var(--bg-panel);\
      border: 2px solid var(--color-cyan);\
      touch-action: none;\
      -webkit-tap-highlight-color: transparent;\
      -webkit-user-select: none;\
      user-select: none;\
      -webkit-touch-callout: none;\
    }\
    .joystick-thumb {\
      position: absolute;\
      top: 50%;\
      left: 50%;\
      width: 52px;\
      height: 52px;\
      margin: -26px 0 0 -26px;\
      border-radius: 50%;\
      background: rgba(0, 234, 255, 0.25);\
      border: 2px solid var(--color-cyan);\
      box-shadow: var(--glow-cyan);\
      pointer-events: none;\
      -webkit-user-select: none;\
      user-select: none;\
      -webkit-touch-callout: none;\
    }\
    .joystick-base.active-touch { box-shadow: var(--glow-cyan); }\
    .action-btn {\
      display: flex;\
      flex-direction: column;\
      align-items: center;\
      justify-content: center;\
      gap: 2px;\
      width: 64px;\
      height: 64px;\
      border-radius: 50%;\
      background: var(--bg-panel);\
      border: 2px solid var(--color-orange);\
      color: var(--color-orange);\
      font-family: var(--font-mono);\
      font-size: 0.6rem;\
      touch-action: none;\
      -webkit-tap-highlight-color: transparent;\
      -webkit-user-select: none;\
      user-select: none;\
      -webkit-touch-callout: none;\
    }\
    .action-btn:active, .action-btn.active-touch { background: rgba(255,107,43,0.25); box-shadow: var(--glow-orange); }\
    /* While a joystick/button touch is in progress, disable text selection and\
       the iOS long-press callout PAGE-WIDE. The finger routinely slides off the\
       joystick and over selectable HUD text (score, buff pills, progress) mid-\
       drag; scoping this only to .touch-controls left that text selectable,\
       which is what let the Copy/Find Selection/Look Up menu slip through. This\
       class is only present during an active drag, so normal page selection\
       (menus, copying text between rounds) is unaffected the rest of the time. */\
    body.joystick-dragging, body.joystick-dragging * {\
      -webkit-user-select: none !important;\
      user-select: none !important;\
      -webkit-touch-callout: none !important;\
    }\
  ';

  function injectStyles() {
    if (document.getElementById('touch-joystick-styles')) return;
    var style = document.createElement('style');
    style.id = 'touch-joystick-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // Definitive suppression of iOS Safari's native touch-selection gesture.
  // preventDefault() on a POINTER event does NOT cancel the underlying touch
  // gesture on iOS, so pointer-level guards can't stop selection/callout once
  // the finger leaves the joystick. Preventing default on the actual touchmove
  // (with passive:false) is the only reliable way to kill it. We attach this at
  // the document level only while a control is being dragged, then detach it.
  //
  // dragDepth is ref-counted across every control on the page (a twin-stick
  // game has two joysticks + a button sharing it), so each control MUST balance
  // exactly one begin with one end — the per-control guards in init() below
  // (ignoring extra fingers on an already-active control) are what keep that
  // true. If it ever leaked above 0, the body class + touchmove blocker would
  // stick and freeze page scrolling/selection until reload.
  var dragDepth = 0;
  function blockTouchMove(e) { e.preventDefault(); }
  function beginDragSuppression() {
    dragDepth++;
    if (dragDepth === 1) {
      document.body.classList.add('joystick-dragging');
      document.addEventListener('touchmove', blockTouchMove, { passive: false });
    }
  }
  function endDragSuppression() {
    if (dragDepth === 0) return;
    dragDepth--;
    if (dragDepth === 0) {
      document.body.classList.remove('joystick-dragging');
      document.removeEventListener('touchmove', blockTouchMove, { passive: false });
    }
  }

  function init(opts) {
    var parent = typeof opts.parent === 'string' ? document.getElementById(opts.parent) : opts.parent;
    if (!parent || !opts.keys) return null;

    injectStyles();

    var keys = opts.keys;
    var keyNames = opts.keyNames || { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };
    var DIR_KEYS = [keyNames.up, keyNames.down, keyNames.left, keyNames.right];

    var wrap = document.createElement('div');
    wrap.className = 'touch-controls';
    wrap.setAttribute('data-fs-role', 'controls');
    wrap.innerHTML =
      '<div class="joystick-base" aria-label="' + (opts.moveLabel || 'Move') + '" role="slider" aria-valuetext="Drag to move">' +
        '<div class="joystick-thumb"></div>' +
      '</div>' +
      '<button type="button" class="action-btn" aria-label="' + (opts.actionAriaLabel || opts.actionLabel || 'Action') + '">' +
        (opts.actionIcon || '') +
        (opts.actionLabel || '') +
      '</button>';
    parent.appendChild(wrap);

    var joyBase = wrap.querySelector('.joystick-base');
    var joyThumb = wrap.querySelector('.joystick-thumb');
    var actionBtn = wrap.querySelector('.action-btn');
    var joyPointerId = null;

    function clearDirKeys() {
      for (var i = 0; i < DIR_KEYS.length; i++) keys[DIR_KEYS[i]] = false;
    }

    function updateJoystick(clientX, clientY) {
      var rect = joyBase.getBoundingClientRect();
      var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      var maxDist = rect.width / 2;
      var dx = clientX - cx, dy = clientY - cy;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) { dx = (dx / dist) * maxDist; dy = (dy / dist) * maxDist; dist = maxDist; }
      joyThumb.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';

      clearDirKeys();
      var DEAD_ZONE = 0.25;
      if (dist / maxDist <= DEAD_ZONE) return;

      // Snap to one of 4 cardinal directions based on the 90° quadrant the
      // joystick angle falls in (0° = up), so diagonal drags still only
      // move in a single straight direction, never diagonally.
      var angle = Math.atan2(dx, -dy) * 180 / Math.PI; // 0=up, 90=right, ±180=down, -90=left
      if (angle > -45 && angle <= 45) keys[keyNames.up] = true;
      else if (angle > 45 && angle <= 135) keys[keyNames.right] = true;
      else if (angle > -135 && angle <= -45) keys[keyNames.left] = true;
      else keys[keyNames.down] = true;
    }

    function resetJoystick() {
      joyThumb.style.transform = 'translate(0px, 0px)';
      clearDirKeys();
    }

    joyBase.addEventListener('pointerdown', function (e) {
      // Ignore extra fingers while one pointer is already tracked — otherwise a
      // second touch on the joystick would begin drag-suppression a second time
      // without a matching end, leaking dragDepth and sticking the page-wide
      // block on forever (see beginDragSuppression above).
      if (joyPointerId !== null) return;
      e.preventDefault();
      joyPointerId = e.pointerId;
      joyBase.classList.add('active-touch');
      joyBase.setPointerCapture(joyPointerId);
      beginDragSuppression();
      updateJoystick(e.clientX, e.clientY);
    });
    joyBase.addEventListener('pointermove', function (e) {
      if (e.pointerId !== joyPointerId) return;
      e.preventDefault();
      updateJoystick(e.clientX, e.clientY);
    });
    function endJoystick(e) {
      if (joyPointerId === null || (e && e.pointerId !== joyPointerId)) return;
      joyPointerId = null;
      joyBase.classList.remove('active-touch');
      resetJoystick();
      endDragSuppression();
    }
    joyBase.addEventListener('pointerup', endJoystick);
    joyBase.addEventListener('pointercancel', endJoystick);
    joyBase.addEventListener('pointerleave', endJoystick);

    var actionActive = false;
    function triggerAction(e) {
      // Same guard as the joystick: ignore a second finger landing on an
      // already-held button so begin/end drag-suppression stays balanced.
      if (actionActive) return;
      e.preventDefault();
      actionActive = true;
      actionBtn.classList.add('active-touch');
      beginDragSuppression();
      if (opts.onActionStart) opts.onActionStart();
    }
    function releaseAction(e) {
      if (e) e.preventDefault();
      if (!actionActive) return;
      actionActive = false;
      actionBtn.classList.remove('active-touch');
      endDragSuppression();
      if (opts.onActionEnd) opts.onActionEnd();
    }
    actionBtn.addEventListener('pointerdown', triggerAction);
    actionBtn.addEventListener('pointerup', releaseAction);
    actionBtn.addEventListener('pointercancel', releaseAction);
    actionBtn.addEventListener('pointerleave', releaseAction);

    // Belt-and-suspenders against iOS Safari's long-press text-selection
    // callout (Copy/Look Up/etc.) occasionally slipping through: the
    // contextmenu event is the most direct, reliable way to block it,
    // independent of the CSS/pointer-event prevention above.
    function suppressCallout(e) { e.preventDefault(); }
    joyBase.addEventListener('contextmenu', suppressCallout);
    actionBtn.addEventListener('contextmenu', suppressCallout);

    return { element: wrap };
  }

  return { init: init };
})();
