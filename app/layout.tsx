import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ChatProvider } from '@/lib/chat-context'
import { CommandLogsStream } from '@/components/commands-logs/commands-logs-stream'
import { ErrorMonitor } from '@/components/error-monitor/error-monitor'
import { SandboxState } from '@/components/modals/sandbox-state'
import { Toaster } from '@/components/ui/sonner'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import './globals.css'

// Configuración de +TESTO
const title = '+TESTO | Disciplina · Honor · Voluntad de Hierro'
const description = 'Plataforma diseñada para asistir con la disciplina y dejar de fumar.'

export const metadata = {
  title: '+TESTO',
  description: '+TESTO',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased bg-black"> {/* Añadido bg-black para coherencia visual */}
        <Suspense fallback={null}>
          <NuqsAdapter>
            <ChatProvider>
              <ErrorMonitor>{children}</ErrorMonitor>
            </ChatProvider>
          </NuqsAdapter>
        </Suspense>
        
        {/* Componentes de la interfaz */}
        <Toaster />
        <CommandLogsStream />
        <SandboxState />

        {/* 
            Al no incluir el componente VercelToolbar aquí, 
            el triángulo negro dejará de aparecer en tu entorno.
        */}
      </body>
    </html>
  )
}