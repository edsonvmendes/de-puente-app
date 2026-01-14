'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AbsenceType = 'vacaciones' | 'dia_libre' | 'viaje' | 'baja_medica'

export interface CreateAbsenceInput {
  teamId: string
  type: AbsenceType
  startDate: string // YYYY-MM-DD
  endDate: string
  note?: string
}

export interface UpdateAbsenceInput extends CreateAbsenceInput {
  id: string
}

/**
 * Crear nueva ausencia
 */
export async function createAbsence(input: CreateAbsenceInput) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('absences')
    .insert({
      profile_id: user.id,
      team_id: input.teamId,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      note: input.note || null
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { data }
}

/**
 * Actualizar ausencia existente
 */
export async function updateAbsence(input: UpdateAbsenceInput) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('absences')
    .update({
      team_id: input.teamId,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      note: input.note || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { data }
}

/**
 * Eliminar ausencia
 */
export async function deleteAbsence(id: string) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from('absences')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

/**
 * Ajustar fechas rápido (+/- días)
 */
export async function adjustAbsenceDates(
  id: string,
  adjustment: number // días a sumar/restar
) {
  const supabase = await createServerClient()

  // Obtener ausencia actual
  const { data: absence } = await supabase
    .from('absences')
    .select('start_date, end_date')
    .eq('id', id)
    .single()

  if (!absence) {
    return { error: 'Ausencia no encontrada' }
  }

  const newStart = new Date(absence.start_date)
  newStart.setDate(newStart.getDate() + adjustment)
  
  const newEnd = new Date(absence.end_date)
  newEnd.setDate(newEnd.getDate() + adjustment)

  const { data, error } = await supabase
    .from('absences')
    .update({
      start_date: newStart.toISOString().split('T')[0],
      end_date: newEnd.toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { data }
}

/**
 * Obtener equipos activos del usuario actual
 */
export async function getUserActiveTeams() {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: [], error: 'No autenticado' }
  }

  const { data, error } = await supabase
    .from('team_memberships')
    .select(`
      team_id,
      teams:team_id (
        id,
        name
      )
    `)
    .eq('profile_id', user.id)
    .eq('status', 'active')

  if (error) {
    return { data: [], error: error.message }
  }

  // Transformar respuesta
  const teams = data
    .filter(m => m.teams)
    .map(m => m.teams)
    .filter(Boolean)

  return { data: teams as any[], error: null }
}

/**
 * Obtener ausencias por equipo y rango de fechas
 */
export async function getAbsences(teamIds: string[], startDate?: string, endDate?: string) {
  const supabase = await createServerClient()

  let query = supabase
    .from('absences_with_business_days')
    .select('*')
    .in('team_id', teamIds)
    .order('start_date', { ascending: true })

  if (startDate) {
    query = query.gte('start_date', startDate)
  }

  if (endDate) {
    query = query.lte('end_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

/**
 * Obtener festivos
 */
export async function getHolidays(startDate?: string, endDate?: string) {
  const supabase = await createServerClient()

  let query = supabase
    .from('holidays')
    .select('*')
    .order('start_date', { ascending: true })

  if (startDate) {
    query = query.gte('start_date', startDate)
  }

  if (endDate) {
    query = query.lte('end_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}
