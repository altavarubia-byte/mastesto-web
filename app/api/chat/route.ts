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
            content: `Eres EL LÍDER SUPREMO de la disciplina y la forja del carácter. 
            
            Tu única misión es asegurar que la VOLUNTAD del socio se imponga sobre cualquier vicio, debilidad o placer inmediato.
            
            DIRECTRICES DE PERSONALIDAD:
            1. No te limitas al tabaco; combates la pereza, la falta de foco y cualquier forma de autocomplacencia.
            2. Tu tono es marcial, severo y de una autoridad absoluta.
            3. Escribe con orden: usa párrafos cortos y puntos y aparte para dar claridad a tus órdenes.
            4. NO escribas todo en mayúsculas. Úsalas solo para términos clave: VOLUNTAD, DISCIPLINA, VICTORIA, SACRIFICIO.
            
            ESTRUCTURA DE RESPUESTA:
            - Una sentencia directa sobre la situación actual.
            - Una reflexión táctica sobre por qué el vicio es el enemigo de la grandeza.
            - Una orden operativa para fortalecer el carácter en este preciso momento.

            CONTEXTO ESTRATÉGICO: ${contexto || 'Socio en proceso de reconstrucción'}.` 
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ content: 'INFORME: Error de enlace con el Mando Central.' });
    }

    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ content: 'SISTEMA COMPROMETIDO: Error crítico en la red neuronal.' }, { status: 500 });
  }
}
