import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { datos } = await req.json();

    const {
      tipo = 'Vivienda',
      numHabitaciones = '4',
      anchoTotal = '10',
      largoTotal = '12',
      altoTecho = '2.7',
      materialParedIA = 'ladrillo',
      espesorParedIA = '0.115',
      rugosidadParedIA = '0.0015',
      materialSueloIA = 'hormigon',
      espesorSueloIA = '0.2',
      materialTechoIA = 'pladur',
      espesorTechoIA = '0.013',
      frecuenciaIA = '5000',
      addObjetos = 'Solo router y receptor',
    } = datos;

    const num = parseInt(numHabitaciones) || 4;
    const anchoT = parseFloat(anchoTotal) || 10;
    const largoT = parseFloat(largoTotal) || 12;
    const alto = parseFloat(altoTecho) || 2.7;
    const espesorP = parseFloat(espesorParedIA) || 0.115;
    const rugosidadP = parseFloat(rugosidadParedIA) || 0.0015;
    const espesorS = parseFloat(espesorSueloIA) || 0.2;
    const espesorT = parseFloat(espesorTechoIA) || 0.013;
    const freq = parseFloat(frecuenciaIA) || 5000;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: `Eres un generador de escenas RF para simulación Sionna.
Responde ÚNICAMENTE con un JSON válido. Sin texto, sin markdown, sin explicaciones.
Estructura obligatoria:
{
  "habitaciones": [
    {
      "id": "h-1",
      "nombre": "Salón",
      "x": 0, "z": 0,
      "ancho": 5, "largo": 4, "alto": 2.7,
      "materialPared": "ladrillo",
      "materialSuelo": "hormigon",
      "materialTecho": "pladur",
      "espesorParedM": 0.115,
      "espesorSueloM": 0.2,
      "espesorTechoM": 0.013,
      "rugosidadParedM": 0.0015,
      "rugosidadSueloM": 0.002,
      "rugosidadTechoM": 0.0005
    }
  ],
  "objetos": [
    {
      "id": "router-1",
      "tipo": "router",
      "x": 0, "y": 1.2, "z": 0,
      "sx": 0.35, "sy": 0.35, "sz": 0.35,
      "color": "#f97316"
    }
  ]
}
REGLAS:
- Distribuye ${num} habitaciones sin solapamiento usando x y z como centros de cada sala
- El ancho total disponible es ${anchoT}m y el largo total es ${largoT}m
- Todas las habitaciones deben caber dentro de esos límites
- Usa los materiales y propiedades físicas exactas indicadas
- Coloca un router (color #f97316) en el centro geométrico del espacio completo
- Coloca un receptor (tipo receptor, color #22c55e, sx/sy/sz 0.25) en la habitación más alejada del router
- Si se piden muebles, añade objetos realistas según el tipo de espacio
- Solo devuelve el JSON, absolutamente nada más`,
          },
          {
            role: 'user',
            content: `Genera la escena con estos parámetros físicos exactos:
Tipo de espacio: ${tipo}
Número de zonas: ${num}
Dimensiones totales: ${anchoT}m ancho × ${largoT}m largo × ${alto}m alto
Material paredes: ${materialParedIA}, espesor: ${espesorP}m, rugosidad: ${rugosidadP}m
Material suelo: ${materialSueloIA}, espesor: ${espesorS}m
Material techo: ${materialTechoIA}, espesor: ${espesorT}m
Frecuencia RF: ${freq} MHz
Objetos adicionales: ${addObjetos}`,
          },
        ],
      }),
    });

    const data = await response.json();
    let texto = data.choices?.[0]?.message?.content || '';
    
    // Limpiar markdown y texto extra
    texto = texto.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extraer el JSON más externo
    const start = texto.indexOf('{');
    const end = texto.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      return NextResponse.json({ ok: false, error: `No se encontró JSON en la respuesta: ${texto.slice(0, 200)}` }, { status: 500 });
    }
    
    const jsonStr = texto.slice(start, end + 1);
    let escena: any;
    try {
      escena = JSON.parse(jsonStr);
    } catch (parseErr) {
      return NextResponse.json({ ok: false, error: `JSON inválido: ${String(parseErr)} | Texto: ${jsonStr.slice(0, 300)}` }, { status: 500 });
    }

    if (!escena.habitaciones?.length) {
      return NextResponse.json({ ok: false, error: 'La escena no tiene habitaciones' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, escena });

  } catch (error) {
    console.error('Error construir-escena:', error);
    return NextResponse.json({ ok: false, error: 'Error generando escena' }, { status: 500 });
  }
}
