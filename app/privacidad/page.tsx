import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-24 font-sans selection:bg-orange-600 selection:text-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-zinc-900 pb-8">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-orange-600 transition-colors italic">
            ← [ VOLVER ]
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter mt-6 italic">
            Privacidad <span className="text-orange-600">.</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-widest">
            Protocolo de protección de datos (RGPD) // v1.2.2026
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-400">
          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              01. Identificación del Responsable
            </h2>
            <p>
              El titular del sitio web es Vicente Altava, con domicilio en Castellón, España. Puede contactar con el responsable para cualquier asunto relacionado con la protección de datos a través del panel de contacto de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              02. Datos Recabados y Finalidad
            </h2>
            <p>
              Recabamos exclusivamente los datos necesarios para la gestión del servicio de disciplina: correo electrónico, nombre, edad y fecha de inicio de hábitos. La base legal es el consentimiento del usuario al registrarse y la ejecución del servicio solicitado.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              03. Encargados del Tratamiento
            </h2>
            <p>
              Para garantizar la seguridad y operatividad, utilizamos proveedores tecnológicos líderes:
              <br />• **Supabase Inc:** Almacenamiento de bases de datos y autenticación (Servidores en UE/EE.UU. con cláusulas contractuales tipo).
              <br />• **Groq Inc:** Procesamiento de lenguaje natural para la IA. Los datos procesados son efímeros y no se ceden a terceros.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              04. Política de Cookies
            </h2>
            <p>
              Este sitio utiliza únicamente cookies técnicas estrictamente necesarias para mantener la sesión del usuario iniciada (vía Supabase Auth). Al no utilizar cookies publicitarias ni de rastreo de terceros, no se requiere la aceptación explícita mediante banner según la normativa de la AEPD.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              05. Derechos del Usuario (ARCO)
            </h2>
            <p>
              Usted tiene derecho de Acceso, Rectificación, Cancelación y Oposición. Puede purgar todos sus datos de forma inmediata eliminando su perfil desde el área de socios, lo cual garantiza el "derecho al olvido" de forma instantánea.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
