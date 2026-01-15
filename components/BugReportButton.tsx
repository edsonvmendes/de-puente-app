'use client'

import { useState } from 'react'
import { Bug, X, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function BugReportButton() {
  const [showModal, setShowModal] = useState(false)
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // Capturar informação técnica
      const bugReport = {
        description,
        user_email: user?.email || 'unknown',
        url: window.location.href,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_size: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
      }

      // Opção 1: Enviar para sua API (criar endpoint)
      await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bugReport)
      })

      // Opção 2: Salvar no Supabase (criar tabela bug_reports)
      // await supabase.from('bug_reports').insert(bugReport)

      alert('¡Gracias! Bug reportado con éxito. Te contactaremos pronto.')
      setShowModal(false)
      setDescription('')
    } catch (error) {
      alert('Error al enviar reporte. Contacta al admin directamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg transition-all hover:scale-110 z-40"
        title="Reportar un bug"
      >
        <Bug size={24} />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bug size={20} className="text-red-500" />
                Reportar Bug
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Qué está fallando?
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  placeholder="Describe el problema lo más detallado posible:&#10;- ¿Qué intentabas hacer?&#10;- ¿Qué esperabas que pasara?&#10;- ¿Qué pasó en realidad?"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                💡 <strong>Tip:</strong> Incluye pasos para reproducir el bug
              </div>

              <div className="text-xs text-gray-500">
                Se enviará automáticamente:
                <ul className="list-disc list-inside mt-1">
                  <li>Tu email</li>
                  <li>Página actual</li>
                  <li>Navegador y sistema</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
