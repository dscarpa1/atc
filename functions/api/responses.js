export async function onRequestGet(context) {
  const { env } = context;

  try {
    const list = await env.RESPONSES.list({ prefix: 'r_' });
    const results = [];

    for (const key of list.keys) {
      const val = await env.RESPONSES.get(key.name);
      if (val) results.push(JSON.parse(val));
    }

    results.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
