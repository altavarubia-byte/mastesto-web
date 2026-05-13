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

// Configuración de Mastesto Engineering
const title = 'Mastesto Engineering'
const description = 'Innovation in Technology - Plataforma de Ingeniería Avanzada'

export const metadata: Metadata = {
  title,
  description,
  // ESTO PONE LA "T" ROJA EN LA PESTAÑA Y ELIMINA EL LOGO POR DEFECTO
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22red%22/><text y=%22.9em%22 x=%22.15em%22 font-size=%2275%22 font-weight=%22900%22 fill=%22white%22 font-family=%22Arial%22>T</text></svg>',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
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

        {/* IMPORTANTE: He eliminado el componente VercelToolbar 
            que es el que hacía aparecer el triángulo negro.
        */}
      </body>
    </html>
  )
}