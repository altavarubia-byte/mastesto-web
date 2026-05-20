import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {

    const body = await req.json();

    const {
      asunto,
      contenido,
      usuario
    } = body;

    if (!usuario) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // comprobar admin
    const { data: perfil } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', usuario)
      .single();

    if (perfil?.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      );
    }

    // usuarios que aceptan marketing
    const { data: usuarios } = await supabase
      .from('profiles')
      .select('email')
      .eq('acepta_marketing', true);

    if (!usuarios?.length) {
      return NextResponse.json({
        ok: true,
        enviados: 0
      });
    }

    const emails = usuarios
      .map((u) => u.email)
      .filter(Boolean);

    await resend.emails.send({

      from: 'Mastesto <noreply@mastesto.es>',

      to: emails,

      subject: asunto,

      html: `
      <div style="
      background:black;
      color:white;
      padding:40px;
      font-family:Arial;
      ">

      <h1 style="
      color:#f97316;
      ">
      +TESTO ⚔️
      </h1>

      ${contenido}

      <br/><br/>

      <p style="opacity:.6">
      mastesto.es
      </p>

      </div>
      `
    });

    return NextResponse.json({
      ok: true,
      enviados: emails.length
    });

  } catch (e:any) {

    return NextResponse.json(
      {
        error: e.message
      },
      {
        status:500
      }
    );
  }
}
