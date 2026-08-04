# graitgames-website

Repository for the **GRaiT GAMES** website ([www.graitgames.com](https://www.graitgames.com)) —
a father-and-son project building browser-based games and learning to code together.

A **static site** (HTML + CSS + vanilla JS) hosted on **Cloudflare Pages**, which
auto-deploys on every push to `main`.

## Project structure

```
Pages
  index.html              Home / Coming Soon
  games.html              Game catalog (sidebar + filterable card grid)
  about.html              About the project
  blog.html               Blog listing (post cards)
  blog-post.html          Single-article template
  privacy-policy.html     Privacy Policy
  terms.html              Terms & Conditions
  newsletter-confirm.html Post-subscribe landing (MailerLite redirects here)

Site-wide styles + scripts
  styles.css              Master design system (synthwave / retro-futuristic)
  nav.js                  Injected responsive navigation header
  footer.js               Injected site footer
  home.js                 Starfield background animation on the home page
  games.js                Game catalog filtering + mobile sidebar

Shared game components (used by /games/*.html)
  leaderboard.js          Monthly Top-10 leaderboard widget
  game-fullscreen.js      Mobile fullscreen shell
  game-over-card.js       Game-over popup with Top 3 board
  touch-joystick.js       Drag joystick + action button (mobile)
  pause-button.js         Shared pause button

Content + backend
  games/                  Individual playable game HTML files
  blog/posts/             Blog posts as Markdown (.md) files
  blog/images/            Uploaded blog images
  admin/                  Decap CMS editor (config.yml + index.html)
  functions/api/          Cloudflare Pages Functions:
                            auth.js + callback.js — GitHub OAuth proxy for the CMS
                            scores.js             — GET the leaderboard for a game
                            submit-score.js       — POST a new score (with per-game caps)

Cloudflare config
  _headers                Cache-control rules for shared JS / assets
```

## Brand quick reference
- **Colours:** Orange `#FF6B2B`, Neon Green `#39FF14`; backgrounds Space Black
  `#07070F` and Deep Space `#0D0D1A`.
- **Fonts:** Press Start 2P (logo), Orbitron (headlines), Rajdhani (body),
  Share Tech Mono (UI/technical).
- **Logo:** "GR" and "T" are orange; "ai" and "GAMES" are green.
- **Accessibility:** target WCAG 2.1 AA (high contrast; glow is decorative only).

## ✍️ Adding new blog posts

You have two options — full details in **[BLOG-CMS-SETUP.md](./BLOG-CMS-SETUP.md)**.

**Option A — Visual editor (recommended for non-coders):**
1. Visit `https://graitgames.com/admin/`.
2. Log in with GitHub.
3. **Blog Posts → New Blog Post**, fill in the fields, and **Publish**.

**Option B — By hand:**

This is a **static site with no build step**, so a Markdown file on its own
doesn't publish a post. Each post needs three things — full walkthrough in
**[BLOG-CMS-SETUP.md §6](./BLOG-CMS-SETUP.md#6-connecting-posts-to-the-pages)**:

1. **A Markdown source** at `blog/posts/YYYY-MM-DD-your-title.md` (front
   matter + body — see the template in BLOG-CMS-SETUP.md §5 Option B).
2. **A rendered page** at `blog/your-title.html`, created by copying the
   `blog-post.html` template and replacing the `[PLACEHOLDER]` fields.
3. **A card** added to the grid in `blog.html` linking to the new page.

Commit and push all three files together; Cloudflare auto-deploys.

## See also — the rest of the docs

- **[CLAUDE.md](./CLAUDE.md)** — instructions for anyone (human or AI) working
  in this repo: where files live, which guide to read for each task, and the
  site-wide conventions worth knowing.
- **[GAME-CATALOG-MANAGEMENT-GUIDE.md](./GAME-CATALOG-MANAGEMENT-GUIDE.md)** —
  how to add, remove, reorder, or re-categorize games on the catalog page.
- **[BLOG-CMS-SETUP.md](./BLOG-CMS-SETUP.md)** — how the Decap CMS is set up
  and how to write / publish blog posts (visual editor or by hand).
- **[DECAP-CMS-TROUBLESHOOTING.md](./DECAP-CMS-TROUBLESHOOTING.md)** — first
  stop when `/admin/` login is broken.
- **New-game starter prompts** (paste into a Claude Artifacts chat to prototype
  a new game, then follow the integration checklist to wire it into the site):
    - **[NEW_GAME_STARTER.md](./NEW_GAME_STARTER.md)** — puzzle / turn-based /
      anything without a leaderboard or joystick.
    - **[LEADERBOARD_JOYSTICK_GAME_STARTER.md](./LEADERBOARD_JOYSTICK_GAME_STARTER.md)** —
      continuous-movement games with a monthly leaderboard + mobile touch joystick
      (Save My Chicks, Gnome Crawler archetype).
    - **[WORD_KEYBOARD_GAME_STARTER.md](./WORD_KEYBOARD_GAME_STARTER.md)** —
      on-screen-keyboard word games (4ordle, Fix My 4ordle archetype).

## Local preview

Serve the folder with any static server, e.g.:

```bash
python3 -m http.server 3000
# then open http://localhost:3000
```

> The CMS login (`/admin/`) and the `functions/api/*` OAuth proxy only run on
> the deployed Cloudflare Pages site, not via a plain local static server.
