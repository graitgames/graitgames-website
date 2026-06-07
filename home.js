/* ============================================================================
   GRaiT GAMES — HOMEPAGE BACKGROUND FX (home.js)
   ----------------------------------------------------------------------------
   Draws the decorative synthwave starfield behind the "Coming Soon" hero:
   drifting stars, glowing neon particles, and occasional shooting stars.

   This is PURELY DECORATIVE. The canvas is aria-hidden and pointer-events:none
   (set in styles.css → Section 21), so it never interferes with content,
   keyboard users, or screen readers.

   USAGE
   -----
   1. Add the canvas element somewhere in the page:
        <canvas id="bg-canvas" class="fx-starfield" aria-hidden="true"></canvas>
   2. Include this script before </body>:
        <script src="home.js"></script>

   ACCESSIBILITY
   -------------
   If the visitor prefers reduced motion, we skip the animation entirely and
   leave a calm static background (the CSS .fx-grid / body colour handle the
   rest), respecting their system setting.
   ============================================================================ */

(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  if (!canvas || !canvas.getContext) return;  // nothing to do / not supported

  /* Respect the user's "reduce motion" preference — no animation loop. */
  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  var ctx = canvas.getContext('2d');

  /* --------------------------------------------------------------------------
     1. SIZE THE CANVAS TO THE WINDOW (and keep it in sync on resize)
     -------------------------------------------------------------------------- */
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  /* Debounce resize so we don't thrash while the window is being dragged */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  /* --------------------------------------------------------------------------
     2. CREATE THE ELEMENTS WE'LL ANIMATE
     -------------------------------------------------------------------------- */

  /* White twinkling stars that gently fall */
  var NUM_STARS = 160;
  var stars = Array.from({ length: NUM_STARS }, function () {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.2,
      speed: Math.random() * 0.25 + 0.05,
      alpha: Math.random() * 0.7 + 0.2
    };
  });

  /* Glowing neon particles drifting in brand colours */
  var COLORS = ['#39FF14', '#FF6B2B', '#00FFFF', '#FF8C42', '#00FF88'];
  var NUM_PARTICLES = 55;
  var particles = Array.from({ length: NUM_PARTICLES }, function () {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.8 + 0.5,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2
    };
  });

  /* Shooting stars are spawned periodically and fade out */
  var shooters = [];
  function spawnShooter() {
    shooters.push({
      x: Math.random() * canvas.width,
      y: 0,
      len: Math.random() * 80 + 40,
      speed: Math.random() * 6 + 4,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      alpha: 1,
      color: Math.random() > 0.5 ? '#39FF14' : '#FF6B2B'
    });
  }
  var shooterInterval = setInterval(spawnShooter, 2200);

  /* --------------------------------------------------------------------------
     3. THE DRAW LOOP
     -------------------------------------------------------------------------- */
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Soft radial background wash (centre slightly lighter than edges) */
    var grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.8
    );
    grad.addColorStop(0, 'rgba(10, 10, 30, 0.8)');
    grad.addColorStop(1, 'rgba(7, 7, 15, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Falling stars */
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.y += s.speed;
      if (s.y > canvas.height) {
        s.y = 0;
        s.x = Math.random() * canvas.width;
      }
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* Glowing neon particles (wrap around the edges) */
    for (var j = 0; j < particles.length; j++) {
      var p = particles[j];
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.025;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      var a = (Math.sin(p.pulse) * 0.3 + 0.7) * p.alpha;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /* Shooting stars (remove ones that have faded out) */
    shooters = shooters.filter(function (sh) { return sh.alpha > 0.01; });
    for (var k = 0; k < shooters.length; k++) {
      var sh = shooters[k];
      sh.x += Math.cos(sh.angle) * sh.speed;
      sh.y += Math.sin(sh.angle) * sh.speed;
      sh.alpha *= 0.96;
      ctx.save();
      ctx.globalAlpha = sh.alpha;
      ctx.strokeStyle = sh.color;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = sh.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(
        sh.x - Math.cos(sh.angle) * sh.len,
        sh.y - Math.sin(sh.angle) * sh.len
      );
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(draw);
  }

  draw();

  /* Tidy up the spawner if the page is ever torn down (good hygiene). */
  window.addEventListener('beforeunload', function () {
    clearInterval(shooterInterval);
  });
})();
