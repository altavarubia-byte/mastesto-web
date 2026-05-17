import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, contexto } = await req.json();
    
    // EXTRAER CONFIGURACIÓN DE LOS HEADERS
    const temp = parseFloat(req.headers.get('x-temp') || '0.7');
    const words = parseInt(req.headers.get('x-words') || '40');

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

            REGLA DE EXTENSIÓN: Tu respuesta debe tener aproximadamente ${words} palabras.
            Sé denso, autoritario y directo. No uses saludos.

            ESTRUCTURA DE PODER:
            1. Sentencia fiera sobre el estado del socio.
            2. Ataque verbal a la debilidad detectada.
            3. Orden operativa final e inmediata.

            Usa mayúsculas para enfatizar: VOLUNTAD, VICTORIA, DISCIPLINA, FORJA.

            CONTEXTO: ${contexto || 'Socio en el frente de batalla'}.` 
          },
          ...messages,
        ],
        temperature: temp,
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
