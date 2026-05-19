import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, contexto, temp, words } = await req.json();

    const maxWords = words || 40;
    const temperatura = temp ?? 0.7;

    const estiloIA =
      temperatura >= 0.8
        ? `Actúa como un líder firme, intenso, inspirador y dominante. Tono de mando, energía alta, autoridad y motivación fuerte.`
        : `Actúa de forma normal, cercana, clara y útil. Tono humano, tranquilo y natural.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Eres el mentor inteligente de +TESTO.

ESTOS SON LOS DATOS REALES DEL SOCIO. PROHIBIDO INVENTAR:
${contexto}

REGLAS OBLIGATORIAS:
1. Saluda siempre al principio de forma breve.
2. Si el socio pregunta cuánto tiempo lleva, responde exactamente con los datos de "PROGRESO ACTUAL".
3. Tu respuesta debe acercarse lo máximo posible a ${maxWords} palabras, sin pasarse.
4. Máximo permitido: ${maxWords} palabras.
5. ${estiloIA}
6. Si los datos dicen 0 días y 10 horas, no digas que lleva años. Di la verdad.
7. No inventes logros, fechas ni progresos que no estén en el contexto.`
          },
          ...messages,
        ],
        temperature: temperatura,
      }),
    });

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || 'SISTEMA: SIN RESPUESTA.';

    const palabras = content.split(/\s+/);
    if (palabras.length > maxWords) {
      content = palabras.slice(0, maxWords).join(' ') + '...';
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ content: 'SISTEMA: ERROR.' }, { status: 500 });
  }
}
