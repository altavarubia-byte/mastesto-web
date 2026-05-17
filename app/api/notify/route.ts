import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Validación de seguridad para el build de Vercel
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    if (!resend) {
      console.error("RESEND_API_KEY no configurada");
      return NextResponse.json({ error: "Configuración incompleta" }, { status: 500 });
    }

    // Extraemos email, nombre y el posible mensaje
    const { email, nombre, mensaje } = await req.json();

    // 1. SI HAY MENSAJE -> Es el formulario de Contacto
    if (mensaje) {
      const { data, error } = await resend.emails.send({
        from: '+Testo <onboarding@resend.dev>',
        to: 'altava.rubia@gmail.com',
        subject: `📩 CONTACTO: ${nombre}`,
        html: `
          <div style="background:#000; color:#fff; padding:30px; border-radius:15px; border:1px solid #333; font-family:sans-serif;">
            <h2 style="color:#ea580c; text-transform:uppercase; letter-spacing:2px;">Nuevo Mensaje de Contacto</h2>
            <p><strong>De:</strong> ${nombre} (${email})</p>
            <hr style="border:0; border-top:1px solid #222; margin:20px 0;" />
            <p style="white-space: pre-wrap; color:#d1d1d1; line-height:1.6;">${mensaje}</p>
            <div style="margin-top:30px; pt:15px; border-top:1px solid #222;">
              <p style="font-size:10px; color:#555;">Mastesto Engineering HQ • 2026</p>
            </div>
          </div>
        `
      });

      if (error) return NextResponse.json({ error }, { status: 400 });
      return NextResponse.json({ message: "Contacto enviado", id: data?.id });
    } 
    
    // 2. SI NO HAY MENSAJE -> Es un nuevo Registro
    else {
      const { data, error } = await resend.emails.send({
        from: 'Mastesto <onboarding@resend.dev>',
        to: 'altava.rubia@gmail.com',
        subject: '🔥 NUEVO REGISTRO EN +TESTO',
        html: `
          <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 40px; border: 1px solid #333; border-radius: 20px;">
            <h1 style="color: #ea580c; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Nueva Incorporación</h1>
            <p style="color: #a1a1aa; font-size: 14px;">Se ha detectado un nuevo registro en la plataforma operativa.</p>
            <hr style="border: 0; border-top: 1px solid #27272a; margin: 20px 0;" />
            <p style="font-size: 16px;"><strong>Nombre:</strong> ${nombre}</p>
            <p style="font-size: 16px;"><strong>Email:</strong> ${email}</p>
            <div style="margin-top: 40px; border-top: 1px solid #27272a; pt: 20px;">
              <p style="font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: 1px;">Mastesto Engineering • 2026</p>
            </div>
          </div>
        `
      });

      if (error) return NextResponse.json({ error }, { status: 400 });
      return NextResponse.json({ message: "Registro notificado", id: data?.id });
    }

  } catch (err) {
    console.error("Error en la ruta de notificación:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
