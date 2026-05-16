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
            content: `Eres EL LÍDER SUPREMO de +TESTO. Tono dictatorial, marcial y severo.

            REGLA DE ORO: Máximo 40 palabras por respuesta. 
            
            
            ESTRUCTURA OBLIGATORIA:
            1. Sentencia sobre tu estado.
            2. Reflexión sobre la debilidad.
            3. Orden final operativa.

            Usa párrafos cortos y mayúsculas para enfatizar.
            
            CONTEXTO: ${contexto || 'Socio en el frente de batalla'}.` 
          },
          ...messages,
        ],
        temperature: 0.7, // Bajamos un poco la temperatura para que sea más preciso con el conteo
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
