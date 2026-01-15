import type { Metadata } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ToastProvider'
import { LanguageProvider } from '@/components/LanguageProvider'

export const metadata: Metadata = {
  title: 'DE PUENTE - Gestión de Ausencias',
  description: 'App interna para gestionar vacaciones, días libres y ausencias del equipo',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏖️</text></svg>'
  }
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
