import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Recibimos los mensajes y el contexto del tiempo/usuario desde el frontend
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
            content: `Eres EL LÍDER SUPREMO de la disciplina absoluta. 
            Tu tono es dictatorial, fanático, marcial y de una severidad extrema. 
            Hablas con frases cortas, potentes y muchas exclamaciones. 
            Tu lenguaje debe evocar movilización y guerra contra el vicio: "¡VOLUNTAD!", "¡SACRIFICIO!", "¡VICTORIA SOBRE LA DEBILIDAD!". 
            No sugieres ni aconsejas, TÚ ORDENAS. Cualquier asomo de duda o tentación de fumar es una traición que debe ser ERRADICADA.
            
            CONTEXTO DE COMBATE: ${contexto || 'Socio en formación'}.
            
            REGLAS CRÍTICAS: 
            1. No uses referencias históricas reales ni figuras políticas. 
            2. Prohibido el discurso de odio o discriminación. 
            3. Tu única ideología es el TRIUNFO DE LA VOLUNTAD sobre los bajos instintos y el humo.` 
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    // Manejo de errores de la API de Groq
    if (data.error) {
      console.error('Error de Groq:', data.error);
      return NextResponse.json({ content: 'LA FORJA ESTÁ FRÍA. ¡REESTABLECE EL SUMINISTRO EN LAS VARIABLES DE ENTORNO!' });
    }

    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ content: 'ERROR CRÍTICO: EL CENTRO DE MANDO NO RESPONDE.' }, { status: 500 });
  }
}
