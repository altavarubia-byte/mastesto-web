export default function ArquitecturaPage() {
  const bloques = [
    {
      titulo: "Frontend",
      subtitulo: "Next.js + React",
      texto:
        "Interfaz web desplegada en Vercel. Gestiona la experiencia del usuario, páginas públicas, área de socios, formularios, paneles y visualización de datos.",
    },
    {
      titulo: "Backend",
      subtitulo: "API Routes",
      texto:
        "Capa de comunicación cliente-servidor. Procesa peticiones, conecta con servicios externos y centraliza la lógica de negocio.",
    },
    {
      titulo: "Base de datos",
      subtitulo: "Supabase PostgreSQL",
      texto:
        "Almacena usuarios, perfiles, cuestionarios, dietas, tareas, roles de administrador y preferencias de comunicación.",
    },
    {
      titulo: "Autenticación",
      subtitulo: "Supabase Auth",
      texto:
        "Sistema de sesiones, identificación de usuarios, control de acceso y gestión de perfiles mediante tokens seguros.",
    },
    {
      titulo: "Inteligencia Artificial",
      subtitulo: "Groq LLM",
      texto:
        "Módulo conversacional integrado para generar respuestas personalizadas y acompañar al usuario dentro del área de socios.",
    },
    {
      titulo: "Email",
      subtitulo: "Resend",
      texto:
        "Servicio de envío de comunicaciones, campañas y notificaciones a usuarios con consentimiento comercial.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-600 font-black italic mb-3">
        +TESTO · Arquitectura técnica
      </p>

      <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tight mb-10">
        Arquitectura del sistema
      </h1>

      <section className="border border-zinc-800 rounded-[2rem] p-8 mb-10">
        <h2 className="text-2xl font-black uppercase italic mb-6">
          Flujo general
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 text-center text-[10px] font-black uppercase">
          {[
            "Usuario",
            "HTTPS",
            "Next.js",
            "API REST",
            "Supabase",
            "IA Groq",
            "Resend",
          ].map((item, index) => (
            <div key={item} className="flex items-center gap-3">
              <div className="flex-1 border border-zinc-800 rounded-2xl p-4 bg-zinc-950">
                {item}
              </div>

              {index < 6 && (
                <span className="hidden md:block text-zinc-600">→</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {bloques.map((b) => (
          <div
            key={b.titulo}
            className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950"
          >
            <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-2">
              {b.subtitulo}
            </p>

            <h3 className="text-2xl font-black uppercase italic mb-4">
              {b.titulo}
            </h3>

            <p className="text-sm text-zinc-400 leading-relaxed">
              {b.texto}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-10 border border-zinc-800 rounded-[2rem] p-8">
        <h2 className="text-2xl font-black uppercase italic mb-6">
          Componentes técnicos del TFG
        </h2>

        <ul className="space-y-3 text-zinc-300">
          <li>✓ Arquitectura cliente-servidor basada en HTTPS</li>
          <li>✓ Frontend desarrollado con Next.js y React</li>
          <li>✓ Backend mediante rutas API desplegadas en entorno cloud</li>
          <li>✓ Base de datos relacional PostgreSQL mediante Supabase</li>
          <li>✓ Autenticación de usuarios y control de sesiones</li>
          <li>✓ Integración de inteligencia artificial mediante API externa</li>
          <li>✓ Envío de comunicaciones mediante servicio SMTP/API externo</li>
          <li>✓ Monitorización de rendimiento desde el cliente</li>
        </ul>
      </section>
    </main>
  );
}
