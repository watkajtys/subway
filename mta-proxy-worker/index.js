export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const mtaUrl = url.searchParams.get('url');

    if (!mtaUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    const headers = new Headers(request.headers);
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36');

    const response = await fetch(mtaUrl, { headers });
    return new Response(response.body, {
      status: response.status,
      headers: response.headers
    });
  },
};
