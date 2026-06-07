# graitgames-website

Repository for the **GRaiT GAMES** website ([www.graitgames.com](https://www.graitgames.com)) —
a father-and-son project building browser-based games and learning to code together.

A **static site** (HTML + CSS + vanilla JS) hosted on **Cloudflare Pages**, which
auto-deploys on every push to `main`.

## Project structure

```
index.html            Home / Coming Soon
games.html            Game catalog (sidebar + filterable card grid)
about.html            About the project
blog.html             Blog listing (post cards)
blog-post.html        Single-article template
privacy-policy.html   Privacy Policy
terms.html            Terms & Conditions

styles.css            Master design system (synthwave / retro-futuristic)
nav.js                Injected responsive navigation header
footer.js             Injected site footer
games.js              Game catalog filtering + mobile sidebar

admin/                Decap CMS editor (config.yml + index.html)
functions/api/        Cloudflare Pages Functions — GitHub OAuth proxy for the CMS
blog/posts/           Blog posts as Markdown (.md) files
blog/images/          Uploaded blog images
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
1. Add a file to `blog/posts/` named `YYYY-MM-DD-your-title.md`.
2. Include the front matter (title, date, category, readtime, image, excerpt)
   then write the body in Markdown. Copy
   `blog/posts/2026-05-22-building-our-first-game-loop.md` as a starting point.
3. Commit and push to `main`; Cloudflare auto-deploys.

## Local preview

Serve the folder with any static server, e.g.:

```bash
python3 -m http.server 3000
# then open http://localhost:3000
```

> The CMS login (`/admin/`) and the `functions/api/*` OAuth proxy only run on
> the deployed Cloudflare Pages site, not via a plain local static server.
