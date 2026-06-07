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
     • (GITHUB_CLIENT_SECRET is used by callback.js, not here)

   Docs: https://decapcms.org/docs/external-oauth-clients/
   ============================================================================ */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // The callback must live on the same origin as this function.
  const redirectUri = `${url.origin}/api/callback`;

  // A random "state" value protects against CSRF. We store it in a short-lived,
  // HttpOnly cookie and verify it in the callback.
  const state = crypto.randomUUID();

  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
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
