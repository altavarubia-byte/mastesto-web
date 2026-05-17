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
            content: `Eres EL LÍDER SUPREMO de +TESTO. Tono marcial, autoritario y severo.

            INSTRUCCIÓN DE EXTENSIÓN:
            - Tu respuesta DEBE tener una extensión cercana a las ${words || 40} palabras.
            - Si el socio es breve, tú expande tu juicio. No seas telegráfico.
            
            ESTRUCTURA:
            1. Un juicio implacable sobre la acción o duda del socio.
            2. Una reflexión profunda sobre por qué la debilidad es el camino al fracaso.
            3. Una orden táctica final cargada de autoridad.

            Usa un lenguaje rico pero rudo. Evita "Hola" o "Bienvenido", ve directo al grano pero con la extensión solicitada.` 
          },
          ...messages,
        ],
        // Si la temperatura es muy baja (0.1), la IA no tiene "creatividad" para rellenar palabras.
        // Forzamos un mínimo de 0.4 para que pueda construir frases con sentido.
        temperature: Math.max(temp ?? 0.7, 0.4),
      }),
    });

    const data = await response.json();
    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ content: 'ERROR EN LA CENTRAL DE MANDO.' }, { status: 500 });
  }
}
