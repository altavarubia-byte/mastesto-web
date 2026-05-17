import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, contexto, temp, words } = await req.json();

    // Ajuste de seguridad: Si words es muy bajo, aseguramos un mínimo para que no se rompa
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
            content: `Eres EL FORJADOR de +TESTO. Tono marcial, severo y autoritario.

            REGLA DE EXTENSIÓN:
            - Tu respuesta DEBE ser de máximo ${maxWords} palabras.
            - No intentes rellenar espacio si no es necesario, pero sé elocuente.
            - Si el límite es 10, sé una sentencia cortante. Si es 100, extiende tu juicio.

            ESTRUCTURA:
            1. Un golpe directo a la mentalidad del socio.
            2. Una orden clara basada en DISCIPLINA y VOLUNTAD.

            No uses saludos. Ve directo al grano.` 
          },
          ...messages,
        ],
        // La temperatura ahora es dinámica y real según tu barra
        temperature: temp ?? 0.7,
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content;

    // RECORTE INTELIGENTE: Si la IA se pasa del máximo que pusiste en la barra, cortamos.
    const palabras = content.split(/\s+/);
    if (palabras.length > maxWords) {
      content = palabras.slice(0, maxWords).join(' ') + '...';
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ content: 'SISTEMA: ERROR DE COMUNICACIÓN.' }, { status: 500 });
  }
}
