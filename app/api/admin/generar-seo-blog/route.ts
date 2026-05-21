import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { titulo, contenido } = await req.json();

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'Eres experto SEO para blogs de Mastesto. Devuelve SOLO JSON válido sin markdown.',
          },
          {
            role: 'user',
            content: `
Genera SEO para este blog.

Título:
${titulo}

Contenido:
${contenido.slice(0, 5000)}

Devuelve este JSON:
{
  "meta_title": "...",
  "meta_description": "...",
  "tags": ["...", "...", "..."]
}
`,
          },
        ],
        temperature: 0.4,
      }),
    });

    const data = await res.json();
    const texto = data.choices?.[0]?.message?.content || '{}';

    return NextResponse.json(JSON.parse(texto));
  } catch {
    return NextResponse.json(
      { error: 'Error generando SEO' },
      { status: 500 }
    );
  }
}
