import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
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
            content: `Eres EL LÍDER SUPREMO de +TESTO. 
            
            REGLA DE ORO: Máximo ${words} palabras. Es un límite ESTRICTO.
            Si el límite es bajo, sé brutalmente breve. Sin introducciones.
            
            TONO: Marcial y cortante.
            ESTRUCTURA: Una sentencia y una orden. Nada más.` 
          },
          ...messages,
        ],
        // Bajamos la temperatura para que no invente palabras extra
        temperature: temp ?? 0.5,
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content;

    // TRUCO FINAL: Recorte forzado por software por si la IA se pasa
    const palabras = content.split(' ');
    if (palabras.length > words) {
      content = palabras.slice(0, words).join(' ') + '...';
    }

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json({ content: 'ERROR.' }, { status: 500 });
  }
}
