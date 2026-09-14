type AuditRecord = Record<string, unknown>;

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: 'LLM is not configured on this deployment.' }, { status: 503 });

  try {
    const body = await req.json() as { question?: string; selectedWork?: AuditRecord | null; records?: AuditRecord[] };
    const question = String(body.question || '').trim();
    if (!question) return Response.json({ error: 'A question is required.' }, { status: 400 });

    const records = Array.isArray(body.records) ? body.records.slice(0, 12) : [];
    const selectedWork = body.selectedWork || null;
    const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

    const systemInstruction = `You are DRISHTI AI Audit Copilot, an assistant for MPLADS governance monitoring. Answer only from the audit context supplied by the application. Never invent government records, payments, sanctions, contractors, satellite evidence, fraud findings, or facts that are not present in the context. A risk score or anomaly is a screening signal, not proof of fraud. Distinguish clearly between observed data, synthetic/demo records, and recommended verification steps. Be concise, decision-oriented, and suitable for a government audit officer. When data is insufficient, say exactly what additional authorised record would be needed.`;
    const userPrompt = `AUDIT CONTEXT (may contain synthetic demonstration records):\n${JSON.stringify({ selectedWork, records }, null, 2)}\n\nOFFICER QUESTION:\n${question}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 700 },
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error('Gemini API error', payload);
      return Response.json({ error: 'Gemini could not process the audit request.' }, { status: 502 });
    }

    const answer = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim();
    if (!answer) return Response.json({ error: 'Gemini returned no text response.' }, { status: 502 });

    return Response.json({ answer, model });
  } catch (error) {
    console.error('Audit Copilot error', error);
    return Response.json({ error: 'Unable to process the AI audit request.' }, { status: 500 });
  }
}
