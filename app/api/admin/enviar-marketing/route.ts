import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { asunto, mensaje, adminEmail } = await req.json();

    if (!asunto || !mensaje || !adminEmail) {
      return NextResponse.json(
        { error: 'Faltan datos' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: admin, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('email', adminEmail)
      .single();

    if (adminError || admin?.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado', detalle: adminError?.message },
        { status: 403 }
      );
    }

    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuarios_marketing')
      .select('email');

    if (usuariosError) {
      return NextResponse.json(
        { error: 'Error leyendo usuarios_marketing', detalle: usuariosError.message },
        { status: 500 }
      );
    }

    const emails = usuarios?.map((u) => u.email).filter(Boolean) || [];

    if (emails.length === 0) {
      return NextResponse.json({
        enviados: 0,
        mensaje: 'No hay usuarios con acepta_marketing=true',
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'Mastesto <onboarding@resend.dev>',
      to: emails,
      subject: asunto,
      html: `
        <div style="background:#050505;color:white;padding:30px;font-family:Arial">
          <h1 style="color:#ea580c">MASTESTO</h1>

          <p style="line-height:1.6">
            ${mensaje.replace(/\n/g, '<br/>')}
          </p>

          <hr style="border:0;border-top:1px solid #222;margin:30px 0"/>

          <p style="font-size:12px;color:#888">
            Recibes este correo porque aceptaste comunicaciones comerciales de Mastesto.
            Puedes darte de baja desde tu perfil.
          </p>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Resend rechazó el envío', detalle: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      enviados: emails.length,
      resend: data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Error inesperado',
        detalle: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
