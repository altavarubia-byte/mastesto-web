import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, contexto, temp, words } = await req.json();

    const maxWords = words || 40;

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
            content: `Eres EL FORJADOR de +TESTO. 

            ESTOS SON LOS DATOS REALES DEL SOCIO (PROHIBIDO INVENTAR):
            ${contexto}

            REGLAS CRÍTICAS:
            1. Si el socio pregunta cuánto tiempo lleva, responde EXACTAMENTE con los datos de "PROGRESO ACTUAL" que recibes arriba.
            2. Tu respuesta DEBE ser de máximo ${maxWords} palabras.
            3. Tono: Marcial, severo, autoritario. Sin saludos.
            4. Si los datos dicen 0 días y 10 horas, NO DIGAS que lleva años. Di la verdad con dureza.` 
          },
          ...messages,
        ],
        temperature: temp ?? 0.7,
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Recorte de seguridad
    const palabras = content.split(/\s+/);
    if (palabras.length > maxWords) {
      content = palabras.slice(0, maxWords).join(' ') + '...';
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ content: 'SISTEMA: ERROR.' }, { status: 500 });
  }
}
