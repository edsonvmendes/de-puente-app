export const ABSENCE_TYPES = {
  vacaciones: {
    label: 'Vacaciones',
    emoji: '🌴',
    color: '#10b981', // green
  },
  dia_libre: {
    label: 'Día libre',
    emoji: '🛌',
    color: '#3b82f6', // blue
  },
  viaje: {
    label: 'Viaje',
    emoji: '✈️',
    color: '#8b5cf6', // purple
  },
  baja_medica: {
    label: 'Baja médica',
    emoji: '🤒',
    color: '#ef4444', // red
  },
} as const

export type AbsenceType = keyof typeof ABSENCE_TYPES

export function getAbsenceInfo(type: AbsenceType) {
  return ABSENCE_TYPES[type]
}

export const HOLIDAY_CONFIG = {
  label: 'Festivo Gestamp',
  emoji: '🎉',
  color: '#6b7280', // gray
}
