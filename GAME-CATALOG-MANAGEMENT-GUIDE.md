# 🎮 GRaiT GAMES — Game Catalog Management Guide

> **Welcome, Game Builders!** This guide will walk you through everything you
> need to manage the Game Catalog on [graitgames.com](https://www.graitgames.com).
> Every step is explained for beginners — if you can copy-paste, you can do this.
> Let's level up! 🚀

---

## 📖 Table of Contents

1. [How the Catalog Works (The Big Picture)](#1--how-the-catalog-works-the-big-picture)
2. [File Map — What Lives Where](#2--file-map--what-lives-where)
3. [🎮 Adding a New Game](#3--adding-a-new-game)
4. [🗑️ Removing a Game](#4-%EF%B8%8F-removing-a-game)
5. [🖼️ Adding Custom Thumbnail Images](#5-%EF%B8%8F-adding-custom-thumbnail-images)
6. [📁 Adding a New Category](#6--adding-a-new-category)
7. [✂️ Removing a Category](#7-%EF%B8%8F-removing-a-category)
8. [🔄 How Changes Get Published](#8--how-changes-get-published)
9. [🛠️ Editing via GitHub Web Interface](#9-%EF%B8%8F-editing-via-github-web-interface)
10. [💻 Editing Locally on Your Computer](#10--editing-locally-on-your-computer)
11. [🐛 Troubleshooting Common Issues](#11--troubleshooting-common-issues)
12. [📚 Quick-Reference Cheat Sheet](#12--quick-reference-cheat-sheet)

---

## 1. 🧠 How the Catalog Works (The Big Picture)

The Game Catalog has three moving parts that work together like a team:

```
┌─────────────────────────────────────────────────────┐
│                  games.html                         │
│  The "stage" — has the sidebar, the game grid,      │
│  and each game card written directly in HTML.        │
├─────────────────────────────────────────────────────┤
│                  games.js                           │
│  The "brain" — handles category filtering,          │
│  counts badges, and the mobile sidebar drawer.       │
├─────────────────────────────────────────────────────┤
│               /games/ folder                        │
│  The "arcade room" — each actual playable game      │
│  lives here as its own HTML file.                    │
└─────────────────────────────────────────────────────┘
```

### How filtering works (plain English):

1. Every game card in `games.html` has a **`data-category`** attribute
   (like `data-category="puzzle"` or `data-category="arcade"`).
2. The sidebar buttons also have a **`data-category`** attribute.
3. When you click a category button, `games.js` loops through every game card:
   - **Matches?** → Show the card.
   - **Doesn't match?** → Hide it (adds a CSS class called `hidden`).
4. The script also **counts** how many games are in each category and displays
   that number in the little badge next to the category name.

> 💡 **Key concept:** The category string must match **exactly** between the
> sidebar button and the game card. `"puzzle"` ≠ `"Puzzle"` ≠ `"PUZZLE"`.
> Always use **lowercase**.

---

## 2. 📂 File Map — What Lives Where

```
graitgames-website/
│
├── games.html          ← The catalog page (sidebar + game cards)
├── games.js            ← Filtering logic (you rarely need to edit this)
├── styles.css          ← All visual styles (colors, layout, animations)
│
├── images/             ← Store your game thumbnails here
│   └── (thumbnail files go here — see Section 5)
│
├── games/              ← Individual playable game pages
│   ├── memory-match.html
│   ├── snake.html
│   └── tic-tac-toe.html
│
├── nav.js              ← Site navigation (auto-injected)
└── footer.js           ← Site footer (auto-injected)
```

> 📌 **Remember:** You add game *cards* (the preview tiles) in `games.html`.
> The actual *playable game* goes in the `/games/` folder. They're separate files!

---

## 3. 🎮 Adding a New Game

This is the most common task. Follow these steps carefully and you'll have a
new game on the site in minutes!

### Step 1 — Find the Game Grid

Open `games.html` and scroll to the section that looks like this:

```html
<div class="game-grid" id="game-grid">

  <!-- Existing game cards are here... -->

  <!-- EMPTY STATE: shown when a filter has no matches -->
  <p class="catalog-empty hidden" id="catalog-empty">
    // No games in this category yet — check back soon!
  </p>

</div><!-- /.game-grid -->
```

### Step 2 — Copy a Game Card Template

Add your new card **above** the `<!-- EMPTY STATE -->` comment. Here's the
template — copy it and fill in your details:

```html
<!-- NEW GAME: Your Game Name -->
<article class="game-card" data-category="CATEGORY_HERE">
  <div class="game-thumb">
    <span class="game-tag">CATEGORY_LABEL</span>
    <span class="game-thumb-label">GAME<br>NAME</span>
  </div>
  <div class="game-card-body">
    <h3 class="game-card-title">Your Game Name</h3>
    <p class="game-card-desc">
      A short, exciting description of your game. Keep it to 2-3 sentences
      so the card doesn't get too tall.
    </p>
    <div class="game-card-footer">
      <a href="games/your-game.html" class="btn btn-secondary btn-block"
         aria-label="Play Your Game Name">Play Now</a>
    </div>
  </div>
</article>
```

### Step 3 — Fill In the Details

Here's what to change (with a real example — adding a game called "Pixel Pong"):

| Placeholder         | What to Put                        | Example                          |
|----------------------|------------------------------------|----------------------------------|
| `CATEGORY_HERE`      | Lowercase category name            | `arcade`                         |
| `CATEGORY_LABEL`     | Display name (shown on the tag)    | `Arcade`                         |
| `GAME<br>NAME`       | Short name split on two lines      | `PIXEL<br>PONG`                  |
| `Your Game Name`     | Full title (heading + aria-label)  | `Pixel Pong`                     |
| `games/your-game.html` | Path to the playable game file   | `games/pixel-pong.html`          |
| Description text     | Fun 2-3 sentence description       | *"Classic table tennis..."*      |

### Step 4 — The Completed Card

```html
<!-- NEW GAME: Pixel Pong -->
<article class="game-card" data-category="arcade">
  <div class="game-thumb">
    <span class="game-tag">Arcade</span>
    <span class="game-thumb-label">PIXEL<br>PONG</span>
  </div>
  <div class="game-card-body">
    <h3 class="game-card-title">Pixel Pong</h3>
    <p class="game-card-desc">
      Classic table tennis with a neon twist. Smash the glowing ball past your
      opponent and rack up points. Play solo against the AI or challenge a friend!
    </p>
    <div class="game-card-footer">
      <a href="games/pixel-pong.html" class="btn btn-secondary btn-block"
         aria-label="Play Pixel Pong">Play Now</a>
    </div>
  </div>
</article>
```

### Step 5 — Add the Playable Game File

If your game is ready to play, put its HTML file in the `/games/` folder:

```
games/
├── memory-match.html
├── snake.html
├── tic-tac-toe.html
└── pixel-pong.html       ← your new game!
```

> 🎯 **Not ready yet?** That's okay! Use `href="#"` for the Play Now link
> until the game file is done. The card will still show in the catalog.

### ✅ Done! The Checklist

- [ ] Card added inside `<div class="game-grid">` (above the EMPTY STATE comment)
- [ ] `data-category` is lowercase and matches an existing sidebar category
- [ ] `game-tag` text matches the display name of the category
- [ ] `href` points to the correct file in `/games/`
- [ ] Description is 2-3 sentences (not too long)
- [ ] `aria-label` includes the game name (for accessibility)

> 🧮 **You do NOT need to update games.js!** The script automatically counts
> game cards by reading `data-category` from the HTML. Adding a card with
> `data-category="arcade"` will automatically increase the Arcade count badge.
> That's the magic of the filtering system! ✨

---

## 4. 🗑️ Removing a Game

### Step 1 — Find the Card

Open `games.html` and locate the `<article class="game-card">` block for the
game you want to remove. Each card starts and ends like this:

```html
<!-- 4. Arcade — LIVE GAME -->
<article class="game-card" data-category="arcade">
  ...everything in between...
</article>
```

### Step 2 — Delete the Entire Block

Select everything from the opening `<article>` tag to the closing `</article>`
tag (including any comment above it) and delete it.

> ⚠️ **Be careful!** Make sure you delete the **complete** block. If you
> accidentally leave behind a stray `</article>` or `</div>`, the page layout
> will break. Count your opening and closing tags!

### Step 3 — (Optional) Delete the Game File

If you also want to remove the actual playable game, delete its file from the
`/games/` folder:

```
Delete: games/pixel-pong.html
```

### Step 4 — Verify

After saving, check that:
- [ ] The game no longer shows in the catalog
- [ ] The category counts updated automatically (they will!)
- [ ] No layout glitches on the page (inspect the grid visually)

> 💡 **Tip:** If a category now has **zero** games after removing one, consider
> also removing that category from the sidebar (see [Section 7](#7-%EF%B8%8F-removing-a-category)).

---

## 5. 🖼️ Adding Custom Thumbnail Images

Right now, game cards use a styled placeholder (the `game-thumb-label` text on
a gradient background). You can replace these with real images!

### Image Requirements

| Property       | Recommendation                                    |
|----------------|---------------------------------------------------|
| **Dimensions** | **400 × 240 px** (5:3 ratio) — fits the card perfectly |
| **Max file size** | **100 KB** or less (keeps pages fast)           |
| **Format**     | **WebP** (best) or **PNG** (good). Avoid BMP/TIFF. |
| **Style**      | Dark backgrounds with bright neon accents match the synthwave brand |
| **File name**  | Lowercase, hyphens, no spaces: `pixel-pong-thumb.webp` ✅ |

### Step 1 — Prepare Your Image

1. Create or screenshot your game thumbnail.
2. Resize to **400 × 240 px** (use any free tool — [Squoosh.app](https://squoosh.app) is great).
3. Export as **WebP** for the smallest file size.
4. Name it clearly: `your-game-name-thumb.webp`

### Step 2 — Add the Image to Your Project

Place the file in the `/images/` folder (create it if it doesn't exist):

```
graitgames-website/
└── images/
    ├── memory-match-thumb.webp
    ├── pixel-pong-thumb.webp    ← new image
    └── ...
```

### Step 3 — Update the Game Card HTML

Find your game's card in `games.html` and replace the `<div class="game-thumb">`
section. Change it **from** the placeholder style **to** the image style:

**BEFORE (placeholder):**
```html
<div class="game-thumb">
  <span class="game-tag">Arcade</span>
  <span class="game-thumb-label">PIXEL<br>PONG</span>
</div>
```

**AFTER (custom image):**
```html
<div class="game-thumb">
  <span class="game-tag">Arcade</span>
  <img src="images/pixel-pong-thumb.webp"
       alt="Pixel Pong game screenshot"
       class="game-thumb-img"
       loading="lazy"
       width="400"
       height="240" />
</div>
```

### What Each Part Means

| Attribute       | Purpose |
|-----------------|---------|
| `src="images/..."` | Path to your image file |
| `alt="..."`     | Description for screen readers and when images fail to load (accessibility!) |
| `class="game-thumb-img"` | Applies the correct styling from `styles.css` |
| `loading="lazy"` | Tells the browser "don't load this image until the user scrolls near it" — makes the page faster! |
| `width` / `height` | Prevents layout shift while loading (the browser reserves the right amount of space) |

### 🎨 Image Optimization Tips

1. **Use [Squoosh.app](https://squoosh.app)** — free, runs in your browser,
   converts to WebP with a quality slider.
2. **Quality 75-80%** in WebP gives excellent visuals at tiny file sizes.
3. **Test on mobile** — thumbnails look smaller on phones, so fine details
   may not be visible. Keep images bold and simple.
4. **Consistent style** — try to give all thumbnails a similar look (dark
   background, neon highlights) so the catalog grid feels cohesive.
5. **If you don't have an image yet**, the placeholder text (`game-thumb-label`)
   looks great! No rush to replace it.

> 💡 **Note about `game-thumb-img` class:** If this CSS class doesn't exist
> in `styles.css` yet, add this rule:
> ```css
> .game-thumb-img {
>   width: 100%;
>   height: 100%;
>   object-fit: cover;
>   display: block;
> }
> ```
> This makes the image fill the thumbnail area without stretching or distortion.

---

## 6. 📁 Adding a New Category

Let's say you've built a "Racing" game and there's no Racing category yet.
You need to update **one file**: `games.html`. Two spots.

### Step 1 — Add the Sidebar Button

Find the `<ul class="category-list">` section in the sidebar. It looks like this:

```html
<ul class="category-list" role="list">
  <li>
    <button type="button" class="category-btn active" data-category="all" aria-pressed="true">
      All Games <span class="category-count" data-count="all">0</span>
    </button>
  </li>
  <li>
    <button type="button" class="category-btn" data-category="puzzle" aria-pressed="false">
      Puzzle <span class="category-count" data-count="puzzle">0</span>
    </button>
  </li>
  <!-- ... more categories ... -->
</ul>
```

**Add a new `<li>` block** at the end (before the closing `</ul>`):

```html
<li>
  <button type="button" class="category-btn" data-category="racing" aria-pressed="false">
    Racing <span class="category-count" data-count="racing">0</span>
  </button>
</li>
```

### Step 2 — Make Sure Your Game Card Uses the Same Category

When you add a game card for this category, the `data-category` **must match exactly**:

```html
<article class="game-card" data-category="racing">
  <div class="game-thumb">
    <span class="game-tag">Racing</span>
    <!-- ... rest of card ... -->
  </div>
  <!-- ... -->
</article>
```

### ⚠️ The Golden Rule of Categories

```
Sidebar button:   data-category="racing"     data-count="racing"
Game card:        data-category="racing"
                         ↑                          ↑
                    MUST BE IDENTICAL (lowercase, no spaces)
```

### ✅ Category Naming Conventions

| ✅ Good          | ❌ Bad              | Why |
|------------------|---------------------|-----|
| `racing`         | `Racing`            | Must be lowercase |
| `word-games`     | `word games`        | Use hyphens, not spaces |
| `rpg`            | `RPG`               | Lowercase only |
| `board-games`    | `board_games`       | Hyphens preferred over underscores |

> 🧮 **Reminder:** You do NOT need to edit `games.js` when adding categories!
> The script reads category values from the HTML automatically. As long as the
> `data-category` and `data-count` attributes match, everything works. 🎉

---

## 7. ✂️ Removing a Category

If you've removed all games from a category (say "Adventure") and don't want
an empty category cluttering the sidebar, remove it in **one step**:

### Step 1 — Delete the Sidebar Button

Find the `<li>` block for that category in `games.html`:

```html
<li>
  <button type="button" class="category-btn" data-category="adventure" aria-pressed="false">
    Adventure <span class="category-count" data-count="adventure">0</span>
  </button>
</li>
```

**Delete the entire `<li>...</li>` block.**

### Step 2 — Verify No Cards Still Use That Category

Do a quick search (Ctrl+F / Cmd+F) in `games.html` for:

```
data-category="adventure"
```

If any game cards still use this category, either:
- **Remove those cards** too (Section 4), or
- **Change their category** to something else (edit the `data-category` value).

### ✅ Removal Checklist

- [ ] Sidebar `<li>` block deleted
- [ ] No game cards remain with `data-category="adventure"`
- [ ] "All Games" count still looks correct after saving

> 💡 **Don't remove "All Games"!** The `data-category="all"` button is
> special — `games.js` uses it to show every card. Always keep it.

---

## 8. 🔄 How Changes Get Published

Your website uses a **Git → GitHub → Cloudflare Pages** pipeline. Here's the
flow in plain English:

```
  You edit a file
       │
       ▼
  Save & commit to Git          ← "Hey Git, save this version"
       │
       ▼
  Push to GitHub                 ← "Hey GitHub, here's the latest code"
       │
       ▼
  Cloudflare Pages detects       ← Cloudflare watches your repo
  the new commit                    for changes automatically
       │
       ▼
  Site rebuilds & deploys        ← Usually takes 30-60 seconds
       │
       ▼
  🌐 www.graitgames.com          ← Your changes are LIVE!
     is updated
```

### Key Terms

| Term       | What It Means |
|------------|---------------|
| **Commit** | A "save point" — like a snapshot of your files at that moment |
| **Push**   | Sending your commits from your computer (or GitHub editor) to GitHub |
| **Deploy** | Cloudflare builds and publishes the new version of your site |
| **Branch** | The `main` branch is your live site. Changes pushed here go live. |

> ⏱️ **How long until I see my changes?** Typically **30-60 seconds** after
> pushing to GitHub. Cloudflare is fast! If you don't see changes, try a
> hard refresh in your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac).

---

## 9. 🛠️ Editing via GitHub Web Interface

This is the easiest method — no software to install! Great for quick edits.

### Step 1 — Go to Your Repository

Navigate to: **https://github.com/graitgames/graitgames-website**

### Step 2 — Find the File

Click on `games.html` in the file list.

### Step 3 — Enter Edit Mode

Click the **pencil icon** (✏️) in the top-right corner of the file view.
This opens the built-in code editor.

### Step 4 — Make Your Changes

Edit the HTML directly. Use the template from [Section 3](#3--adding-a-new-game)
to add cards, or delete blocks to remove them.

### Step 5 — Commit (Save)

1. Scroll down to the **"Commit changes"** section.
2. Write a short message describing what you did:
   - ✅ `Add Pixel Pong game card to catalog`
   - ✅ `Remove Synth Quest from catalog`
   - ❌ `update` (too vague!)
3. Keep **"Commit directly to the `main` branch"** selected.
4. Click **"Commit changes"**.

### Step 6 — Wait for Deployment

Cloudflare Pages will automatically detect the commit and deploy. Check your
site in about 30-60 seconds!

### 📤 Uploading Images via GitHub Web

1. Navigate to the `/images/` folder in your repository (or create it).
2. Click **"Add file"** → **"Upload files"**.
3. Drag your thumbnail images into the upload area.
4. Write a commit message: `Add thumbnail for Pixel Pong`
5. Click **"Commit changes"**.

---

## 10. 💻 Editing Locally on Your Computer

For bigger changes, editing on your computer with a code editor gives you more
power (and you can preview changes before publishing!).

### Prerequisites

- **Git** installed ([download here](https://git-scm.com/downloads))
- **A code editor** — [VS Code](https://code.visualstudio.com/) is free and fantastic
- **GitHub access** to the `graitgames/graitgames-website` repo

### Step 1 — Clone the Repository (First Time Only)

Open a terminal and run:

```bash
git clone https://github.com/graitgames/graitgames-website.git
cd graitgames-website
```

If you've already cloned it before, pull the latest changes instead:

```bash
cd graitgames-website
git pull origin main
```

### Step 2 — Open in Your Editor

```bash
code .    # Opens VS Code in the current folder
```

### Step 3 — Make Your Edits

Edit `games.html`, add images to `/images/`, etc.

### Step 4 — Preview Locally (Optional but Recommended!)

You can open `games.html` directly in your browser to preview:

```bash
# macOS
open games.html

# Windows
start games.html

# Linux
xdg-open games.html
```

Or use VS Code's **Live Server** extension for auto-refreshing previews.

### Step 5 — Commit and Push

```bash
# See what changed
git status

# Stage all your changes
git add .

# Commit with a descriptive message
git commit -m "Add Pixel Pong to game catalog with thumbnail"

# Push to GitHub (triggers Cloudflare deployment)
git push origin main
```

### 🔑 Common Git Commands Cheat Sheet

| Command              | What It Does |
|----------------------|--------------|
| `git status`         | Shows which files you changed |
| `git add .`          | Stages all changes for commit |
| `git add games.html` | Stages only one specific file |
| `git commit -m "..."` | Saves a snapshot with a message |
| `git push origin main` | Sends your commits to GitHub |
| `git pull origin main` | Downloads the latest changes from GitHub |
| `git log --oneline`  | Shows your recent commit history |

---

## 11. 🐛 Troubleshooting Common Issues

### 😱 "My game card doesn't show up!"

**Check these things:**

1. **Is it inside the `game-grid` div?**
   The card must be between `<div class="game-grid" id="game-grid">` and its
   closing `</div>`.

2. **Is the HTML valid?** Count your opening and closing tags:
   - Every `<article>` needs `</article>`
   - Every `<div>` needs `</div>`
   - Every `<span>` needs `</span>`

3. **Check the browser console** for errors:
   - Right-click the page → "Inspect" → "Console" tab.
   - Red errors will tell you what's wrong.

---

### 😱 "The category count is wrong!"

The count comes from `games.js` scanning `data-category` attributes.

- Make sure your card's `data-category` value matches **exactly** (case-sensitive!).
- `data-category="Puzzle"` ≠ `data-category="puzzle"` ← this will break the count.

---

### 😱 "My image doesn't load!"

1. **Check the file path.** If your image is at `images/my-game.webp`, the
   `src` should be `images/my-game.webp` (relative path, no leading `/`).
2. **Check the file name.** Spaces and uppercase cause issues.
   - ❌ `My Game Thumb.PNG`
   - ✅ `my-game-thumb.webp`
3. **Check file size.** Images over 1 MB will slow down the page.
4. **Check format.** Use WebP or PNG. Avoid BMP, TIFF, or raw files.

---

### 😱 "The page layout looks broken!"

You probably have mismatched HTML tags. Here's how to find the problem:

1. Go to [W3C HTML Validator](https://validator.w3.org/).
2. Paste your HTML or provide the URL.
3. It will highlight exactly where tags are mismatched.

**Common culprits:**
- A missing `</article>` or `</div>`
- An extra `</div>` left over from a deleted card
- A typo in a tag name (like `<artcile>` instead of `<article>`)

---

### 😱 "Changes aren't showing on the live site!"

1. **Did you commit AND push?** `git commit` alone doesn't update GitHub.
   You need `git push origin main` too.
2. **Hard refresh your browser:** `Ctrl+Shift+R` (Windows/Linux) or
   `Cmd+Shift+R` (Mac).
3. **Check Cloudflare Pages dashboard** — the deploy might have failed.
   Look at your Cloudflare Pages project for build logs.
4. **Wait 60 seconds.** Sometimes deploys take a minute.

---

### 😱 "Git says there's a merge conflict!"

This happens when two people edited the same file at the same time. Don't panic!

1. Open the file Git is complaining about.
2. Look for these markers:
   ```
   <<<<<<< HEAD
   (your version)
   =======
   (the other version)
   >>>>>>> main
   ```
3. Choose which version to keep (or combine them).
4. Delete the `<<<<<<<`, `=======`, and `>>>>>>>` markers.
5. Save, commit, and push again.

---

## 12. 📚 Quick-Reference Cheat Sheet

### Add a Game (30-Second Version)

1. Open `games.html`
2. Find `<div class="game-grid">`
3. Paste a game card block (copy from an existing one)
4. Change: `data-category`, game tag, title, description, link
5. Commit & push → live in ~60 seconds

### Remove a Game (15-Second Version)

1. Open `games.html`
2. Find the `<article>...</article>` block
3. Delete the entire block
4. Commit & push

### Add a Category (30-Second Version)

1. Open `games.html`
2. Find `<ul class="category-list">`
3. Add a `<li>` with `data-category="your-category"` and matching `data-count`
4. Use the same `data-category` value on your game cards
5. Commit & push

### Add a Custom Image (45-Second Version)

1. Prepare image: 400×240px, WebP format, under 100KB
2. Upload to `/images/` folder
3. Replace `<span class="game-thumb-label">` with an `<img>` tag
4. Commit & push

---

## 🌟 Final Words

You're doing something awesome — **building games and learning to code together**.
Every game you add to this catalog is a trophy. Every commit you push is practice.

Don't be afraid to break things. That's what Git is for — you can always go back
to a previous commit if something goes wrong. The best way to learn is by doing,
and you're doing great.

**Keep building. Keep playing. Keep being GRaiT.** 🕹️✨

---

*This guide is part of the GRaiT GAMES project — a father-son adventure in
game development and web design. Last updated: June 2025.*
