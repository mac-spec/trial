export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'content-type': 'application/json' } });
  const clientId = process.env.COPERNICUS_CLIENT_ID;
  const clientSecret = process.env.COPERNICUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) return new Response(JSON.stringify({ error: 'Copernicus server credentials are not configured.' }), { status: 503, headers: { 'content-type': 'application/json' } });
  try {
    const body = new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret });
    const upstream = await fetch('https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body });
    const data = await upstream.text();
    return new Response(data, { status: upstream.status, headers: { 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Authentication request failed' }), { status: 502, headers: { 'content-type': 'application/json' } });
  }
}
