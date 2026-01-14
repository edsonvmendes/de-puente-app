/**
 * Calcula días laborables entre dos fechas (excluyendo sábados y domingos)
 */
export function countBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    // 0 = domingo, 6 = sábado
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}

/**
 * Formatea fecha para display en español
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Formatea fecha para input type="date"
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Obtiene el inicio y fin de la semana actual
 */
export function getCurrentWeek(): { start: Date; end: Date } {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Lunes como inicio
  
  const start = new Date(today)
  start.setDate(today.getDate() + diff)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Añade días a una fecha
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
