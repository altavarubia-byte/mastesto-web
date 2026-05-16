import Link from 'next/link';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-24 font-sans selection:bg-orange-600 selection:text-black">
      {/* CABECERA DE LA PÁGINA */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-zinc-900 pb-8">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-orange-600 transition-colors italic">
            ← [ VOLVER_A_LA_FORJA ]
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-6 italic">
            Privacidad <span className="text-orange-600">.</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-widest">
            Protocolo de protección de datos v1.0.2026
          </p>
        </div>

        {/* CONTENIDO DEL INFORME */}
        <div className="space-y-12 text-sm md:text-base leading-relaxed text-zinc-400">
          
          <section>
            <h2 className="text-orange-600 font-black uppercase tracking-widest mb-4 italic text-xs">
              01. Neutralidad de Datos
            </h2>
            <p>
              En **+TESTO**, la privacidad es parte de la disciplina. Solo recopilamos la información mínima necesaria para que el sistema funcione: tu correo electrónico (vía Supabase Auth), tu nombre y la fecha en la que decidiste tomar el control de tu voluntad.
            </p>
          </section>

          <section>
            <h2 className="text-orange-600 font-black uppercase tracking-widest mb-4 italic text-xs">
              02. Seguridad de la Infraestructura
            </h2>
            <p>
              Tus registros de batalla y tiempos de disciplina se almacenan de forma segura utilizando la tecnología de **Supabase**. No vendemos, alquilamos ni compartimos tus datos con entidades externas. Tu lucha es tuya, y de nadie más.
            </p>
          </section>

          <section>
            <h2 className="text-orange-600 font-black uppercase tracking-widest mb-4 italic text-xs">
              03. Uso de la IA (Groq)
            </h2>
            <p>
              Cuando interactúas con el **Mando de IA**, los mensajes se procesan para generar una respuesta basada en tu contexto de disciplina. Estos datos son efímeros y se utilizan únicamente para fortalecer tu determinación en tiempo real.
            </p>
          </section>

          <section>
            <h2 className="text-orange-600 font-black uppercase tracking-widest mb-4 italic text-xs">
              04. Extracción y Eliminación
            </h2>
            <p>
              Como socio de esta plataforma, tienes el control total. Si decides abandonar la misión, puedes solicitar la eliminación total de tus datos. Una vez ejecutado el comando de borrado, no habrá rastro de tu paso por la forja.
            </p>
          </section>

        </div>

        {/* PIE DE PÁGINA DE LA SECCIÓN */}
        <div className="mt-20 pt-8 border-t border-zinc-900 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
          Estado: Protegido // Encriptación: Activa // Acceso: Solo Socio
        </div>
      </div>
    </div>
  );
}
