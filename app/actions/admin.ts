'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Verificar si el usuario actual es admin
 */
export async function isAdmin() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { isAdmin: false }

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return { isAdmin: data?.role === 'admin' }
}

/**
 * Obtener perfil del usuario actual
 */
export async function getCurrentProfile() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return data
}

/**
 * Invitar persona por email
 */
export async function invitePerson(email: string, fullName: string, teamIds: string[]) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  // Nota: necesitas configurar inviteUserByEmail en Supabase Auth
  // Por ahora, creamos el usuario directamente (en producción usar inviteUserByEmail)
  
  // Crear usuario
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: Math.random().toString(36).slice(-16), // Password temporal
    options: {
      data: { full_name: fullName }
    }
  })

  if (authError) {
    return { error: authError.message }
  }

  // Agregar a equipos
  if (authData.user && teamIds.length > 0) {
    const userId = authData.user.id // Garantir que não é null
    const memberships = teamIds.map(teamId => ({
      profile_id: userId,
      team_id: teamId,
      status: 'active' as const
    }))

    await supabase.from('team_memberships').insert(memberships)
  }

  revalidatePath('/admin/people')
  return { data: authData }
}

/**
 * Cambiar estado de membresía (dar de alta/baja)
 */
export async function updateMembershipStatus(
  membershipId: string,
  status: 'active' | 'inactive'
) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('team_memberships')
    .update({
      status,
      left_at: status === 'inactive' ? new Date().toISOString() : null
    })
    .eq('id', membershipId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/people')
  revalidatePath('/')
  return { data }
}

/**
 * Actualizar rol de usuario
 */
export async function updateUserRole(userId: string, role: 'admin' | 'member') {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/people')
  return { data }
}

/**
 * Crear equipo
 */
export async function createTeam(name: string) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('teams')
    .insert({ name })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { data }
}

/**
 * Actualizar equipo
 */
export async function updateTeam(id: string, name: string) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('teams')
    .update({ name })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/teams')
  revalidatePath('/')
  return { data }
}

/**
 * Agregar miembro a equipo
 */
export async function addTeamMember(teamId: string, profileId: string) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('team_memberships')
    .insert({
      team_id: teamId,
      profile_id: profileId,
      status: 'active'
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/teams')
  revalidatePath('/admin/people')
  return { data }
}

/**
 * Crear festivo oficial
 */
export async function createHoliday(
  title: string,
  startDate: string,
  endDate: string
) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('holidays')
    .insert({
      title,
      start_date: startDate,
      end_date: endDate,
      scope: 'global',
      created_by: user?.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/holidays')
  revalidatePath('/')
  return { data }
}

/**
 * Actualizar festivo
 */
export async function updateHoliday(
  id: string,
  title: string,
  startDate: string,
  endDate: string
) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('holidays')
    .update({
      title,
      start_date: startDate,
      end_date: endDate
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/holidays')
  revalidatePath('/')
  return { data }
}

/**
 * Eliminar festivo
 */
export async function deleteHoliday(id: string) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { error } = await supabase
    .from('holidays')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/holidays')
  revalidatePath('/')
  return { success: true }
}

/**
 * Obtener todas las personas
 */
export async function getAllPeople() {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { data: [], error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      team_memberships (
        id,
        status,
        joined_at,
        left_at,
        team:team_id (
          id,
          name
        )
      )
    `)
    .order('full_name')

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

/**
 * Obtener todos los equipos
 */
export async function getAllTeams() {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { data: [], error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  // Buscar teams
  const { data: teamsData, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .order('name')

  if (teamsError) {
    return { data: [], error: teamsError.message }
  }

  // Para cada team, contar membros
  const teamsWithCount = await Promise.all(
    (teamsData || []).map(async (team) => {
      const { count } = await supabase
        .from('team_memberships')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team.id)
        .eq('status', 'active')
      
      return {
        ...team,
        member_count: count || 0
      }
    })
  )

  return { data: teamsWithCount, error: null }
}

/**
 * Remover miembro de equipo
 */
export async function removeTeamMember(membershipId: string) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  const { error } = await supabase
    .from('team_memberships')
    .delete()
    .eq('id', membershipId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { data: true }
}

/**
 * Eliminar equipo
 */
export async function deleteTeam(teamId: string) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  // Primero eliminar membresías
  await supabase
    .from('team_memberships')
    .delete()
    .eq('team_id', teamId)

  // Luego eliminar el team
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { data: true }
}

/**
 * Desactivar/activar usuario
 */
export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const admin = await isAdmin()
  if (!admin.isAdmin) {
    return { error: 'No autorizado' }
  }

  const supabase = await createServerClient()

  // Actualizar estado en auth.users (si es posible) y profiles
  const { error } = await supabase
    .from('profiles')
    .update({ active: !currentStatus })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return { data: true }
}
