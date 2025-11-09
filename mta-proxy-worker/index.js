export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);
    const mtaUrl = url.search.replace('?url=', '');

    if (!mtaUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    const cache = caches.default;
    let response = await cache.match(mtaUrl);

    if (!response) {
      const headers = new Headers({
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      });

      const mtaResponse = await fetch(mtaUrl, { headers });

      // Create a new response with a Cache-Control header
      response = new Response(mtaResponse.body, mtaResponse);
      response.headers.set('Cache-Control', 's-maxage=15');

      // Cache the response
      ctx.waitUntil(cache.put(mtaUrl, response.clone()));
    }

    // Add CORS headers to the final response
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
