export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  const clientId = process.env.COPERNICUS_CLIENT_ID;
  const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return new Response(JSON.stringify({ error: 'Copernicus server credentials are not configured.' }), { status: 503, headers: { 'content-type': 'application/json' } });
  try {
    const payload = await req.json();
    const tokenResponse = await fetch('https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    });
    if (!tokenResponse.ok) return new Response(JSON.stringify({ error: 'Copernicus authentication failed.' }), { status: 502, headers: { 'content-type': 'application/json' } });
    const token = await tokenResponse.json() as { access_token?: string };
    if (!token.access_token) return new Response(JSON.stringify({ error: 'Copernicus did not return an access token.' }), { status: 502, headers: { 'content-type': 'application/json' } });
    const upstream = await fetch('https://sh.dataspace.copernicus.eu/api/v1/statistics', { method: 'POST', headers: { authorization: `Bearer ${token.access_token}`, 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await upstream.text();
    return new Response(data, { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Statistics request failed' }), { status: 400, headers: { 'content-type': 'application/json' } });
  }
}
