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

    // Calcular dimensiones de habitaciones
    const cols = Math.ceil(Math.sqrt(num));
    const rows = Math.ceil(num / cols);
    const anchoHab = Math.floor((anchoT / cols) * 10) / 10;
    const largoHab = Math.floor((largoT / rows) * 10) / 10;

    // Generar habitaciones en Python para ser exactos
    const habitaciones = [];
    let habId = 1;
    for (let p = 0; p < plantas; p++) {
      const offsetZ = 0; // plantas en Y
      const offsetY = p * (alto + 0.3);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (habId > num * plantas) break;
          const cx = Math.round((-anchoT/2 + anchoHab/2 + c * anchoHab) * 10) / 10;
          const cz = Math.round((-largoT/2 + largoHab/2 + r * largoHab + offsetZ) * 10) / 10;
          habitaciones.push({
            altoBase: Math.round(offsetY * 10) / 10,
            id: `h-${habId}`,
            nombre: tipo === 'Vivienda'
              ? (habId === 1 ? 'Salón' : habId === 2 ? 'Cocina' : habId === 3 ? 'Dormitorio principal' : habId === 4 ? 'Baño' : `Habitación ${habId}`)
              : tipo === 'Oficina'
              ? (habId === 1 ? 'Recepción' : habId === 2 ? 'Sala de reuniones' : `Despacho ${habId - 2}`)
              : `Zona ${habId}`,
            x: cx,
            z: cz,
            ancho: anchoHab - 0.2,
            largo: largoHab - 0.2,
            alto,
            materialPared: materialParedIA,
            materialSuelo: materialSueloIA,
            materialTecho: materialTechoIA,
            espesorParedM: espesorP,
            espesorSueloM: espesorS,
            espesorTechoM: espesorT,
            rugosidadParedM: rugosidadP,
            rugosidadSueloM: 0.002,
            rugosidadTechoM: 0.0005,
          });
          habId++;
        }
      }
      if (conPasillos) {
        habitaciones.push({
          id: `pasillo-${p + 1}`,
          nombre: `Pasillo planta ${p + 1}`,
          x: 0,
          z: offsetZ,
          ancho: anchoT - 0.2,
          largo: 1.5,
          alto,
          materialPared: materialParedIA,
          materialSuelo: materialSueloIA,
          materialTecho: materialTechoIA,
          espesorParedM: espesorP,
          espesorSueloM: espesorS,
          espesorTechoM: espesorT,
          rugosidadParedM: rugosidadP,
          rugosidadSueloM: 0.002,
          rugosidadTechoM: 0.0005,
        });
      }
    }

    // Pedir a Groq solo los objetos, no las habitaciones
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
            content: `Eres un generador de objetos 3D para simulación RF.
Responde ÚNICAMENTE con un array JSON de objetos. Sin texto, sin markdown.
TIPOS DISPONIBLES EXACTOS:
router: sx:0.35,sy:0.35,sz:0.35,y:1.2,color:"#f97316"
receptor: sx:0.25,sy:0.25,sz:0.25,y:1.2,color:"#22c55e"
sofa: sx:1.8,sy:0.6,sz:0.8,y:0.4,color:"#7c2d12",material:"tejido"
mesa: sx:1.2,sy:0.25,sz:0.8,y:0.4,color:"#92400e",material:"madera"
silla: sx:0.5,sy:0.8,sz:0.5,y:0.4,color:"#57534e",material:"madera"
tv: sx:1.3,sy:0.08,sz:0.8,y:1.4,color:"#020617",material:"metal"
cama: sx:2,sy:0.45,sz:1.4,y:0.4,color:"#1e3a8a",material:"tejido"
armario: sx:1.2,sy:2,sz:0.5,y:1,color:"#44403c",material:"madera"
ventana: sx:1.8,sy:1.1,sz:0.08,y:1.5,color:"#7dd3fc",material:"cristal"

Formato de cada objeto:
{"id":"obj-1","tipo":"sofa","x":0,"y":0.4,"z":0,"sx":1.8,"sy":0.6,"sz":0.8,"color":"#7c2d12","material":"tejido"}

OBLIGATORIO: incluye SIEMPRE un router y un receptor.
Solo devuelve el array JSON, nada más.`,
          },
          {
            role: 'user',
            content: `Genera objetos para este espacio tipo ${tipo}.
Habitaciones disponibles: ${JSON.stringify(habitaciones.map(h => ({id: h.id, nombre: h.nombre, x: h.x, z: h.z, ancho: h.ancho, largo: h.largo})))}
Coloca el router en el centro del espacio (x:0, z:0).
Coloca el receptor en la habitación más alejada del router.
${conMuebles ? 'Añade muebles apropiados dentro de cada habitación según su nombre.' : 'Solo router y receptor.'}
Asegúrate de que los objetos estén dentro de los límites de las habitaciones.`,
          },
        ],
      }),
    });

    const data = await response.json();
    let texto = data.choices?.[0]?.message?.content || '';
    texto = texto.replace(/```json/g, '').replace(/```/g, '').trim();

    const startArr = texto.indexOf('[');
    const endArr = texto.lastIndexOf(']');
    let objetos = [
      { id: 'router-1', tipo: 'router', x: 0, y: 1.2, z: 0, sx: 0.35, sy: 0.35, sz: 0.35, color: '#f97316' },
      { id: 'receptor-1', tipo: 'receptor', x: habitaciones[habitaciones.length - 1]?.x || 3, y: 1.2, z: habitaciones[habitaciones.length - 1]?.z || 3, sx: 0.25, sy: 0.25, sz: 0.25, color: '#22c55e' },
    ];

    if (startArr !== -1 && endArr !== -1) {
      try {
        const parsed = JSON.parse(texto.slice(startArr, endArr + 1));
        if (Array.isArray(parsed) && parsed.length > 0) {
          objetos = parsed;
        }
      } catch (e) {
        // usar fallback con router y receptor
      }
    }

    return NextResponse.json({ ok: true, escena: { habitaciones, objetos } });

  } catch (error) {
    console.error('Error construir-escena:', error);
    return NextResponse.json({ ok: false, error: 'Error generando escena' }, { status: 500 });
  }
}
