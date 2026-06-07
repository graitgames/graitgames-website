# 🛠️ Decap CMS Login Troubleshooting — Fixing the "404" Error

> **You are here because:** You clicked **"Login with GitHub"** at
> `https://www.graitgames.com/admin/` and landed on a GitHub **404 page**
> ("This is not the web page you are looking for").
>
> Don't worry — this is one of the most common Decap CMS setup hiccups, and it's
> almost always one of **four small things** that haven't been finished yet.
> This guide walks you through each one in plain language. 👨‍👦

---

## 🔁 UPDATE 2 — "Popup closes but I'm NOT logged in" (FIXED)

**Symptom:** You click **Login with GitHub**, the popup opens and briefly shows
*"Completing login… you can close this window"*, then **closes by itself — but the
CMS stays on the login screen.** No 404 this time; login *almost* works.

**Root cause:** the OAuth popup and the CMS talk to each other with a specific
**`postMessage` handshake**, and the order was wrong. Decap expects this sequence:

```
1. POPUP  → CMS:   "authorizing:github"                 ← the popup must start it
2. CMS    → POPUP: "authorizing:github"                 ← acknowledgement
3. POPUP  → CMS:   "authorization:github:success:{token}"
4. CMS receives the token and logs you in ✅
```

The old `callback.js` **skipped step 1** and fired the step-3 token message
immediately — before the CMS had switched to listening for it. So the token was
**dropped on the floor**, the popup closed, and you were never logged in.

**The fix (already committed):** `functions/api/callback.js` now performs the
handshake correctly — it first posts `authorizing:github`, waits for the CMS to
acknowledge, and *then* sends the token. We verified the new order with a
simulation (token delivered ✅) and confirmed the old order failed (token dropped ❌).

We also set `auth_endpoint: api/auth` (relative, no leading slash) in
`admin/config.yml` so the auth URL resolves cleanly to
`https://www.graitgames.com/api/auth` with no double-slash edge cases.

> 👉 **What you must do:** **Re-deploy** (Cloudflare → Deployments → ⋯ →
> **Retry deployment**, or push a commit) so the new `callback.js` goes live, then
> try logging in again at **`https://www.graitgames.com/admin/`**.

> 💡 **If it still doesn't log you in:** open the browser **console (F12)** on the
> `/admin/` page *before* clicking login, and watch for messages/errors during the
> popup. Also make sure pop-ups aren't blocked for the site.

---

## 🩺 UPDATE — Root Cause Found (read this first)

After you added the environment variables and re-deployed, the login **still
404'd**. We dug in and found **two concrete issues**. Both are now handled:

### ① Environment variable **name mismatch** (the main culprit) ✅ FIXED IN CODE

You added the variables in Cloudflare as:

```
OAUTH_GITHUB_CLIENT_ID
OAUTH_GITHUB_CLIENT_SECRET
```

…but the login functions were reading the **un-prefixed** names
(`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`). Because the names didn't match,
the code sent an **empty `client_id`** to GitHub — and GitHub responds to an
unknown/empty client ID with exactly the **404 "Jawa" page** you saw.

**The fix (already committed):** `functions/api/auth.js` and
`functions/api/callback.js` now accept **either** name:

```js
const clientId = env.GITHUB_CLIENT_ID || env.OAUTH_GITHUB_CLIENT_ID;
const clientSecret = env.GITHUB_CLIENT_SECRET || env.OAUTH_GITHUB_CLIENT_SECRET;
```

So your existing `OAUTH_GITHUB_*` variables will now work as-is. They also now
**fail loudly** with a clear message (instead of a confusing GitHub 404) if the
credentials are ever missing.

> 👉 **What you must do:** Just **re-deploy** so the new function code goes live
> (Cloudflare → Deployments → ⋯ → **Retry deployment**, or push any commit).
> You do **not** need to rename your variables.

### ② Domain mismatch: `www.` vs non-`www.` ⚠️ ACTION NEEDED

Your Cloudflare project serves **three** domains:
`graitgames.com`, `www.graitgames.com`, and `graitgames-website.pages.dev`.

You're logging in at **`https://www.graitgames.com/admin/`**, but
`admin/config.yml` says `base_url: https://graitgames.com` (no `www.`). For the
login popup, token hand-off, and your GitHub **callback URL** to all line up,
**everything must use ONE domain.** See the exact fix in
[Pitfall #1](#pitfall-1--www-vs-non-www-domain-mismatch-) below.

> ✅ **Resolved:** Cloudflare redirects `graitgames.com` → `www.graitgames.com`,
> so we standardised on the **www** domain. `config.yml` now uses
> `base_url: https://www.graitgames.com`. Always open
> **`https://www.graitgames.com/admin/`** and set your GitHub OAuth callback to
> **`https://www.graitgames.com/api/callback`**.

### ✔️ Verify after re-deploying

1. Open **`https://www.graitgames.com/api/auth`** directly.
   - ✅ It should now **redirect to GitHub's "Authorize" screen** (not a 404).
   - If you instead see *"Server is missing the GitHub OAuth client ID"*, the
     variables aren't attached to this deployment → re-check names & re-deploy.
2. Then open **`https://www.graitgames.com/admin/`** and click **Login with GitHub**.

---

## 🎯 TL;DR — The Quick Fix (do these in order)

Most people hit the 404 because the **GitHub OAuth App doesn't exist yet** and/or
the **secret keys aren't in Cloudflare**. Here's the 5‑minute version:

1. **Create a GitHub OAuth App** → [github.com/settings/developers](https://github.com/settings/developers)
   - **Homepage URL:** `https://graitgames.com`
   - **Authorization callback URL:** `https://graitgames.com/api/callback`
2. **Copy the Client ID**, then **Generate a new client secret** and copy it too.
3. **Add them to Cloudflare Pages** → your project → **Settings → Environment variables**:
   - `GITHUB_CLIENT_ID` = *(the Client ID)*
   - `GITHUB_CLIENT_SECRET` = *(the secret — mark as **Encrypted**)*
4. **Re-deploy** the site (Cloudflare → Deployments → **Retry deployment**, or push any commit).
5. **Always log in from the matching domain.** Our config uses `https://graitgames.com`,
   so visit **`https://graitgames.com/admin/`** (no `www.`) — see [Pitfall #1](#pitfall-1--www-vs-non-www-domain-mismatch-).

If it still 404s after that, keep reading — the rest of this guide explains *why*
each step matters and how to verify it.

---

## 🧠 First, Understand What's Happening (the OAuth flow)

When you log in, **five things** happen behind the scenes. Knowing the flow makes
the 404 much easier to pin down, because you can tell *exactly where it breaks*.

```
   YOU (browser)                OUR SITE (Cloudflare)            GITHUB
   ─────────────                ─────────────────────           ──────────
1. Click "Login with
   GitHub" in /admin/  ─────►   /api/auth  (auth.js)
                                   builds a GitHub URL
                                   using GITHUB_CLIENT_ID
                                              │
2.                                            └──────────────►  github.com/login/
                                                                oauth/authorize
                                                                "Authorize this app?"
3. You click "Authorize"  ◄───────────────────────────────────┘
                                                                
4.                            /api/callback  (callback.js)  ◄── GitHub redirects back
                                exchanges the ?code for a       with a one-time ?code
                                token using CLIENT_SECRET
                                              │
5. Popup posts the token  ◄───────────────────┘
   back to the CMS, closes,
   and you're logged in. ✅
```

| Step | URL involved | What it does | If THIS is broken you see… |
|------|--------------|--------------|----------------------------|
| 1 | `https://graitgames.com/api/auth` | Starts login, redirects to GitHub | **404 on your own site** → function not deployed |
| 2 | `github.com/login/oauth/authorize?client_id=…` | GitHub's "Authorize app" screen | **GitHub 404 / "page not found"** → OAuth App missing or wrong Client ID |
| 4 | `https://graitgames.com/api/callback` | Swaps code for token | **GitHub 404 after authorizing** → callback URL mismatch |
| 4 | (server-side token exchange) | Uses the secret | **"Failed to obtain access token"** → secret missing/wrong |
| 5 | popup → CMS window | Hands token back | **Popup closes, nothing happens** → domain mismatch (www vs non‑www) |

> 🔍 **The GitHub 404 you're seeing (the "Jawa" 404 page) almost always means Step 2
> or Step 4** — GitHub can't find an OAuth App matching the Client ID, **or** the
> callback URL you registered doesn't match the one we send. That points straight at
> **"the GitHub OAuth App isn't created / configured correctly yet."**

---

## ✅ The Setup, Step by Step

### Step 1 — Create a GitHub OAuth App

1. Go to **[https://github.com/settings/developers](https://github.com/settings/developers)**
   (GitHub → your profile photo → **Settings → Developer settings → OAuth Apps**).
2. Click **"New OAuth App"** (or **"Register a new application"**).
3. Fill in the form **exactly** like this:

   | Field | Value to enter |
   |-------|----------------|
   | **Application name** | `GRaiT GAMES CMS` (any name is fine) |
   | **Homepage URL** | `https://graitgames.com` |
   | **Authorization callback URL** | `https://graitgames.com/api/callback` |
   | Application description | *(optional)* e.g. "Login for our blog editor" |

4. Click **"Register application"**.
5. On the next screen you'll see a **Client ID** — copy it somewhere safe.
6. Click **"Generate a new client secret"**, then **copy the secret immediately**
   (GitHub only shows it once!).

> ⚠️ **The single most common cause of the 404 is that this OAuth App was never
> created**, so `GITHUB_CLIENT_ID` is empty and GitHub can't find an app to authorize.

#### 📌 Which callback URL do I use?

- **The callback URL MUST be** `https://graitgames.com/api/callback`
  - This is your **live domain** + `/api/callback`.
  - It must match what `functions/api/callback.js` sends (it builds the callback from
    the same origin the request came in on).
- ❌ Do **not** use `localhost`, `netlify`, or a `www.` version that doesn't match
  the domain you log in from (see [Pitfall #1](#pitfall-1--www-vs-non-www-domain-mismatch-)).
- ✅ You can add **multiple** OAuth Apps (or callback entries) if you genuinely use both
  `www.` and non‑`www.` — but the simplest fix is to **pick one domain and stick to it**.

---

### Step 2 — Add Environment Variables in Cloudflare Pages

The secret can't live in our code (that would be insecure), so Cloudflare stores it.

1. Log in to **[dash.cloudflare.com](https://dash.cloudflare.com)**.
2. In the left sidebar click **Workers & Pages**, then open your
   **`graitgames-website`** Pages project.
3. Go to **Settings → Environment variables** (sometimes "Variables and Secrets").
4. Under **Production**, click **"Add variable"** and add **both**:

   | Variable name | Value | Type |
   |---------------|-------|------|
   | `GITHUB_CLIENT_ID` | *(Client ID from Step 1)* | Plaintext |
   | `GITHUB_CLIENT_SECRET` | *(secret from Step 1)* | **Encrypt** ✅ |

5. Click **Save**.

> 🧩 **Names must match EXACTLY** (all caps, underscores). Our functions read
> `env.GITHUB_CLIENT_ID` and `env.GITHUB_CLIENT_SECRET`. A typo like
> `GITHUB_CLIENTID` or `Github_Client_Id` = login fails.

> 🔁 **Environment variables only take effect on the NEXT deploy.** After saving,
> you **must re-deploy** (next step) — existing live functions won't see the new
> values until then.

---

### Step 3 — Re-deploy and Verify the Functions Are Live

Cloudflare Pages turns the `/functions` folder into live API routes automatically,
but only when it **builds a deployment** that includes those files.

#### Trigger a fresh deploy (pick one):
- **Easiest:** Cloudflare → your project → **Deployments** tab → on the latest
  deployment click the **⋯** menu → **"Retry deployment"**, **or**
- **Push a commit** to `main` (Cloudflare auto-deploys). Even a tiny change works:
  ```bash
  git commit --allow-empty -m "Trigger Cloudflare redeploy for CMS auth"
  git push origin main
  ```

#### Verify the functions actually exist (this is the key test!):

Open these URLs **directly in your browser**:

1. **`https://graitgames.com/api/auth`**
   - ✅ **Working:** It immediately **redirects you to GitHub** (you'll see
     `github.com/login/oauth/authorize…` in the address bar). *Note:* if the Client ID
     is wrong/empty, GitHub then shows an error — but you at least reached GitHub,
     proving the function is deployed.
   - ❌ **Broken:** You see a **Cloudflare 404** (`Nothing is here` / your own site's
     404). That means the function **isn't deployed** → re-check the folder is
     `functions/api/auth.js` at the **repo root** and re-deploy.

2. **`https://graitgames.com/api/callback`**
   - ✅ **Working:** Shows the message **"Invalid OAuth state or missing code."**
     (That's expected when you open it directly — it proves the function runs!)
   - ❌ **Broken:** A 404 means it isn't deployed.

> 🟢 **This `/api/auth` test is the fastest way to diagnose the 404.** It tells you
> instantly whether the problem is **on our side** (function not deployed → Cloudflare 404)
> or **on GitHub's side** (function works, but OAuth App/Client ID is wrong → GitHub 404).

---

## 🚨 Common Mistakes & How to Fix Them

### Pitfall #1 — `www.` vs non‑`www.` domain mismatch ⭐ (likely your issue!)

You're logging in at **`https://www.graitgames.com/admin/`**, but our
`admin/config.yml` is set to:

```yaml
backend:
  base_url: https://graitgames.com     # ← no "www."
```

When the domains don't match, the login popup opens on `graitgames.com` while the
CMS window is on `www.graitgames.com`. The browser treats these as **different sites**,
which can break the final token hand-off (the popup closes and nothing happens), and
your registered callback URL may not match either — producing the **GitHub 404**.

**Two ways to fix — pick ONE and be consistent:**

**Option A (recommended — use the non‑www domain everywhere):**
- Always open the CMS at **`https://graitgames.com/admin/`** (no `www.`).
- Keep `base_url: https://graitgames.com` in `config.yml`.
- Set the GitHub callback to `https://graitgames.com/api/callback`.
- In Cloudflare, make sure **`www.graitgames.com` redirects to `graitgames.com`**
  (Cloudflare → your domain → **Redirect Rules**, or set the apex as primary).

**Option B (use the www domain everywhere):**
- Change `config.yml` to `base_url: https://www.graitgames.com`.
- Set the GitHub callback to `https://www.graitgames.com/api/callback`.
- Always open `https://www.graitgames.com/admin/`.

> 💡 Whatever you choose, **all three must agree**: the URL you visit, the `base_url`
> in `config.yml`, and the GitHub **callback URL**.

---

### Pitfall #2 — OAuth App not created (empty Client ID)
- **Symptom:** GitHub 404 / "page not found" right after clicking Login.
- **Fix:** Complete [Step 1](#step-1--create-a-github-oauth-app).

### Pitfall #3 — Callback URL doesn't match
- **Symptom:** You reach GitHub, click "Authorize", then hit a GitHub 404 or
  "redirect_uri mismatch" error.
- **Fix:** In your OAuth App settings, the **Authorization callback URL** must be
  **exactly** `https://graitgames.com/api/callback` (same domain you use, `/api/callback`,
  no trailing slash, no typo).

### Pitfall #4 — Environment variables missing or misnamed
- **Symptom:** Popup shows **"Failed to obtain access token."**
- **Fix:** Confirm `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` exist in Cloudflare
  **Production** vars, names spelled exactly, secret marked Encrypted, then **re-deploy**.

### Pitfall #5 — Forgot to re-deploy after adding variables
- **Symptom:** You added the vars but login still fails the same way.
- **Fix:** Variables only apply to **new** deployments. Retry the deployment or push a commit.

### Pitfall #6 — Testing on localhost
- **Symptom:** `/admin/` login does nothing on `http://localhost:3000/admin/`.
- **Why:** The OAuth functions only run on **Cloudflare's servers**, not your local
  `python3 -m http.server`. This is expected.
- **Fix:** Test login on the **live site** only. (Local preview is fine for *viewing*
  pages, just not for CMS login.)

### Pitfall #7 — Functions in the wrong folder
- **Symptom:** `/api/auth` returns a Cloudflare 404 even after deploying.
- **Fix:** The files must be at the **repository root** in:
  ```
  functions/api/auth.js
  functions/api/callback.js
  ```
  Cloudflare maps `functions/api/auth.js` → the route `/api/auth` automatically.
  (✅ In this repo they're already in the right place.)

### Pitfall #8 — Browser blocked the popup
- **Symptom:** Nothing opens when you click Login.
- **Fix:** Allow popups for your site, or try again — Decap opens the GitHub login
  in a popup window.

---

## 📋 Verification Checklist

Tick each box. If all are checked and login still fails, see [Still Stuck?](#-still-stuck-collect-this-info) below.

**GitHub OAuth App**
- [ ] An OAuth App exists at [github.com/settings/developers](https://github.com/settings/developers)
- [ ] Homepage URL = `https://graitgames.com`
- [ ] Authorization callback URL = `https://graitgames.com/api/callback`
- [ ] You copied the **Client ID**
- [ ] You generated and copied a **Client Secret**

**Cloudflare Pages**
- [ ] `GITHUB_CLIENT_ID` is set (Production, plaintext, exact name)
- [ ] `GITHUB_CLIENT_SECRET` is set (Production, **Encrypted**, exact name)
- [ ] You **re-deployed** AFTER adding the variables

**Functions are live**
- [ ] Visiting `https://graitgames.com/api/auth` redirects to GitHub (not a 404)
- [ ] Visiting `https://graitgames.com/api/callback` shows
      "Invalid OAuth state or missing code." (not a 404)

**Domain consistency** (the big one)
- [ ] The URL I open, `config.yml` `base_url`, and the GitHub callback URL
      **all use the same domain** (all `www.` **or** all non‑`www.`)
- [ ] I'm logging in on the **live site**, not localhost

---

## 🔗 Handy Links

- **Create a GitHub OAuth App:** https://github.com/settings/developers
- **Cloudflare dashboard:** https://dash.cloudflare.com
- **Decap CMS — External OAuth Clients:** https://decapcms.org/docs/external-oauth-clients/
- **Decap CMS — GitHub backend:** https://decapcms.org/docs/github-backend/
- **Cloudflare Pages Functions:** https://developers.cloudflare.com/pages/functions/
- **Cloudflare Pages — Environment variables:** https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables
- **Full setup walkthrough (this repo):** [BLOG-CMS-SETUP.md](./BLOG-CMS-SETUP.md)

---

## 🆘 Still Stuck? Collect This Info

If you've checked everything above and login still fails, gather these details — it
makes the problem much faster to solve:

1. **Where does the 404 appear?** On `graitgames.com` (our site) or on `github.com`?
   - *github.com 404* → OAuth App / Client ID / callback URL problem (Steps 1 & Pitfalls #2, #3).
   - *graitgames.com 404* → function not deployed (Step 3 & Pitfall #7).
2. **What does `https://graitgames.com/api/auth` do** when you open it directly?
   (redirects to GitHub = good; Cloudflare 404 = function not deployed.)
3. **The exact domain in your address bar** when you started (`www.` or not?).
4. **A screenshot** of your GitHub OAuth App settings (you can blur the secret).
5. **A screenshot** of your Cloudflare **Environment variables** list (values can be hidden).
6. **Open the browser console** (F12 → Console tab) on `/admin/` and copy any red errors.

---

### 🎓 What we learned (the father‑son takeaway)

OAuth login looks like magic, but it's really just a **relay race**: your site hands
off to GitHub, GitHub hands back a code, your function trades that code for a key, and
the key unlocks the editor. A 404 just means **one runner dropped the baton** — and now
you know exactly how to find which one. 🏃‍♂️➡️🏃‍♂️➡️🔑
