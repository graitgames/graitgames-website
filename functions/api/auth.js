/* ============================================================================
   CLOUDFLARE PAGES FUNCTION — /api/auth
   ----------------------------------------------------------------------------
   Step 1 of the GitHub login flow for Decap CMS.

   When you click "Login with GitHub" in /admin/, Decap opens this endpoint.
   We simply redirect the browser to GitHub's authorization screen, asking for
   permission to read/write the repository ("repo" scope). After you approve,
   GitHub sends the browser back to /api/callback (see callback.js).

   REQUIRED ENVIRONMENT VARIABLES (set in Cloudflare Pages → Settings → Vars):
     • GITHUB_CLIENT_ID      — from your GitHub OAuth App
       (the OAUTH_GITHUB_CLIENT_ID name is also accepted as a fallback)
     • (GITHUB_CLIENT_SECRET is used by callback.js, not here)

   Docs: https://decapcms.org/docs/external-oauth-clients/
   ============================================================================ */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Accept either naming convention so a small typo/prefix in the Cloudflare
  // dashboard doesn't break login. Both GITHUB_CLIENT_ID and the OAUTH_-prefixed
  // form work. If neither is set, fail loudly instead of silently sending an
  // undefined client_id to GitHub (which produces a confusing GitHub 404).
  const clientId = env.GITHUB_CLIENT_ID || env.OAUTH_GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response(
      "Server is missing the GitHub OAuth client ID. In Cloudflare Pages → " +
        "Settings → Variables, add GITHUB_CLIENT_ID (or OAUTH_GITHUB_CLIENT_ID) " +
        "and re-deploy.",
      { status: 500, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }

  // The callback must live on the same origin as this function.
  const redirectUri = `${url.origin}/api/callback`;

  // A random "state" value protects against CSRF. We store it in a short-lived,
  // HttpOnly cookie and verify it in the callback.
  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("scope", "repo");        // read/write repo content
  authorizeUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizeUrl.toString(),
      // Cookie is cleared after 10 minutes; SameSite=Lax is fine for OAuth redirects.
      "Set-Cookie": `csrf_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
