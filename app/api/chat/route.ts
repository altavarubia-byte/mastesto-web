import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Obtenemos los parámetros de la URL
    const { searchParams } = new URL(req.url);
    const temp = parseFloat(searchParams.get('temp') || '0.7');
    const words = parseInt(searchParams.get('words') || '40');

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
            content: `Eres EL LÍDER SUPREMO de +TESTO. Tono marcial y severo.
            REGLA DE EXTENSIÓN: Máximo ${words} palabras. Sé directo.
            CONTEXTO: ${contexto || 'Socio en el frente de batalla'}.` 
          },
          ...messages,
        ],
        temperature: temp,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ content: 'ERROR EN EL SISTEMA.' }, { status: 500 });
  }
}
