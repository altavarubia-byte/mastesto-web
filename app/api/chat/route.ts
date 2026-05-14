import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Eres EL FORJADOR, un mentor estoico de disciplina de hierro.' },
          ...messages,
        ],
      }),
    });

    const data = await response.json();

    // Si Groq devuelve un error (por ejemplo, API Key inválida)
    if (data.error) {
      console.error('Error de Groq:', data.error);
      return NextResponse.json({ content: 'LA FORJA ESTÁ FRÍA. REVISA TU CONEXIÓN.' });
    }

    return NextResponse.json({ content: data.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ content: 'ERROR CRÍTICO EN EL SISTEMA.' }, { status: 500 });
  }
}
