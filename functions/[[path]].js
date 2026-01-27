// Cloudflare Pages Function: 301 Redirect for old stock URLs
// Redirects /{6-digit-code} to /stocks/{6-digit-code}

export async function onRequest(context) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = params.path ? params.path.join('/') : '';

  // Check if the path is exactly a 6-digit stock code (not under /stocks/)
  // Pattern: exactly 6 digits, no slashes, not already under /stocks/
  const stockCodeRegex = /^[0-9]{6}$/;

  if (stockCodeRegex.test(path)) {
    // This is an old-style stock URL, redirect to new /stocks/ prefix
    const newUrl = `${url.origin}/stocks/${path}`;

    return new Response(null, {
      status: 301,
      headers: {
        'Location': newUrl,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });
  }

  // For all other paths, pass through to the static assets (SPA)
  return context.next();
}
