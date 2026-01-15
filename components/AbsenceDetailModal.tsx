'use client'

import { useState } from 'react'
import { deleteAbsence, updateAbsence, adjustAbsenceDates } from '@/app/actions/absences'
import { ABSENCE_TYPES, type AbsenceType } from '@/lib/utils/absence-types'
import { formatDate, formatDateForInput } from '@/lib/utils/dates'
import { X, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

interface AbsenceDetailModalProps {
  absence: any
  isOpen: boolean
  onClose: () => void
  canEdit: boolean // true si es el dueño o admin
  userTeams?: Array<{ id: string; name: string }>
}

export default function AbsenceDetailModal({
  absence,
  isOpen,
  onClose,
  canEdit,
  userTeams = []
}: AbsenceDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Estados de edición
  const [editType, setEditType] = useState<AbsenceType>(absence?.type || 'vacaciones')
  const [editStartDate, setEditStartDate] = useState(absence?.start_date || '')
  const [editEndDate, setEditEndDate] = useState(absence?.end_date || '')
  const [editNote, setEditNote] = useState(absence?.note || '')

  if (!isOpen || !absence) return null

  const info = ABSENCE_TYPES[absence.type as AbsenceType]

  const handleDelete = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta ausencia?')) {
      return
    }

    setIsSubmitting(true)
    const result = await deleteAbsence(absence.id)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  const handleUpdate = async () => {
    if (new Date(editStartDate) > new Date(editEndDate)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await updateAbsence({
      id: absence.id,
      teamId: absence.team_id, // ✅ Usa el team_id original, no permite cambio
      type: editType,
      startDate: editStartDate,
      endDate: editEndDate,
      note: editNote.trim() || undefined
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      setIsEditing(false)
      onClose()
    }
  }

  const handleQuickAdjust = async (days: number) => {
    setIsSubmitting(true)
    setError('')

    const result = await adjustAbsenceDates(absence.id, days)
    
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{info.emoji}</span>
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Editar ausencia' : 'Detalle de ausencia'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!isEditing ? (
            // Vista de detalle
            <>
              <div>
                <div className="text-sm text-gray-500 mb-1">Persona</div>
                <div className="font-medium">{absence.full_name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Equipo</div>
                <div className="font-medium">{absence.team_name}</div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Tipo</div>
                <div className="font-medium">{info.label}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Desde</div>
                  <div className="font-medium">{formatDate(absence.start_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Hasta</div>
                  <div className="font-medium">{formatDate(absence.end_date)}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Días laborables</div>
                <div className="font-medium">{absence.business_days || '-'}</div>
              </div>

              {absence.note && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Nota</div>
                  <div className="text-gray-700">{absence.note}</div>
                </div>
              )}

              {canEdit && (
                <>
                  {/* Ajustes rápidos */}
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      Ajustes rápidos
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleQuickAdjust(-1)}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        -1 día
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(1)}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        +1 día
                        <ChevronRight size={16} />
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(-7)}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        <ChevronLeft size={16} />
                        -7 días
                      </button>
                      <button
                        onClick={() => handleQuickAdjust(7)}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        +7 días
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Pencil size={16} />
                      Editar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 transition-colors"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            // Vista de edición
            <>
              {/* Info: Ausencia aparece en todos los equipos del usuario */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Esta ausencia aparece en todos tus equipos automáticamente
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ABSENCE_TYPES).map(([key, typeInfo]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setEditType(key as AbsenceType)}
                      className={`p-3 border rounded-md text-center transition-all ${
                        editType === key
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-1">{typeInfo.emoji}</div>
                      <div className="text-sm font-medium">{typeInfo.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Desde
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hasta
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota (opcional)
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
