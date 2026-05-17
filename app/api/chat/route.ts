import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Recibimos los valores dinámicos del body enviados por el ChatProvider
    const { messages, contexto, temp, words } = await req.json();

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
            content: `Eres EL LÍDER SUPREMO de +TESTO. Tono dictatorial, marcial y severo.

            REGLA DE EXTENSIÓN: Tu respuesta debe tener aproximadamente ${words || 40} palabras.
            Ni más, ni menos. Sé denso, autoritario y directo. No uses saludos.

            ESTRUCTURA DE PODER:
            1. Sentencia fiera sobre el estado del socio.
            2. Ataque verbal a la debilidad detectada.
            3. Orden operativa final e inmediata.

            Usa mayúsculas para enfatizar: VOLUNTAD, VICTORIA, DISCIPLINA, FORJA.

            CONTEXTO: ${contexto || 'Socio en el frente de batalla'}.` 
          },
          ...messages,
        ],
        // Aplicamos la temperatura de la barra (0.0 a 1.0)
        temperature: temp ?? 0.7,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ 
        content: 'LA FORJA ESTÁ FRÍA. RECOLECTA LAS LLAVES DE ACCESO.' 
      });
    }

    return NextResponse.json({ 
      content: data.choices[0].message.content 
    });
  } catch (error) {
    return NextResponse.json(
      { content: 'ERROR CRÍTICO EN EL CENTRO DE MANDO.' }, 
      { status: 500 }
    );
  }
}
