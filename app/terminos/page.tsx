import Link from 'next/link';

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-24 font-sans selection:bg-orange-600 selection:text-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 border-b border-zinc-900 pb-8">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-orange-600 transition-colors italic">
            ← [ VOLVER_A_LA_FORJA ]
          </Link>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-6 italic">
            Términos <span className="text-orange-600">.</span>
          </h1>
          <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-widest">
            Código de conducta y condiciones v1.0.2026
          </p>
        </div>

        <div className="space-y-12 text-sm md:text-base leading-relaxed text-zinc-400">
          
          <section>
            <h2 className="text-orange-600 font-black uppercase tracking-widest mb-4 italic text-xs">
              01. Aceptación de la Disciplina
            </h2>
            <p>
              Al acceder a **+TESTO**, el usuario acepta que esta plataforma es una herramienta de auto-superación. El uso de los sistemas de cronometraje y consulta a la IA implica el compromiso de trabajar en la propia VOLUNTAD.
            </p>
          </section>

          <section>
            <h2 className="text-orange-600 font-black uppercase tracking-widest mb-4 italic text-xs">
              02. Uso de la Plataforma
            </h2>
            <p>
              Queda prohibido cualquier intento de vulnerar los sistemas, manipular los registros de tiempo o utilizar el Mando de IA para fines que no sean el refuerzo de la disciplina personal. El acceso es personal e intransferible.
            </p>
          </section>

          <section>
            <h2 className="text-orange-600 font-black uppercase tracking-widest mb-4 italic text-xs">
              03. Responsabilidad del Socio
            </h2>
            <p>
              **+TESTO** es un asistente motivacional y de gestión de hábitos. El éxito en la erradicación de vicios depende exclusivamente del usuario. No somos responsables de recaídas; el sistema solo forja la herramienta, el usuario maneja el acero.
            </p>
          </section>

          <section>
            <h2 className="text-orange-600 font-black uppercase tracking-widest mb-4 italic text-xs">
              04. Modificaciones del Servicio
            </h2>
            <p>
              Nos reservamos el derecho de actualizar el Código de Conducta o modificar las funciones de la plataforma para asegurar la máxima eficacia en la lucha contra la autocomplacencia.
            </p>
          </section>

        </div>

        <div className="mt-20 pt-8 border-t border-zinc-900 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
          Acuerdo: Vinculante // Disciplina: Obligatoria // Destino: Grandeza
        </div>
      </div>
    </div>
  );
}
