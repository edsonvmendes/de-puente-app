// Types para o projeto DE PUENTE

export type AbsenceType = 'vacaciones' | 'dia_libre' | 'viaje' | 'baja_medica'
export type MembershipStatus = 'active' | 'inactive'
export type UserRole = 'admin' | 'member'
export type HolidayScope = 'global'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  created_at: string
}

export interface TeamMembership {
  id: string
  profile_id: string
  team_id: string
  status: MembershipStatus
  joined_at: string
  left_at?: string
}

export interface Absence {
  id: string
  profile_id: string
  team_id: string
  type: AbsenceType
  start_date: string
  end_date: string
  note?: string
  created_at: string
  updated_at: string
}

export interface AbsenceWithDetails extends Absence {
  full_name: string
  email: string
  team_name: string
  business_days: number
}

export interface Holiday {
  id: string
  title: string
  scope: HolidayScope
  start_date: string
  end_date: string
  created_by?: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    type: 'absence' | 'holiday'
    data: AbsenceWithDetails | Holiday
  }
}
