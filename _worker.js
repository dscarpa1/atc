export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // POST /submit — save a response
    if (request.method === 'POST' && url.pathname === '/submit') {
      try {
        const body = await request.json();
        const { name, responses } = body;

        if (!name || !responses) {
          return new Response(JSON.stringify({ error: 'Missing data' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const key = `r_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        await env.RESPONSES.put(key, JSON.stringify({
          name: name.trim(),
          responses,
          submittedAt: new Date().toISOString(),
        }));

        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // GET /responses — return all responses
    if (request.method === 'GET' && url.pathname === '/responses') {
      try {
        const list = await env.RESPONSES.list({ prefix: 'r_' });
        const results = [];

        for (const key of list.keys) {
          const val = await env.RESPONSES.get(key.name);
          if (val) results.push(JSON.parse(val));
        }

        results.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

        return new Response(JSON.stringify(results), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch {
        return new Response(JSON.stringify({ error: 'Server error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // Serve static assets (index.html, summary.html, etc.)
    return env.ASSETS.fetch(request);
  },
};
