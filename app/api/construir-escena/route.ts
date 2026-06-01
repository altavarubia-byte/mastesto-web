import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { datos } = await req.json();

    const {
      tipo = 'Vivienda',
      numHabitaciones = '4',
      numPlantas = '1',
      tienePasillos = 'No, solo habitaciones',
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

    const num = parseInt(String(numHabitaciones)) || 4;
    const plantas = parseInt(String(numPlantas)) || 1;
    const anchoT = parseFloat(String(anchoTotal)) || 10;
    const largoT = parseFloat(String(largoTotal)) || 12;
    const alto = parseFloat(String(altoTecho)) || 2.7;
    const espesorP = parseFloat(String(espesorParedIA)) || 0.115;
    const rugosidadP = parseFloat(String(rugosidadParedIA)) || 0.0015;
    const espesorS = parseFloat(String(espesorSueloIA)) || 0.2;
    const espesorT = parseFloat(String(espesorTechoIA)) || 0.013;
    const freq = parseFloat(String(frecuenciaIA)) || 5000;
    const conPasillos = String(tienePasillos).includes('Sí');
    const conMuebles = String(addObjetos).includes('completos');

    const totalHabitaciones = num * plantas + (conPasillos ? plantas : 0);

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
            content: `Eres un generador de escenas RF para simulación Sionna indoor.
Responde ÚNICAMENTE con JSON válido. Sin texto, sin markdown, sin explicaciones.

OBJETOS DISPONIBLES (usa SOLO estos tipos):
- router: {id, tipo:"router", x, y:1.2, z, sx:0.35, sy:0.35, sz:0.35, color:"#f97316"}
- receptor: {id, tipo:"receptor", x, y:1.2, z, sx:0.25, sy:0.25, sz:0.25, color:"#22c55e"}
- sofa: {id, tipo:"sofa", x, y:0.4, z, sx:1.8, sy:0.6, sz:0.8, color:"#7c2d12", material:"tejido"}
- mesa: {id, tipo:"mesa", x, y:0.4, z, sx:1.2, sy:0.25, sz:0.8, color:"#92400e", material:"madera"}
- silla: {id, tipo:"silla", x, y:0.4, z, sx:0.5, sy:0.8, sz:0.5, color:"#57534e", material:"madera"}
- tv: {id, tipo:"tv", x, y:1.4, z, sx:1.3, sy:0.08, sz:0.8, color:"#020617", material:"metal"}
- cama: {id, tipo:"cama", x, y:0.4, z, sx:2, sy:0.45, sz:1.4, color:"#1e3a8a", material:"tejido"}
- armario: {id, tipo:"armario", x, y:1, z, sx:1.2, sy:2, sz:0.5, color:"#44403c", material:"madera"}
- ventana: {id, tipo:"ventana", x, y:1.5, z, sx:1.8, sy:1.1, sz:0.08, color:"#7dd3fc", material:"cristal"}

ESTRUCTURA JSON OBLIGATORIA:
{
  "habitaciones": [...],
  "objetos": [...]
}

REGLAS CRÍTICAS:
- Distribuye ${totalHabitaciones} habitaciones SIN solapamiento en el espacio ${anchoT}x${largoT}m
- ${conPasillos ? `Incluye ${plantas} pasillo(s) de 1.5m de ancho conectando las habitaciones` : 'Sin pasillos'}
- ${plantas > 1 ? `Distribuye en ${plantas} plantas: offset z += ${largoT + 2} por cada planta` : 'Una sola planta'}
- Coloca router en el centro geométrico del espacio
- Coloca receptor en la habitación más alejada del router
- ${conMuebles ? 'Añade muebles realistas según el tipo de espacio usando SOLO los tipos listados' : 'Solo router y receptor como objetos'}
- USA SOLO los tipos de objeto listados arriba
- Solo devuelve el JSON, nada más`,
          },
          {
            role: 'user',
            content: `Genera escena RF:
Tipo: ${tipo}
Plantas: ${plantas}
Zonas por planta: ${num}
Pasillos: ${conPasillos ? 'Sí' : 'No'}
Dimensiones planta: ${anchoT}m × ${largoT}m × ${alto}m
Paredes: ${materialParedIA}, espesor ${espesorP}m, rugosidad ${rugosidadP}m
Suelo: ${materialSueloIA}, espesor ${espesorS}m
Techo: ${materialTechoIA}, espesor ${espesorT}m
Frecuencia: ${freq} MHz
Mobiliario: ${addObjetos}`,
          },
        ],
      }),
    });

    const data = await response.json();
    let texto = data.choices?.[0]?.message?.content || '';
    texto = texto.replace(/```json/g, '').replace(/```/g, '').trim();

    const start = texto.indexOf('{');
    const end = texto.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) {
      return NextResponse.json({ ok: false, error: `Sin JSON: ${texto.slice(0, 200)}` }, { status: 500 });
    }

    let escena: any;
    try {
      escena = JSON.parse(texto.slice(start, end + 1));
    } catch (e) {
      return NextResponse.json({ ok: false, error: `JSON inválido: ${String(e)}` }, { status: 500 });
    }

    if (!escena.habitaciones?.length) {
      return NextResponse.json({ ok: false, error: 'Sin habitaciones' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, escena });

  } catch (error) {
    console.error('Error construir-escena:', error);
    return NextResponse.json({ ok: false, error: 'Error generando escena' }, { status: 500 });
  }
}
