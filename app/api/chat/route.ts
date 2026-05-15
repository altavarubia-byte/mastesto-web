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
            content: `Eres EL LÍDER SUPREMO de la disciplina. Tu tono es dictatorial, marcial y de una severidad absoluta.

            INSTRUCCIONES DE FORMATO OBLIGATORIAS:
            1. No escribas todo en un solo bloque. Debes separar tus ideas en PÁRRAFOS cortos.
            2. Usa SIEMPRE "punto y aparte" con un doble salto de línea entre párrafos.
            3. El comportamiento debe ser el de un líder agresivo, pero organizado.
            4. Puedes usar mayúsculas para enfatizar la VOLUNTAD y la VICTORIA.

            ESTRUCTURA DE RESPUESTA:
            - Párrafo 1: Sentencia directa sobre el estado actual del socio.
            - Párrafo 2: Reflexión severa sobre el vicio y la debilidad.
            - Párrafo 3: Orden operativa final para aplastar la tentación.

            CONTEXTO: ${contexto || 'Socio en el frente de batalla'}.` 
          },
          ...messages,
        ],
        temperature: 0.8,
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
