import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ChatProvider } from '@/lib/chat-context'
import { CommandLogsStream } from '@/components/commands-logs/commands-logs-stream'
import { ErrorMonitor } from '@/components/error-monitor/error-monitor'
import { SandboxState } from '@/components/modals/sandbox-state'
import { Toaster } from '@/components/ui/sonner'
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import './globals.css'

// Configuración del viewport para PWA (color de la barra de estado)
export const viewport: Viewport = {
  themeColor: '#ea580c', // Naranja TESTO
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// Configuración de metadatos profesional (SEO y PWA)
export const metadata: Metadata = {
  title: {
    default: '+TESTO | Forja de Voluntad',
    template: '%s | +TESTO'
  },
  description: 'Plataforma de alta intensidad para la reconstrucción de hábitos, disciplina marcial y superación de vicios.',
  manifest: '/manifest.json', // ENLACE AL MANIFEST
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon-192x192.png', // Icono para iPhone
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '+TESTO',
  },
  openGraph: {
    title: '+TESTO | Disciplina de Hierro',
    description: 'Domina tu voluntad. Erradica la debilidad.',
    type: 'website',
    images: [{ url: '/icon-512x512.png' }], // Imagen pro para compartir
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-black text-white selection:bg-orange-600 selection:text-black">
        <Suspense fallback={null}>
          <NuqsAdapter>
            <ChatProvider>
              <ErrorMonitor>
                {/* Contenedor principal para empujar el footer abajo */}
                <div className="flex flex-col min-h-screen">
                  <main className="flex-grow">
                    {children}
                  </main>

                  {/* FOOTER PROFESIONAL */}
                  <footer className="bg-black border-t border-zinc-900 py-12 px-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                      <div className="flex flex-col items-center md:items-start">
                        <span className="text-xl font-black italic tracking-tighter text-orange-600">+TESTO</span>
                        <p className="text-[8px] text-zinc-600 uppercase tracking-[0.4em] mt-2">Victoria sobre la autocomplacencia</p>
                      </div>

                      <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                        <a href="/privacidad" className="hover:text-orange-600 transition-colors">Privacidad</a>
                        <a href="/terminos" className="hover:text-orange-600 transition-colors">Términos</a>
                        <a href="/contacto" className="hover:text-orange-600 transition-colors">Contacto</a>
                      </div>

                      <div className="text-[9px] font-mono text-zinc-700">
                        [ SYSTEM_STATUS: OPERATIONAL ]
                      </div>
                    </div>
                    <div className="mt-8 text-center">
                      <p className="text-[7px] text-zinc-800 uppercase tracking-[0.5em]">© 2026 Vicente Altava. Todos los derechos reservados.</p>
                    </div>
                  </footer>
                </div>
              </ErrorMonitor>
            </ChatProvider>
          </NuqsAdapter>
        </Suspense>
        
        <Toaster position="bottom-right" theme="dark" />
        <CommandLogsStream />
        <SandboxState />
      </body>
    </html>
  )
}
