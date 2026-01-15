/**
 * Input Validation & Sanitization Utilities
 */

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

/**
 * Validar email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validar UUID
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Sanitizar string (prevenir XSS)
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  if (typeof input !== 'string') {
    throw new ValidationError('Input must be a string')
  }
  
  // Remover tags HTML
  const sanitized = input
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maxLength)
  
  return sanitized
}

/**
 * Validar nome de team/pessoa
 */
export function validateName(name: string): string {
  const sanitized = sanitizeString(name, 100)
  
  if (sanitized.length < 2) {
    throw new ValidationError('Name must be at least 2 characters')
  }
  
  if (sanitized.length > 100) {
    throw new ValidationError('Name must be less than 100 characters')
  }
  
  return sanitized
}

/**
 * Validar data (YYYY-MM-DD)
 */
export function validateDate(dateStr: string): Date {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  
  if (!dateRegex.test(dateStr)) {
    throw new ValidationError('Invalid date format. Expected YYYY-MM-DD')
  }
  
  const date = new Date(dateStr)
  
  if (isNaN(date.getTime())) {
    throw new ValidationError('Invalid date')
  }
  
  return date
}

/**
 * Validar range de datas
 */
export function validateDateRange(startDate: string, endDate: string): { start: Date, end: Date } {
  const start = validateDate(startDate)
  const end = validateDate(endDate)
  
  if (start > end) {
    throw new ValidationError('Start date must be before end date')
  }
  
  // Máximo 365 dias
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > 365) {
    throw new ValidationError('Date range cannot exceed 365 days')
  }
  
  return { start, end }
}

/**
 * Validar tipo de ausência
 */
export function validateAbsenceType(type: string): string {
  const validTypes = ['vacaciones', 'dia_libre', 'permiso_medico', 'permiso_personal', 'otro']
  
  if (!validTypes.includes(type)) {
    throw new ValidationError(`Invalid absence type. Must be one of: ${validTypes.join(', ')}`)
  }
  
  return type
}

/**
 * Validar role
 */
export function validateRole(role: string): 'admin' | 'member' {
  if (role !== 'admin' && role !== 'member') {
    throw new ValidationError('Invalid role. Must be "admin" or "member"')
  }
  
  return role
}

/**
 * Validar categoria de team
 */
export function validateTeamCategory(category: string): string {
  const validCategories = ['departamento', 'proyecto', 'funcional']
  
  if (!validCategories.includes(category)) {
    throw new ValidationError(`Invalid category. Must be one of: ${validCategories.join(', ')}`)
  }
  
  return category
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  check(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Limpar requests antigos
    const recentRequests = requests.filter(time => now - time < this.windowMs)
    
    if (recentRequests.length >= this.maxRequests) {
      return false
    }
    
    recentRequests.push(now)
    this.requests.set(identifier, recentRequests)
    
    return true
  }
  
  reset(identifier: string) {
    this.requests.delete(identifier)
  }
}
