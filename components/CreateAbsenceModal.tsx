'use client'

import { useState, useEffect } from 'react'
import { createAbsence } from '@/app/actions/absences'
import { ABSENCE_TYPES, type AbsenceType } from '@/lib/utils/absence-types'
import { formatDateForInput, getCurrentWeek } from '@/lib/utils/dates'
import { X } from 'lucide-react'

interface CreateAbsenceModalProps {
  isOpen: boolean
  onClose: () => void
  userTeams: Array<{ id: string; name: string }>
  initialDates?: { start: Date; end: Date }
}

export default function CreateAbsenceModal({
  isOpen,
  onClose,
  userTeams,
  initialDates
}: CreateAbsenceModalProps) {
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedType, setSelectedType] = useState<AbsenceType>('vacaciones')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Auto-seleccionar equipo si solo hay uno
      if (userTeams.length === 1) {
        setSelectedTeam(userTeams[0].id)
      }

      // Configurar fechas iniciales
      if (initialDates) {
        setStartDate(formatDateForInput(initialDates.start))
        setEndDate(formatDateForInput(initialDates.end))
      } else {
        const today = new Date()
        setStartDate(formatDateForInput(today))
        setEndDate(formatDateForInput(today))
      }
    }
  }, [isOpen, userTeams, initialDates])

  const handleQuickAction = (action: 'today' | 'week') => {
    const today = new Date()
    
    if (action === 'today') {
      setStartDate(formatDateForInput(today))
      setEndDate(formatDateForInput(today))
    } else {
      const { start, end } = getCurrentWeek()
      setStartDate(formatDateForInput(start))
      setEndDate(formatDateForInput(end))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedTeam) {
      setError('Selecciona un equipo')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    setIsSubmitting(true)

    const result = await createAbsence({
      teamId: selectedTeam,
      type: selectedType,
      startDate,
      endDate,
      note: note.trim() || undefined
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      onClose()
      // Reset form
      setSelectedType('vacaciones')
      setNote('')
      setError('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Marcar ausencia</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Equipo (solo si hay múltiples) */}
          {userTeams.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipo
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona un equipo</option>
                {userTeams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de ausencia
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ABSENCE_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedType(key as AbsenceType)}
                  className={`p-3 border rounded-md text-center transition-all ${
                    selectedType === key
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{info.emoji}</div>
                  <div className="text-sm font-medium">{info.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Acciones rápidas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acciones rápidas
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickAction('today')}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                Solo hoy
              </button>
              <button
                type="button"
                onClick={() => handleQuickAction('week')}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
              >
                Toda la semana
              </button>
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Alguna información adicional..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar y disfrutar 😄'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
