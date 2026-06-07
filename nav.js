/* ============================================================================
   GRaiT GAMES — RESPONSIVE NAVIGATION COMPONENT (nav.js)
   ----------------------------------------------------------------------------
   Self-contained, drop-in navigation menu (mirrors the footer.js pattern).

   USAGE
   -----
   1. Make sure the page links the master stylesheet:
        <link rel="stylesheet" href="styles.css" />
   2. (Optional) Add a placeholder where the nav should be injected:
        <nav id="main-nav"></nav>
      If the placeholder is omitted, the nav is injected as the first child
      of <body> automatically.
   3. Include this script (anywhere, but typically before </body>):
        <script src="nav.js"></script>

   STYLING
   -------
   This component reuses the navigation classes already defined in
   styles.css → "13. NAVIGATION STYLES":
        .navbar, .navbar-container, .navbar-logo,
        .nav-menu, .nav-link, .nav-link.active, .nav-toggle
   and the mobile @media (max-width: 768px) rules.

   ⚠️ SUPPLEMENTAL STYLES NOTE (candidates to migrate into styles.css):
   The base stylesheet's `.nav-toggle` only defines a bordered box — it has no
   actual hamburger "bars". The small <style> block injected below adds:
        • .nav-toggle hamburger bars (3 lines) + open/close (X) animation
        • .nav-cta  — Newsletter call-to-action button spacing inside the menu
        • a body scroll-lock helper class used when the mobile menu is open
   If/when these are added to styles.css (Section 13), the injected <style>
   block here can be safely removed.
   ============================================================================ */

(function () {
  'use strict';

  /* Guard: never inject twice (e.g. if script is included on the page twice) */
  if (document.getElementById('grait-navbar')) return;

  /* --------------------------------------------------------------------------
     1. SUPPLEMENTAL STYLES (not present in styles.css yet — see note above)
     -------------------------------------------------------------------------- */
  if (!document.getElementById('grait-nav-supplemental-styles')) {
    var css = `
      /* Logo: remove the base .navbar-logo glow so it matches the page titles
         (brand colours come from .text-orange / .text-green in styles.css). */
      #grait-navbar .navbar-logo { text-shadow: none; }
      #grait-navbar .navbar-logo:hover { text-shadow: none; }

      /* --- Hamburger icon bars (styles.css .nav-toggle only draws the box) --- */
      #grait-navbar .nav-toggle {
        position: relative;
        width: 46px;
        height: 42px;
      }
      #grait-navbar .nav-toggle .nav-toggle-bar,
      #grait-navbar .nav-toggle .nav-toggle-bar::before,
      #grait-navbar .nav-toggle .nav-toggle-bar::after {
        content: '';
        position: absolute;
        left: 50%;
        width: 22px;
        height: 2px;
        background: currentColor;
        border-radius: 2px;
        transform: translateX(-50%);
        transition: transform 0.25s ease, opacity 0.2s ease, background 0.2s ease;
      }
      #grait-navbar .nav-toggle .nav-toggle-bar        { top: 50%; margin-top: -1px; }
      #grait-navbar .nav-toggle .nav-toggle-bar::before { top: -7px; }
      #grait-navbar .nav-toggle .nav-toggle-bar::after  { top:  7px; }

      /* Animate to an "X" when the menu is open */
      #grait-navbar .nav-toggle[aria-expanded="true"] .nav-toggle-bar {
        background: transparent;
      }
      #grait-navbar .nav-toggle[aria-expanded="true"] .nav-toggle-bar::before {
        top: 0; transform: translateX(-50%) rotate(45deg);
      }
      #grait-navbar .nav-toggle[aria-expanded="true"] .nav-toggle-bar::after {
        top: 0; transform: translateX(-50%) rotate(-45deg);
      }

      /* --- Newsletter CTA button inside the nav --- */
      #grait-navbar .nav-cta {
        margin-left: var(--space-sm, 0.5rem);
        white-space: nowrap;
      }

      /* On mobile the CTA should stretch full width inside the dropdown */
      @media (max-width: 768px) {
        #grait-navbar .nav-cta {
          margin-left: 0;
          width: 100%;
        }
      }

      /* Prevent background scroll while the mobile menu is open */
      body.nav-open { overflow: hidden; }
    `;
    var styleEl = document.createElement('style');
    styleEl.id = 'grait-nav-supplemental-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  /* --------------------------------------------------------------------------
     2. NAV LINK DATA
     -------------------------------------------------------------------------- */
  var links = [
    { label: 'Home',  href: 'index.html' },
    { label: 'Games', href: 'games.html' },
    { label: 'About', href: '#' },
    { label: 'Blog',  href: '#' }
  ];

  /* Resolve the current page so we can flag the active link */
  var currentPath = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

  var linksHTML = links.map(function (link) {
    var target = link.href.split('/').pop().toLowerCase();
    var isActive = target !== '#' && target === currentPath;
    return (
      '<li role="none">' +
        '<a role="menuitem" class="nav-link' + (isActive ? ' active' : '') + '" ' +
           'href="' + link.href + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
           link.label +
        '</a>' +
      '</li>'
    );
  }).join('');

  /* --------------------------------------------------------------------------
     3. BUILD NAVBAR MARKUP
        Reuses styles.css classes: .navbar, .navbar-container, .navbar-logo,
        .nav-menu, .nav-link, .nav-toggle  + .btn .btn-primary for the CTA.
     -------------------------------------------------------------------------- */
  var navbar = document.createElement('header');
  navbar.id = 'grait-navbar';
  navbar.className = 'navbar';
  navbar.innerHTML =
    '<div class="navbar-container">' +

      /* Logo (left) */
      '<a class="navbar-logo" href="index.html" aria-label="GRaiT GAMES home">' +
        '<span class="text-orange">GR</span>' +
        '<span class="text-green">ai</span>' +
        '<span class="text-orange">T</span>' +
        '<span class="text-green"> GAMES</span>' +
      '</a>' +

      /* Hamburger toggle (mobile only — hidden on desktop via styles.css) */
      '<button class="nav-toggle" type="button" ' +
              'aria-label="Toggle navigation menu" ' +
              'aria-expanded="false" aria-controls="grait-nav-menu">' +
        '<span class="nav-toggle-bar" aria-hidden="true"></span>' +
        '<span class="sr-only">Menu</span>' +
      '</button>' +

      /* Menu (right) */
      '<ul class="nav-menu" id="grait-nav-menu" role="menubar" aria-label="Main navigation">' +
        linksHTML +
        '<li role="none">' +
          '<a role="menuitem" class="btn btn-primary nav-cta" href="#newsletter">Newsletter</a>' +
        '</li>' +
      '</ul>' +

    '</div>';

  /* --------------------------------------------------------------------------
     4. INJECT INTO PAGE
        Prefer an existing placeholder (<nav id="main-nav"> or #grait-nav-mount);
        otherwise insert as the first element inside <body>.
     -------------------------------------------------------------------------- */
  var mount = document.getElementById('main-nav') ||
              document.getElementById('grait-nav-mount');

  if (mount) {
    mount.replaceWith(navbar);
  } else {
    document.body.insertBefore(navbar, document.body.firstChild);
  }

  /* --------------------------------------------------------------------------
     5. MOBILE TOGGLE + ACCESSIBILITY BEHAVIOUR
     -------------------------------------------------------------------------- */
  var toggle = navbar.querySelector('.nav-toggle');
  var menu   = navbar.querySelector('.nav-menu');

  function openMenu() {
    menu.classList.add('active');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  }

  function closeMenu() {
    menu.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  }

  function toggleMenu() {
    if (menu.classList.contains('active')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  /* Click / tap the hamburger */
  toggle.addEventListener('click', toggleMenu);

  /* Close the menu after selecting a link (mobile) */
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  /* Keyboard: Escape closes the menu and returns focus to the toggle */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* Click outside the navbar closes an open mobile menu */
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('active') && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  /* Reset state when resizing up to desktop so the menu isn't stuck hidden */
  var DESKTOP_BP = 768;
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth > DESKTOP_BP) closeMenu();
    }, 120);
  });
})();
