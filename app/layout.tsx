import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ToastProvider'
import { LanguageProvider } from '@/components/LanguageProvider'

export const metadata: Metadata = {
  title: 'DE PUENTE - Gestión de Ausencias',
  description: 'App interna para gestionar vacaciones, días libres y ausencias del equipo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="bg-gray-50 min-h-screen transition-colors">
        <LanguageProvider>
          {children}
          <ToastProvider />
        </LanguageProvider>
      </body>
    </html>
  )
}
