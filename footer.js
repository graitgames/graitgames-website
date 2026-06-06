(function () {
  /* ── Google Fonts (load only once) ── */
  if (!document.querySelector('link[href*="Press+Start+2P"]')) {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }

  /* ── Styles ── */
  const css = `
    #grait-footer {
      position: relative;
      background: #0a0a0f;
      border-top: 2px solid #39ff14;
      box-shadow: 0 -4px 24px rgba(57,255,20,.18);
      padding: 2.8rem 1.5rem 2rem;
      font-family: 'Rajdhani', sans-serif;
      color: #e8e8f0;
      overflow: hidden;
    }

    /* scanline overlay */
    #grait-footer::before {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 3px,
        rgba(0,0,0,.12) 3px,
        rgba(0,0,0,.12) 4px
      );
      pointer-events: none;
      z-index: 0;
    }

    #grait-footer > * { position: relative; z-index: 1; }

    /* ── NEWSLETTER ROW ── */
    .gf-newsletter {
      text-align: center;
      padding-bottom: 2rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid rgba(57,255,20,0.2);
    }
    .gf-newsletter-label {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.6rem;
      color: #ff6b1a;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    .gf-inner {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 1.5rem 2rem;
    }

    /* brand */
    .gf-brand { justify-self: start; }
    .gf-logo {
      font-family: 'Press Start 2P', monospace;
      font-size: clamp(.6rem, 2vw, .85rem);
      color: #e8e8f0;
      letter-spacing: .04em;
      line-height: 1.6;
      display: block;
      text-decoration: none;
    }
    .gf-logo .logo-orange {
      color: #ff6b1a;
      font-style: normal;
      text-shadow: 0 0 8px #ff6b1a, 0 0 24px rgba(255,107,26,.4);
    }
    .gf-logo .logo-green {
      color: #39ff14;
      font-style: normal;
      text-shadow: 0 0 8px #39ff14, 0 0 24px rgba(57,255,20,.4);
    }
    .gf-copy {
      font-family: 'Share Tech Mono', monospace;
      font-size: .7rem;
      color: #7a7a9a;
      margin-top: .55rem;
    }

    /* nav links — centre column */
    .gf-nav {
      justify-self: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: .55rem;
    }
    .gf-nav a {
      font-family: 'Share Tech Mono', monospace;
      font-size: .78rem;
      color: #00eaff;
      text-decoration: none;
      border-bottom: 1px solid rgba(0,234,255,.25);
      padding-bottom: .1rem;
      letter-spacing: .06em;
      transition: color .2s, border-color .2s, text-shadow .2s;
    }
    .gf-nav a:hover {
      color: #fff;
      border-color: #00eaff;
      text-shadow: 0 0 8px #00eaff;
    }

    /* socials — right column */
    .gf-socials {
      justify-self: end;
      display: flex;
      gap: .9rem;
      align-items: center;
    }
    .gf-socials a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #1e1e30;
      background: rgba(57,255,20,.04);
      color: #7a7a9a;
      text-decoration: none;
      transition: border-color .2s, color .2s, box-shadow .2s, background .2s;
    }
    .gf-socials a:hover {
      border-color: #39ff14;
      color: #39ff14;
      background: rgba(57,255,20,.1);
      box-shadow: 0 0 10px rgba(57,255,20,.3);
    }
    .gf-socials svg {
      width: 16px;
      height: 16px;
      fill: currentColor;
    }

    /* mobile */
    @media (max-width: 640px) {
      .gf-inner {
        grid-template-columns: 1fr;
        justify-items: center;
        text-align: center;
      }
      .gf-brand { justify-self: center; text-align: center; }
      .gf-socials { justify-self: center; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  /* ── SVG icons ── */
  const icons = {
    youtube:   `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.2 4.8 1.7 5 5 .1 1.3.1 1.6.1 4.9s0 3.6-.1 4.9c-.2 3.3-1.7 4.8-5 5-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.2-4.8-1.7-5-5C2 16.6 2 16.3 2 12s0-3.6.1-4.9c.2-3.3 1.7-4.8 5-5C8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1.0 8.3 0 8.7 0 12s0 3.7.1 4.9C.3 21.3 2.7 23.7 7.1 23.9 8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9C23.7 2.7 21.3.3 16.9.1 15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4A6.2 6.2 0 0 0 12 5.8zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z"/></svg>`,
    x:         `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.9 1h3.7l-8 9.2L24 23h-7.4l-5.8-7.5L4.5 23H.8l8.6-9.8L0 1h7.6l5.2 6.9L18.9 1zm-1.3 19.8h2L6.5 3.1H4.3l13.3 17.7z"/></svg>`,
    tiktok:    `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.6 8.6a7.6 7.6 0 0 1-4.4-1.4v6.4a6.2 6.2 0 1 1-6.2-6.2c.2 0 .4 0 .6.0v3.1a3.1 3.1 0 1 0 2.6 3v-13h3c.3 2.5 2.3 4.5 4.8 4.8v3.3h-.4z"/></svg>`,
  };

  /* ── Build footer ── */
  const year = new Date().getFullYear();

  const footer = document.createElement('footer');
  footer.id = 'grait-footer';

  /* Newsletter row */
  const newsletterRow = document.createElement('div');
  newsletterRow.className = 'gf-newsletter';

  const newsletterLabel = document.createElement('div');
  newsletterLabel.className = 'gf-newsletter-label';
  newsletterLabel.textContent = '// Get Early Access //';

  /* Beehiiv script — data-beehiiv-form must be on the script tag itself */
  const beehiivScript = document.createElement('script');
  beehiivScript.src = 'https://subscribe-forms.beehiiv.com/v3/loader.js';
  beehiivScript.async = true;
  beehiivScript.setAttribute('data-beehiiv-form', 'e76eeefb-b363-4f57-ab70-82e508f70d49');

  newsletterRow.appendChild(newsletterLabel);
  newsletterRow.appendChild(beehiivScript);

  /* Bottom row: brand / nav / socials */
  const inner = document.createElement('div');
  inner.className = 'gf-inner';
  inner.innerHTML = `
    <div class="gf-brand">
      <a class="gf-logo" href="/"><span class="logo-orange">GR</span><span class="logo-green">ai</span><span class="logo-orange">T</span><span class="logo-green"> GAMES</span></a>
      <div class="gf-copy">© ${year} GRaiT GAMES. All Rights Reserved.</div>
    </div>

    <nav class="gf-nav" aria-label="Footer navigation">
      <a href="/privacy-policy.html">Privacy Policy</a>
      <a href="/terms.html">Terms &amp; Conditions</a>
    </nav>

    <div class="gf-socials" aria-label="Social media links">
      <a href="https://youtube.com/@graitgames"  target="_blank" rel="noopener" aria-label="YouTube">${icons.youtube}</a>
      <a href="https://instagram.com/graitgames" target="_blank" rel="noopener" aria-label="Instagram">${icons.instagram}</a>
      <a href="https://x.com/graitgames"         target="_blank" rel="noopener" aria-label="X">${icons.x}</a>
      <a href="https://tiktok.com/@graitgames"   target="_blank" rel="noopener" aria-label="TikTok">${icons.tiktok}</a>
    </div>
  `;

  footer.appendChild(newsletterRow);
  footer.appendChild(inner);

  document.body.appendChild(footer);
})();
