const BACKEND = process.env.BACKEND_URL || 'https://hdx1ca-backend.vercel.app';
const SECRET  = process.env.API_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!SECRET) return res.status(500).json({ error: 'API_SECRET env var not set' });

  const upstream = await fetch(`${BACKEND}/api/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-SECRET': SECRET },
    body: JSON.stringify(req.body),
  });

  const json = await upstream.json().catch(() => ({}));
  res.status(upstream.status).json(json);
}
