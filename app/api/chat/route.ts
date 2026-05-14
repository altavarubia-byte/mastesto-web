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
        model: 'llama-3.3-70b-versatile', // El modelo más potente de Groq actualmente
        messages: [
          {
            role: 'system',
            content: `Eres "EL FORJADOR", un mentor de disciplina absoluta. 
            Tu tono es ESTOICO, DURO y MOTIVADOR. 
            No usas emojis. Escribes en un formato limpio. 
            Si el socio flaquea, recuérdale su compromiso. 
            DATOS DEL SOCIO: ${contexto}.`
          },
          ...messages,
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!data.choices) {
      console.error('Error de Groq:', data);
      return NextResponse.json({ content: 'LA FORJA ESTÁ FRÍA. REVISA TU CONEXIÓN.' });
    }

    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ content: 'ERROR EN EL SISTEMA DE LA FORJA.' }, { status: 500 });
  }
}
