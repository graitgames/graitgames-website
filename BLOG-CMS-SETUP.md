# 📝 Blog & CMS Setup Guide — GRaiT GAMES

This guide explains **how the GRaiT GAMES blog works**, **which CMS we chose and why**,
and **two ways to add new posts** (a beginner-friendly visual editor, or by hand).

It's written so that a non-developer (or a kid learning to code!) can follow along.

---

## 1. The Big Picture

Our website is a **static site** hosted on **Cloudflare Pages**. There's no
database and no server running our code 24/7 — just plain HTML, CSS, and a few
small JavaScript files. That makes the site **fast, cheap, and secure**.

For the blog we use a **Git-based CMS** called **Decap CMS**. Instead of storing
posts in a database, every blog post is saved as a simple **Markdown file** in
this GitHub repository (`blog/posts/`). When you publish a post, the CMS makes a
**commit to GitHub**, Cloudflare notices the change, and the site rebuilds
automatically. 🎉

```
You write a post in /admin  ──▶  Decap saves a .md file & commits to GitHub
        ▲                                          │
        │                                          ▼
   GitHub login                          Cloudflare Pages auto-deploys
   (via OAuth proxy)                      the updated site
```

---

## 2. Which CMS We Chose — and Why

We compared the popular lightweight options for a static site on Cloudflare Pages:

| CMS | Cost | Hosting fit | Markdown | Ease for non-devs | Notes |
|-----|------|-------------|----------|-------------------|-------|
| **Decap CMS** ✅ (chosen) | **Free / open-source** | Works anywhere static (incl. Cloudflare) | ✅ Yes | ✅ Friendly visual editor | Git-based; needs a tiny OAuth proxy on Cloudflare |
| Netlify CMS | Free | Best on **Netlify only** | ✅ Yes | ✅ | Renamed to **Decap** in 2023 — same project, so we use Decap |
| TinaCMS | Free tier + paid cloud | Good, but heavier | ✅ Yes | ✅ Live visual editing | More setup; React-oriented; can incur cost at scale |
| Forestry.io | — | — | ✅ Yes | ✅ | **Shut down** (became TinaCMS) — not an option |
| Plain Markdown (no CMS) | Free | Perfect | ✅ Yes | ❌ Requires Git/coding | Simplest tech, but not friendly for non-coders |

### Why Decap CMS wins for us
- **Free and open-source** — no monthly fees, no vendor lock-in.
- **Git-based** — posts live in our repo as Markdown. We own everything, and we
  get full version history for free.
- **Static-friendly** — no database or server to maintain; fits Cloudflare Pages.
- **Beginner-friendly editor** — a clean web UI with a rich-text/Markdown editor,
  image uploads, and a publish workflow. Perfect for a father-son team.
- **Markdown** — the same easy format we use everywhere.

### The one catch (and how we solved it)
Decap's easiest login uses *Netlify Identity*, which only works if you host on
Netlify. Since we're on **Cloudflare Pages**, we added a **tiny OAuth proxy**
using **Cloudflare Pages Functions** (`functions/api/auth.js` and
`functions/api/callback.js`). These two small files securely handle "Login with
GitHub" — see setup steps below.

### Pros & Cons summary
**Pros:** free, no lock-in, version-controlled posts, friendly editor, fast site, scales to zero cost.
**Cons:** initial GitHub OAuth setup is a few steps (done once); editors need a GitHub account with access to the repo.

---

## 3. Files in This Repo (what each piece does)

```
admin/
  index.html      ← Loads the Decap CMS editor UI (visit /admin/ on the site)
  config.yml      ← Tells Decap your repo, login method, and post fields
functions/
  api/
    auth.js       ← Cloudflare function: starts "Login with GitHub"
    callback.js   ← Cloudflare function: finishes login, returns the token
blog/
  posts/          ← Your blog posts live here as Markdown (.md) files
  images/         ← Uploaded featured images are committed here
blog.html         ← The public blog listing page (cards grid)
blog-post.html    ← Template showing how a single article looks
```

---

## 4. One-Time Setup (do this once)

You'll need: a GitHub account that can push to `graitgames/graitgames-website`,
and access to the Cloudflare Pages dashboard for the site.

### Step 1 — Create a GitHub OAuth App
1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**.
   (Direct link: <https://github.com/settings/developers>)
2. Fill in:
   - **Application name:** `GRaiT GAMES CMS`
   - **Homepage URL:** `https://graitgames.com`
   - **Authorization callback URL:** `https://graitgames.com/api/callback`
3. Click **Register application**.
4. Copy the **Client ID**. Then click **Generate a new client secret** and copy
   the **Client Secret** (you only see it once!).

### Step 2 — Add the secrets to Cloudflare Pages
1. Open **Cloudflare dashboard → Workers & Pages → your site → Settings →
   Environment variables**.
2. Add two **Production** variables:
   - `GITHUB_CLIENT_ID` = *(the Client ID from Step 1)*
   - `GITHUB_CLIENT_SECRET` = *(the Client Secret — click "Encrypt")*
3. Save and **redeploy** the site (Deployments → Retry/Redeploy) so the
   functions pick up the new variables.

### Step 3 — Confirm the config
Open `admin/config.yml` and make sure:
- `repo:` is `graitgames/graitgames-website`
- `branch:` is `main`
- `base_url:` is `https://graitgames.com`
- `auth_endpoint:` is `/api/auth`

That's it — setup is done. ✅

---

## 5. How to Write a New Blog Post

### Option A — The easy way (visual editor) ⭐ recommended
1. Go to **`https://graitgames.com/admin/`** in your browser.
2. Click **Login with GitHub** and approve access (first time only).
3. Click **Blog Posts → New Blog Post**.
4. Fill in the fields:
   - **Title** — the post headline.
   - **Publish Date** — pick a date.
   - **Category** — Development, AI, Learning, or Updates.
   - **Read Time** — e.g. `5 min read`.
   - **Featured Image** — optional; upload an image.
   - **Excerpt** — 1–2 sentence summary (shown on the blog cards).
   - **Body** — write the post! Use the toolbar for headings, lists, links,
     images, and code blocks.
5. Use **Save** to keep a draft, then **Publish** when ready.
   - Because we use the *editorial workflow*, publishing opens a Pull Request.
     A grown-up can review it, merge it, and Cloudflare deploys it live.

### Option B — By hand (for the coders 👩‍💻)
1. Create a new file in `blog/posts/` named like
   `YYYY-MM-DD-your-title.md`.
2. Start with the "front matter" block (the part between the `---` lines), then
   write your post in Markdown:

   ```markdown
   ---
   title: "My Awesome Post"
   date: 2026-06-10
   category: "Learning"
   readtime: "4 min read"
   image: ""
   excerpt: "A short summary that appears on the blog listing card."
   ---

   ## A heading

   Your paragraphs go here. You can **bold**, _italicise_, add
   [links](https://graitgames.com), bullet lists, and code:

   ```js
   console.log("Hello, GRaiT GAMES!");
   ```
   ```
3. Commit and push to `main`. Cloudflare auto-deploys.

> **Note:** `blog/posts/2026-05-22-building-our-first-game-loop.md` is included
> as a real example you can copy.

---

## 6. Connecting Posts to the Pages (next step / optional)

Right now `blog.html` and `blog-post.html` use **hand-written placeholder
cards** so the design is visible immediately. The Markdown files in
`blog/posts/` are the *source of truth* the CMS edits.

To make the listing render automatically from those Markdown files, you can
later add a tiny build step or a small JS loader. Good options:
- A simple **build script** (Node) that turns each `.md` into a card / page, or
- A static-site generator (e.g. **Eleventy**) wired into the Cloudflare build.

This is intentionally left as a clear, separate upgrade so the site keeps
working with zero build tooling today.

---

## 7. Troubleshooting

- **"Login with GitHub" does nothing / popup closes** → Check the OAuth App's
  **callback URL** is exactly `https://graitgames.com/api/callback`, and that
  `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` are set in Cloudflare and the site
  was redeployed.
- **"Error: Failed to load config.yml"** → Make sure `admin/config.yml` exists
  and is valid YAML (indentation matters!).
- **Changes don't appear** → Confirm the post was merged to `main` and that
  Cloudflare finished the deployment (check the Deployments tab).

---

## 8. Handy Links
- Decap CMS docs: <https://decapcms.org/docs/>
- GitHub backend: <https://decapcms.org/docs/github-backend/>
- External OAuth clients: <https://decapcms.org/docs/external-oauth-clients/>
- Cloudflare Pages Functions: <https://developers.cloudflare.com/pages/functions/>

Happy writing! ✍️🎮
