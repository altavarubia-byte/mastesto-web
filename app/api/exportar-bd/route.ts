import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const tablas = [
      'profiles',
      'dieta_cuestionarios',
      'dietas_pdf',
      'tareas',
      'comentarios',
      'usuarios_marketing',
    ];

    let contenido = '';
    contenido += 'EXPORTACIÓN BASE DE DATOS MASTESTO\n';
    contenido += `Fecha: ${new Date().toLocaleString('es-ES')}\n`;
    contenido += '========================================\n\n';

    for (const tabla of tablas) {
      const { data, error } = await supabaseAdmin
        .from(tabla)
        .select('*');

      contenido += `\n\n==============================\n`;
      contenido += `TABLA: ${tabla.toUpperCase()}\n`;
      contenido += `==============================\n\n`;

      if (error) {
        contenido += `ERROR AL LEER TABLA: ${error.message}\n`;
        continue;
      }

      if (!data || data.length === 0) {
        contenido += 'Sin registros.\n';
        continue;
      }

      data.forEach((fila, index) => {
        contenido += `--- REGISTRO ${index + 1} ---\n`;

        Object.entries(fila).forEach(([clave, valor]) => {
          contenido += `${clave}: ${
            typeof valor === 'object'
              ? JSON.stringify(valor, null, 2)
              : valor ?? ''
          }\n`;
        });

        contenido += '\n';
      });
    }

    return new Response(contenido, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="mastesto-base-datos.txt"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    return new Response(
      `Error generando exportación: ${error.message}`,
      { status: 500 }
    );
  }
}
