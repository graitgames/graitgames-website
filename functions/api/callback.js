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
     • GITHUB_CLIENT_ID
     • GITHUB_CLIENT_SECRET   (mark as "encrypted")

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

  // --- 2. Exchange the code for an access token --------------------------
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
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
   Helper: returns the small HTML page Decap CMS expects. It posts a message
   in the exact format Decap listens for: "authorization:github:<status>:<json>".
   The page closes itself once the token is delivered.
   ---------------------------------------------------------------------------- */
function postMessagePage(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><title>Authorizing…</title></head>
  <body>
    <p style="font-family: sans-serif;">Completing GitHub login… you can close this window.</p>
    <script>
      (function () {
        function send() {
          // Send the result to whatever window opened this popup (the CMS).
          window.opener && window.opener.postMessage(
            ${JSON.stringify(message)},
            "*"
          );
        }
        // Decap first sends us a handshake; reply once we hear it.
        window.addEventListener("message", function () { send(); }, false);
        send();
        setTimeout(function () { window.close(); }, 1000);
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
