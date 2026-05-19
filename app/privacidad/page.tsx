import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-24 font-sans selection:bg-orange-600 selection:text-black">
      <div className="max-w-4xl mx-auto">

        <div className="mb-12 border-b border-zinc-900 pb-8">

          <Link
            href="/"
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-orange-600 transition-colors italic"
          >
            ← [ VOLVER ]
          </Link>

          <h1 className="text-4xl font-black uppercase tracking-tighter mt-6 italic">
            Privacidad <span className="text-orange-600">.</span>
          </h1>

          <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-widest">
            PROTOCOLO DE PROTECCIÓN DE DATOS // RGPD // COOKIES // v2.2026
          </p>

        </div>



<div className="space-y-10 text-sm leading-relaxed text-zinc-400">

<section>

<h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">

01. Identificación del Responsable

</h2>

<p>

El titular del sitio web es Vicente Altava, responsable de Mastesto, plataforma digital orientada a disciplina, hábitos, entrenamiento, productividad y comunidad.

Puede contactar a través del panel de contacto de la plataforma.

</p>

</section>



<section>

<h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">

02. Datos Recabados y Finalidad

</h2>

<p>

Podemos tratar datos como correo electrónico, nombre, alias, preferencias, información de perfil, estadísticas internas, información asociada a la cuenta y datos técnicos de navegación.

</p>

<p className="mt-3">

La finalidad es permitir acceso a la plataforma, gestionar perfiles, comunidad, estadísticas, seguridad, autenticación, mejorar el servicio y ofrecer funciones de Mastesto.

</p>

</section>



<section>

<h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">

03. Servicios y Encargados del Tratamiento

</h2>

<p>

Para garantizar funcionamiento y seguridad Mastesto utiliza proveedores tecnológicos externos:

<br /><br />

• Supabase: autenticación y base de datos.

<br />

• Vercel: alojamiento e infraestructura web.

<br />

• Resend: envío de correos electrónicos.

<br />

• Groq: funciones de inteligencia artificial.

<br />

• Discord: estadísticas de comunidad.

<br />

• TikTok: estadísticas sociales.

<br />

• Google Analytics: análisis de visitas y comportamiento.

</p>

</section>




<section>

<h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">

04. Política de Cookies

</h2>

<p>

Mastesto utiliza cookies técnicas y tecnologías similares necesarias para funcionamiento, autenticación y experiencia de usuario.

</p>

<p className="mt-3">

También utilizamos almacenamiento local para recordar aceptación de cookies y preferencias del usuario.

</p>

<p className="mt-3">

La aceptación del aviso se almacena localmente en el navegador para evitar mostrarlo en cada visita.

</p>

<p className="mt-3">

Mastesto utiliza herramientas analíticas como Google Analytics para obtener estadísticas agregadas y mejorar el rendimiento de la plataforma.

</p>

</section>




<section>

<h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">

05. Google Analytics

</h2>

<p>

Google Analytics puede recopilar información técnica y estadística sobre el uso de la web:

<br /><br />

• páginas visitadas

<br />

• tiempo de permanencia

<br />

• dispositivo

<br />

• navegador

<br />

• procedencia del tráfico

<br />

• rendimiento de campañas

</p>

<p className="mt-3">

Esta información se utiliza únicamente para análisis y mejora interna.

</p>

</section>




<section>

<h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">

06. Discord y TikTok

</h2>

<p>

Mastesto puede mostrar estadísticas públicas procedentes de plataformas externas como Discord y TikTok.

</p>

<p className="mt-3">

Esto puede incluir:

<br /><br />

• miembros de Discord

<br />

• usuarios activos

<br />

• seguidores TikTok

<br />

• likes

</p>

<p className="mt-3">

Estos datos tienen finalidad exclusivamente informativa y de comunidad.

</p>

</section>




<section>

<h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">

07. Derechos del Usuario

</h2>

<p>

El usuario podrá ejercer derechos de acceso, rectificación, oposición, supresión, limitación y portabilidad cuando resulte aplicable.

</p>

<p className="mt-3">

También podrá eliminar sus datos desde la plataforma cuando proceda.

</p>

</section>




<section>

<h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">

08. Actualizaciones

</h2>

<p>

Mastesto podrá actualizar esta política para adaptarla a cambios legales, técnicos o funcionales.

</p>

<p className="mt-3">

La versión más reciente estará disponible siempre en esta página.

</p>

</section>

</div>

      </div>
    </div>
  );
}
