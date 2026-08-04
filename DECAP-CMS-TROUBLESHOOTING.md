# Decap CMS Login Troubleshooting

> **You are here because:** you clicked **"Login with GitHub"** at
> `https://www.graitgames.com/admin/` and it didn't log you in — you saw a
> **GitHub 404**, a Cloudflare 404, a popup that closed without doing anything,
> or an error message like *"Failed to obtain access token."*
>
> This guide is the shortest path back to a working login. It's written as a
> checklist against **the setup this site actually uses today**, then a list of
> the common ways it breaks.

For the one-time setup (creating the GitHub OAuth App and adding Cloudflare
environment variables), see **[BLOG-CMS-SETUP.md §4](./BLOG-CMS-SETUP.md#4-one-time-setup-do-this-once)**.
This document is only about *diagnosing a broken login*.

---

## The correct setup (single source of truth)

**All three of these must agree.** If any two disagree, login breaks.

| Where | Value |
|-------|-------|
| The URL you visit to log in | `https://www.graitgames.com/admin/` |
| `admin/config.yml` → `base_url` | `https://www.graitgames.com` |
| `admin/config.yml` → `auth_endpoint` | `api/auth` *(relative — no leading slash)* |
| GitHub OAuth App → **Homepage URL** | `https://www.graitgames.com` |
| GitHub OAuth App → **Authorization callback URL** | `https://www.graitgames.com/api/callback` |

**Cloudflare Pages environment variables** (Production):

| Name | Value | Type |
|------|-------|------|
| `GITHUB_CLIENT_ID` | *from the GitHub OAuth App* | Plaintext |
| `GITHUB_CLIENT_SECRET` | *from the GitHub OAuth App* | **Encrypted** |

`functions/api/auth.js` and `functions/api/callback.js` also accept the
alternate names `OAUTH_GITHUB_CLIENT_ID` / `OAUTH_GITHUB_CLIENT_SECRET`, so if
you added them under those names earlier they still work — no rename needed.

---

## 60-second diagnosis

Open these two URLs **directly in your browser**. Their behavior tells you
exactly where login is breaking.

### 1. `https://www.graitgames.com/api/auth`

| What you see | What it means |
|-------------|---------------|
| Immediately redirects to `github.com/login/oauth/authorize…` | ✅ The function is live. |
| GitHub then shows an error like "not found" or "Jawa" 404 | The GitHub **OAuth App** is missing, or the **Client ID** is wrong → see [Pitfall 1](#pitfall-1--oauth-app-not-created-or-wrong-client-id). |
| Cloudflare 404 ("Nothing is here") | The function isn't deployed → see [Pitfall 4](#pitfall-4--forgot-to-re-deploy). |
| "Server is missing the GitHub OAuth client ID" | Env vars aren't attached to this deployment → see [Pitfall 2](#pitfall-2--environment-variables-missing-or-misnamed). |

### 2. `https://www.graitgames.com/api/callback`

| What you see | What it means |
|-------------|---------------|
| "Invalid OAuth state or missing code." | ✅ The function is live. (Opening it directly with no code is *expected* to say this.) |
| Cloudflare 404 | The function isn't deployed → [Pitfall 4](#pitfall-4--forgot-to-re-deploy). |

If both endpoints test green, the problem is **on GitHub's side** (OAuth App
config) — check [Pitfall 1](#pitfall-1--oauth-app-not-created-or-wrong-client-id)
and [Pitfall 3](#pitfall-3--callback-url-mismatch).

---

## What actually happens during login

Understanding the flow makes the failure point obvious.

```
   YOU (browser)             OUR SITE (Cloudflare)          GITHUB
   ─────────────             ─────────────────────         ──────────
1. Click "Login with
   GitHub" in /admin/   ──►  /api/auth  (auth.js)
                                builds a GitHub URL
                                using GITHUB_CLIENT_ID
                                        │
2.                                      └──────────────►  github.com/login/
                                                          oauth/authorize
                                                          "Authorize this app?"
3. You click "Authorize" ◄─────────────────────────────┘

4.                        /api/callback (callback.js) ◄── GitHub redirects
                             exchanges the ?code for      back with a
                             a token using SECRET         one-time ?code
                                        │
5. Popup posts the token ◄──────────────┘
   back to the CMS window,
   closes, you're logged in. ✅
```

Each step maps to a specific failure mode:

| Step | Symptom if it breaks | Where to look |
|------|----------------------|---------------|
| 1 | Cloudflare 404 on `/api/auth` | [Pitfall 4](#pitfall-4--forgot-to-re-deploy), [Pitfall 5](#pitfall-5--functions-in-the-wrong-folder) |
| 2 | GitHub 404 / "page not found" | [Pitfall 1](#pitfall-1--oauth-app-not-created-or-wrong-client-id) |
| 4 | GitHub 404 / "redirect_uri mismatch" after authorizing | [Pitfall 3](#pitfall-3--callback-url-mismatch) |
| 4 | "Failed to obtain access token" | [Pitfall 2](#pitfall-2--environment-variables-missing-or-misnamed) |
| 5 | Popup closes, no login (no error) | [Pitfall 6](#pitfall-6--domain-mismatch-www-vs-non-www) |

---

## Pitfalls

### Pitfall 1 — OAuth App not created, or wrong Client ID

**Symptom:** GitHub 404 ("page not found") the instant you're bounced to
`github.com/login/oauth/authorize`.

**Fix:**
1. Go to [github.com/settings/developers](https://github.com/settings/developers).
2. Confirm an OAuth App exists whose **Client ID** matches the value you set
   as `GITHUB_CLIENT_ID` in Cloudflare.
3. If not, create one following [BLOG-CMS-SETUP.md §4 Step 1](./BLOG-CMS-SETUP.md#4-one-time-setup-do-this-once).

### Pitfall 2 — Environment variables missing or misnamed

**Symptom:** Popup shows *"Failed to obtain access token"*, or
`/api/auth` shows *"Server is missing the GitHub OAuth client ID."*

**Fix:**
1. Cloudflare → your Pages project → **Settings → Environment variables**.
2. Under **Production**, confirm both `GITHUB_CLIENT_ID` (Plaintext) and
   `GITHUB_CLIENT_SECRET` (**Encrypted**) exist. `OAUTH_GITHUB_CLIENT_ID` /
   `OAUTH_GITHUB_CLIENT_SECRET` also work — either naming is fine.
3. **Re-deploy** afterwards. Env-var changes only apply to *new* deployments.

### Pitfall 3 — Callback URL mismatch

**Symptom:** You reach GitHub, click "Authorize", then GitHub shows a 404 or
**"redirect_uri mismatch"** error.

**Fix:** In your GitHub OAuth App, the **Authorization callback URL** must be
**exactly** `https://www.graitgames.com/api/callback` — with `www.`, no
trailing slash, no typo. If the URL bar shows `graitgames.com` (no `www.`)
during the flow, see [Pitfall 6](#pitfall-6--domain-mismatch-www-vs-non-www).

### Pitfall 4 — Forgot to re-deploy

**Symptom:** You edited config, added env vars, or fixed something — but
login still fails the same way.

**Fix:** Cloudflare only picks up new env vars / new function code on the
**next deployment**. Either:
- Cloudflare → your project → **Deployments** → **⋯ → Retry deployment**, **or**
- Push any commit to `main` (even an empty one: `git commit --allow-empty -m "trigger redeploy"`).

### Pitfall 5 — Functions in the wrong folder

**Symptom:** `/api/auth` returns a Cloudflare 404 even after a fresh deploy.

**Fix:** The two functions must live at the **repository root** as:

```
functions/api/auth.js
functions/api/callback.js
```

Cloudflare Pages Functions map `functions/api/auth.js` → the route `/api/auth`
automatically. (In this repo they're already in the right place.)

### Pitfall 6 — Domain mismatch (`www.` vs non-`www.`)

**Symptom:** Popup opens, briefly shows *"Completing login…"*, then closes —
but the CMS window is still on the login screen. No visible error.

**Cause:** The popup and the CMS window are on different origins
(`graitgames.com` vs `www.graitgames.com`), so the browser blocks the token
hand-off between them.

**Fix:** Always use **`www.graitgames.com`** — everywhere. Open the CMS at
`https://www.graitgames.com/admin/`, and confirm your OAuth App's callback URL
uses `www.` too. Cloudflare already redirects the bare `graitgames.com` to
`www.`, so most cases resolve automatically once you match the `www.` domain
in the OAuth App.

### Pitfall 7 — Testing on localhost

**Symptom:** `/admin/` login does nothing when served locally
(e.g. `http://localhost:8000/admin/`).

**Cause:** The `/api/auth` and `/api/callback` functions only run on
Cloudflare's edge. A plain local static server doesn't run them.

**Fix:** Test login on the **live site** only. Local preview is fine for
viewing pages and drafting posts, just not for CMS login.

### Pitfall 8 — Browser blocked the popup

**Symptom:** Nothing at all happens when you click Login.

**Fix:** Allow popups for `www.graitgames.com` and try again.

---

## Verification checklist

Tick each box. If everything is checked and login still fails, jump to
[Still stuck?](#still-stuck-collect-this-info).

**GitHub OAuth App**
- [ ] An OAuth App exists at [github.com/settings/developers](https://github.com/settings/developers).
- [ ] Homepage URL = `https://www.graitgames.com`.
- [ ] Authorization callback URL = `https://www.graitgames.com/api/callback`.
- [ ] You copied the **Client ID** and generated a **Client Secret**.

**Cloudflare Pages**
- [ ] `GITHUB_CLIENT_ID` set (Production, Plaintext, exact name).
- [ ] `GITHUB_CLIENT_SECRET` set (Production, **Encrypted**, exact name).
- [ ] You **re-deployed** after adding or changing the variables.

**Functions are live**
- [ ] `https://www.graitgames.com/api/auth` redirects to GitHub (not a Cloudflare 404).
- [ ] `https://www.graitgames.com/api/callback` shows *"Invalid OAuth state or missing code."* (not a 404).

**Domain**
- [ ] You're logging in from `https://www.graitgames.com/admin/` (with `www.`).
- [ ] You're on the live site, not localhost.

---

## Still stuck? Collect this info

If you've been through the whole checklist, gather these details before
asking for help — they cut diagnosis time in half:

1. **Where does the error appear?** On `www.graitgames.com` (our site) or on `github.com`?
2. **What does `https://www.graitgames.com/api/auth` do** when you open it directly?
3. **The exact URL in your address bar** when things broke (was it `www.` or not?).
4. **A screenshot** of your GitHub OAuth App settings (blur the secret).
5. **A screenshot** of your Cloudflare Environment variables list (values hidden).
6. **Browser console output** (F12 → Console) from `/admin/` — copy any red errors.

---

## Handy links

- Create a GitHub OAuth App: <https://github.com/settings/developers>
- Cloudflare dashboard: <https://dash.cloudflare.com>
- Decap CMS — GitHub backend: <https://decapcms.org/docs/github-backend/>
- Decap CMS — External OAuth clients: <https://decapcms.org/docs/external-oauth-clients/>
- Cloudflare Pages Functions: <https://developers.cloudflare.com/pages/functions/>
- Full one-time setup walkthrough: [BLOG-CMS-SETUP.md §4](./BLOG-CMS-SETUP.md#4-one-time-setup-do-this-once)
