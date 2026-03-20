export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { name, responses } = body;

    if (!name || !responses) {
      return new Response(JSON.stringify({ error: 'Missing data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const key = `r_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    await env.RESPONSES.put(key, JSON.stringify({
      name: name.trim(),
      responses,
      submittedAt: new Date().toISOString(),
    }));

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
