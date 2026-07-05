/* ============================================================================
   GAME-FULLSCREEN.JS — shared mobile fullscreen helper for game pages
   ----------------------------------------------------------------------------
   On mobile viewports, games default to a fullscreen mode entered on the same
   tap that starts the game (browsers require a real user gesture to grant
   fullscreen, so it can't happen before that). Requests the native Fullscreen
   API on the given element; if that's unavailable (older iOS Safari has
   limited support for fullscreening arbitrary elements), falls back to a
   CSS-only "pseudo-fullscreen" mode that covers the viewport instead.

   Either way, the element gets an `is-mobile-fullscreen` class while active,
   which styles.css uses to lay out every game's header/stats/bar/stage/
   controls the same way (see "GAME PAGE COMPONENTS" in styles.css).

   Usage:
     var fs = GameFullscreen.init({
       el: 'game',            // element id or reference to fullscreen
       enabled: MOBILE_FULLSCREEN,   // per-game opt-out flag
       onChange: resizeCanvas        // called whenever fullscreen state changes
     });
     // later, inside a real click handler (e.g. the Start Game button):
     if (fs) fs.enter();
   ============================================================================ */

var GameFullscreen = (function () {
  'use strict';

  function isMobileViewport() {
    return window.matchMedia('(pointer: coarse), (max-width: 820px)').matches;
  }

  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  function requestFs(el) {
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); return Promise.resolve(); }
    return Promise.reject(new Error('Fullscreen API unavailable'));
  }

  function init(opts) {
    var el = typeof opts.el === 'string' ? document.getElementById(opts.el) : opts.el;
    if (!el || opts.enabled === false || !isMobileViewport()) return null;

    function isActive() {
      return fsElement() === el || el.classList.contains('pseudo-fullscreen');
    }

    // The pseudo-fullscreen fallback only makes #game position:fixed — the
    // real <body> underneath stays fully scrollable. On iOS Safari that's a
    // known source of long-session drift: each time the on-screen keyboard
    // shows/hides (e.g. entering leaderboard initials), the browser's
    // scroll-into-view behavior can nudge the underlying page, and after
    // enough cycles the accumulated drift throws off touch/selection
    // targeting and keyboard focus (matches "works fine in a fresh private
    // window" — zero accumulated drift there). Locking body scroll while
    // fullscreen is active prevents it from ever drifting in the first
    // place, native Fullscreen API included (harmless there either way).
    var scrollY = 0;
    var bodyLocked = false;
    function lockBodyScroll() {
      if (bodyLocked) return; // sync() can re-fire while already active (e.g. orientationchange) — don't recapture scrollY as 0 once body is already fixed
      bodyLocked = true;
      scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollY + 'px';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    }
    function unlockBodyScroll() {
      if (!bodyLocked) return;
      bodyLocked = false;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    }

    function sync() {
      var active = isActive();
      el.classList.toggle('is-mobile-fullscreen', active);
      if (active) lockBodyScroll(); else unlockBodyScroll();
      if (opts.onChange) opts.onChange(active);
    }

    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    window.addEventListener('orientationchange', function () { setTimeout(sync, 200); });

    // The pseudo-fullscreen fallback is just a CSS overlay on the same page,
    // so — unlike real Fullscreen API mode, which browsers already back out
    // of on their own — a phone's back button/gesture would otherwise skip
    // straight past it to whatever page the player was on before (e.g. the
    // catalog), instead of returning to this game. Pushing a history entry
    // when the fallback engages means that first back press pops just that
    // entry (caught below, and used to drop pseudo-fullscreen and stay on
    // this page); only a second back press actually leaves the game.
    window.addEventListener('popstate', function () {
      if (el.classList.contains('pseudo-fullscreen')) {
        el.classList.remove('pseudo-fullscreen');
        sync();
      }
    });

    function fallback() {
      // Fullscreen API missing, rejected (e.g. iOS Safari), or hung without
      // ever resolving/rejecting (seen on some locked-down browsers) — fall
      // back to a fixed-position overlay that covers the viewport instead.
      el.classList.add('pseudo-fullscreen');
      history.pushState({ gameFullscreen: true }, '');
      sync();
    }

    return {
      enter: function () {
        if (isActive()) return;
        var timedOut = false;
        var timer = setTimeout(function () { timedOut = true; fallback(); }, 1500);
        requestFs(el).then(function () {
          if (timedOut) return;
          clearTimeout(timer);
          sync();
        }).catch(function () {
          if (timedOut) return;
          clearTimeout(timer);
          fallback();
        });
      }
    };
  }

  return { init: init, isMobileViewport: isMobileViewport };
})();
