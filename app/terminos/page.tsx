import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-24 font-sans selection:bg-orange-600 selection:text-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-zinc-900 pb-8">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-orange-600 transition-colors italic">
            ← [ VOLVER ]
          </Link>
          <h1 className="text-4xl font-black uppercase tracking-tighter mt-6 italic">
            Términos <span className="text-orange-600">.</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-widest">
            Aviso Legal y Condiciones de Uso // v1.2.2026
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-400">
          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              01. Condiciones de Uso
            </h2>
            <p>
              +TESTO es una plataforma de gestión de hábitos y motivación. El acceso y uso del sitio atribuye la condición de socio, lo que implica la aceptación de estas condiciones. El usuario se compromete a hacer un uso lícito y diligente de las herramientas de IA y cronometraje.
            </p>
          </section>

          <section className="bg-zinc-900/30 p-6 border border-zinc-800">
            <h2 className="text-orange-600 font-bold uppercase mb-4 text-xs tracking-widest italic">
              02. AVISO IMPORTANTE: EXENCIÓN MÉDICA
            </h2>
            <p className="text-zinc-300 font-semibold">
              Los servicios proporcionados por +TESTO, incluyendo las respuestas generadas por la inteligencia artificial, tienen un fin puramente informativo y motivacional. **No constituyen consejo médico ni diagnóstico profesional.**
            </p>
            <p className="mt-4 italic">
              Si usted padece una adicción grave o problemas de salud derivados del consumo de sustancias, debe consultar obligatoriamente con un profesional sanitario colegiado. +TESTO no se hace responsable de las decisiones de salud tomadas por el usuario.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              03. Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido, marcas, logos y código fuente de +TESTO son propiedad intelectual de Vicente Altava. Queda terminantemente prohibida la copia, distribución o ingeniería inversa de los sistemas de la plataforma sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              04. Limitación de Responsabilidad
            </h2>
            <p>
              El titular no garantiza la disponibilidad permanente del servicio debido a posibles fallos técnicos en los proveedores (Vercel, Supabase, Groq). Asimismo, no se hace responsable de posibles recaídas en hábitos negativos, ya que el éxito del programa depende íntegramente de la ejecución individual del socio.
            </p>
          </section>

          <section>
            <h2 className="text-white font-bold uppercase mb-4 text-xs tracking-widest border-l-2 border-orange-600 pl-4 italic">
              05. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Para cualquier litigio o controversia, será de aplicación la legislación española, siendo competentes los Juzgados y Tribunales de Castellón de la Plana, renunciando el usuario a cualquier otro fuero que pudiera corresponderle.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
