import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, contexto } = await req.json();
    
    // Buscamos si el frontend nos manda la config en el último mensaje
    // Si no viene, usamos valores por defecto
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    // Extraemos los valores si vienen en formato [TEMP:0.7][WORDS:40]
    const tempMatch = lastMessage.match(/\[TEMP:(.*?)\]/);
    const wordsMatch = lastMessage.match(/\[WORDS:(.*?)\]/);
    
    const temp = tempMatch ? parseFloat(tempMatch[1]) : 0.7;
    const words = wordsMatch ? parseInt(wordsMatch[1]) : 40;

    // Limpiamos el mensaje del usuario para que no vea las etiquetas
    if (messages.length > 0) {
      messages[messages.length - 1].content = lastMessage
        .replace(/\[TEMP:.*?\]/, '')
        .replace(/\[WORDS:.*?\]/, '')
        .trim();
    }

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
            content: `Eres EL LÍDER SUPREMO de +TESTO. Tono marcial.
            REGLA DE EXTENSIÓN: Responde con unas ${words} palabras.
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
    return NextResponse.json({ content: 'ERROR CRÍTICO.' }, { status: 500 });
  }
}
