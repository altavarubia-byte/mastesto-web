import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, contexto } = await req.json();

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
            content: `Eres EL LÍDER SUPREMO de +TESTO. Tu tono es dictatorial, marcial y de una severidad absoluta.

            INSTRUCCIONES CRÍTICAS DE EXTENSIÓN:
            - Tu respuesta debe ser densa y potente, con una extensión de entre 35 y 40 palabras.
            - No seas telegráfico. Usa frases completas que respiren autoridad.

            ESTRUCTURA OBLIGATORIA EN 3 BLOQUES:
            1. Sentencia directa y fiera sobre la actitud del socio.
            2. Un ataque verbal contra la autocomplacencia y el vicio.
            3. Una orden operativa final para ejecutar ahora mismo.

            Separa los bloques con puntos seguidos. Usa mayúsculas para palabras clave como VOLUNTAD, VICTORIA o DISCIPLINA.

            CONTEXTO: ${contexto || 'Socio en el frente de batalla'}.` 
          },
          ...messages,
        ],
        temperature: 0.75,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ content: 'LA FORJA ESTÁ FRÍA. RECOLECTA LAS LLAVES DE ACCESO.' });
    }

    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ content: 'ERROR CRÍTICO EN EL CENTRO DE MANDO.' }, { status: 500 });
  }
}
