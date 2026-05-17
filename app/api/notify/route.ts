import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Inicializamos Resend con la clave de tu archivo .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // Recibimos el email y nombre que enviamos desde el formulario de registro
    const { email, nombre } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'Mastesto <onboarding@resend.dev>',
      to: 'altava.rubia@gmail.com', // Tu correo personal
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

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: "Email enviado con éxito", id: data?.id });
  } catch (err) {
    console.error("Error en la ruta de notificación:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}