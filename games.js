/* ============================================================================
   GRaiT GAMES — GAME CATALOG SCRIPT (games.js)
   ----------------------------------------------------------------------------
   Powers the Game Catalog page (games.html). It does three jobs:

     1. CATEGORY FILTERING
        Click a category in the sidebar → only matching game cards show.
        "All Games" shows everything.

     2. CATEGORY COUNTS
        Counts how many cards belong to each category and prints the number
        in the little badge next to each sidebar button.

     3. MOBILE SIDEBAR DRAWER
        On phones the sidebar is hidden off-screen. A "Browse Categories"
        button slides it in; a backdrop (or Escape / picking a category)
        slides it back out.

   This file is written to be beginner-friendly — lots of comments, plain
   functions, no frameworks. It mirrors the IIFE pattern used in nav.js so it
   never leaks variables into the global scope.
   ============================================================================ */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     0. WAIT FOR THE DOM
        nav.js may inject elements, but the catalog markup lives directly in
        games.html, so we just wait until the document is ready.
     -------------------------------------------------------------------------- */
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {

    /* ------------------------------------------------------------------------
       1. GRAB THE ELEMENTS WE NEED
       ------------------------------------------------------------------------ */
    var categoryButtons = Array.prototype.slice.call(
      document.querySelectorAll('.category-btn')
    );
    var gameCards = Array.prototype.slice.call(
      document.querySelectorAll('.game-card')
    );

    var resultsCount   = document.getElementById('results-count');
    var activeLabel    = document.getElementById('active-category-label');
    var emptyState     = document.getElementById('catalog-empty');

    /* Mobile drawer elements */
    var sidebar        = document.getElementById('catalog-sidebar');
    var sidebarToggle  = document.getElementById('sidebar-toggle');
    var backdrop       = document.getElementById('catalog-backdrop');

    /* Safety check: if the core pieces are missing, do nothing. */
    if (!categoryButtons.length || !gameCards.length) return;

    /* ------------------------------------------------------------------------
       2. COUNT GAMES PER CATEGORY
          We loop over every card, read its data-category, and tally it.
          The "all" count is simply the total number of cards.
       ------------------------------------------------------------------------ */
    function updateCategoryCounts() {
      var counts = { all: gameCards.length };

      gameCards.forEach(function (card) {
        var cat = card.getAttribute('data-category');
        if (!cat) return;
        counts[cat] = (counts[cat] || 0) + 1;
      });

      /* Write each tally into its badge (data-count="puzzle", etc.) */
      Object.keys(counts).forEach(function (cat) {
        var badge = document.querySelector('.category-count[data-count="' + cat + '"]');
        if (badge) badge.textContent = counts[cat];
      });
    }

    /* ------------------------------------------------------------------------
       3. FILTER THE GAMES BY CATEGORY
          • "all"  → show every card
          • other  → show only cards whose data-category matches
          We also update the results bar and toggle the empty-state message.
       ------------------------------------------------------------------------ */
    function filterGames(category, label) {
      var visibleCount = 0;

      gameCards.forEach(function (card) {
        var matches = (category === 'all') ||
                      (card.getAttribute('data-category') === category);

        /* .hidden is a utility class in styles.css (display:none !important) */
        if (matches) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      /* Update the "Showing: X" label and the live count */
      if (activeLabel) activeLabel.textContent = label;
      if (resultsCount) {
        resultsCount.textContent =
          visibleCount + (visibleCount === 1 ? ' game' : ' games');
      }

      /* Show a friendly message if a category has no games yet */
      if (emptyState) {
        emptyState.classList.toggle('hidden', visibleCount !== 0);
      }
    }

    /* ------------------------------------------------------------------------
       4. HANDLE A CATEGORY CLICK
          Updates the active styling + ARIA, then runs the filter.
       ------------------------------------------------------------------------ */
    function selectCategory(button) {
      var category = button.getAttribute('data-category');
      /* The visible label is the button text without the count badge */
      var label = button.textContent.replace(/\s*\d+\s*$/, '').trim();

      /* Move the .active flag (and aria-pressed) to the clicked button */
      categoryButtons.forEach(function (btn) {
        var isActive = (btn === button);
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      filterGames(category, label);

      /* On mobile, picking a category should close the drawer */
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    }

    /* Wire up a click handler on each category button */
    categoryButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectCategory(button);
      });
    });

    /* ------------------------------------------------------------------------
       5. MOBILE SIDEBAR DRAWER (open / close)
       ------------------------------------------------------------------------ */
    function openSidebar() {
      if (!sidebar) return;
      sidebar.classList.add('active');
      if (backdrop) {
        backdrop.hidden = false;
        backdrop.classList.add('active');
      }
      if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'true');
      /* Lock background scrolling while the drawer is open */
      document.body.classList.add('nav-open');
    }

    function closeSidebar() {
      if (!sidebar) return;
      sidebar.classList.remove('active');
      if (backdrop) {
        backdrop.classList.remove('active');
        backdrop.hidden = true;
      }
      if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }

    /* Toggle button (only visible on mobile via CSS) */
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function () {
        if (sidebar.classList.contains('active')) {
          closeSidebar();
        } else {
          openSidebar();
        }
      });
    }

    /* Click the dark backdrop to close the drawer */
    if (backdrop) {
      backdrop.addEventListener('click', closeSidebar);
    }

    /* Press Escape to close the drawer */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
        closeSidebar();
        if (sidebarToggle) sidebarToggle.focus();
      }
    });

    /* If the user resizes up to desktop, make sure the drawer state resets
       so the sidebar isn't accidentally stuck "open" or scroll-locked. */
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        if (window.innerWidth > 768) closeSidebar();
      }, 120);
    });

    /* ------------------------------------------------------------------------
       6. INITIALISE
          Fill in the counts and show all games on first load.
       ------------------------------------------------------------------------ */
    updateCategoryCounts();
    filterGames('all', 'All Games');
  });
})();
