/* ============================================================================
   CLOUDFLARE PAGES FUNCTION — /api/callback
   ----------------------------------------------------------------------------
   Step 2 of the GitHub login flow for Decap CMS.

   GitHub redirects here (with a one-time ?code=...) after you approve access.
   We:
     1. Verify the CSRF "state" matches the cookie we set in auth.js.
     2. Exchange the code for a GitHub access token (server-side, using the
        secret — this is why a static site alone can't do it).
     3. Return a tiny HTML page that hands the token back to the Decap CMS
        window via postMessage, then closes the popup.

   REQUIRED ENVIRONMENT VARIABLES (Cloudflare Pages → Settings → Variables):
     • GITHUB_CLIENT_ID       (or OAUTH_GITHUB_CLIENT_ID)
     • GITHUB_CLIENT_SECRET   (or OAUTH_GITHUB_CLIENT_SECRET — mark as "encrypted")

   Docs: https://decapcms.org/docs/external-oauth-clients/
   ============================================================================ */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const returnedState = url.searchParams.get("state");

  // --- 1. CSRF check: the state in the URL must match our cookie ---------
  const cookie = request.headers.get("Cookie") || "";
  const savedState = (cookie.match(/csrf_state=([^;]+)/) || [])[1];

  if (!code || !returnedState || returnedState !== savedState) {
    return new Response("Invalid OAuth state or missing code.", { status: 400 });
  }

  // Accept either naming convention (plain or OAUTH_-prefixed) so a dashboard
  // typo/prefix doesn't break login. Must match what auth.js used.
  const clientId = env.GITHUB_CLIENT_ID || env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET || env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return postMessagePage("error", {
      message:
        "Server is missing GitHub OAuth credentials. Add GITHUB_CLIENT_ID and " +
        "GITHUB_CLIENT_SECRET (or the OAUTH_-prefixed names) in Cloudflare Pages " +
        "→ Settings → Variables, then re-deploy.",
    });
  }

  // --- 2. Exchange the code for an access token --------------------------
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${url.origin}/api/callback`,
    }),
  });

  const tokenData = await tokenRes.json();

  if (tokenData.error || !tokenData.access_token) {
    return postMessagePage("error", {
      message: tokenData.error_description || "Failed to obtain access token.",
    });
  }

  // --- 3. Hand the token back to the Decap CMS window --------------------
  return postMessagePage("success", {
    token: tokenData.access_token,
    provider: "github",
  });
}

/* ----------------------------------------------------------------------------
   Helper: returns the small HTML page Decap CMS expects, implementing the
   EXACT postMessage handshake Decap/Netlify CMS uses for external OAuth.

   The handshake order matters (this is what previously broke login — the
   popup closed but the user was never logged in):

     1. POPUP  → opener:  "authorizing:github"               (we start it)
     2. CMS    → popup:   "authorizing:github"               (acknowledgement)
     3. POPUP  → opener:  "authorization:github:success:{…}" (the real token)
     4. CMS receives the token, closes the popup, and logs you in.

   The old code skipped step 1 and blindly sent the step-3 message before the
   CMS had swapped its listener to receive it, so the token was dropped.
   ---------------------------------------------------------------------------- */
function postMessagePage(status, payload) {
  const provider = "github";
  const message = `authorization:${provider}:${status}:${JSON.stringify(payload)}`;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Authorizing…</title></head>
  <body>
    <p style="font-family: sans-serif;">Completing GitHub login… you can close this window.</p>
    <script>
      (function () {
        var authMessage = ${JSON.stringify(message)};
        var provider = ${JSON.stringify(provider)};

        // If this page wasn't opened by the CMS (e.g. visited directly),
        // there's no opener to talk to.
        if (!window.opener) {
          document.body.innerText =
            "This window must be opened by the CMS login button. Please close it and try again.";
          return;
        }

        // Step 2 → 3: when the CMS acknowledges our handshake, send the token.
        function receiveMessage(e) {
          window.opener.postMessage(authMessage, e.origin || "*");
          window.removeEventListener("message", receiveMessage, false);
          // Give the opener a moment to process, then close the popup.
          setTimeout(function () { window.close(); }, 600);
        }
        window.addEventListener("message", receiveMessage, false);

        // Step 1: kick off the handshake the CMS is waiting for.
        window.opener.postMessage("authorizing:" + provider, "*");
      })();
    </script>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Clear the CSRF cookie now that we're done with it.
      "Set-Cookie": "csrf_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    },
  });
}
