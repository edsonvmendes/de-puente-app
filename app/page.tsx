'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getUserActiveTeams, getAbsences, getHolidays } from '@/app/actions/absences'
import CalendarView from '@/components/CalendarView'
import CreateAbsenceModal from '@/components/CreateAbsenceModal'
import AbsenceDetailModal from '@/components/AbsenceDetailModal'
import TodayOffCard from '@/components/TodayOffCard'
import ExportButton from '@/components/ExportButton'
import LanguageSelector from '@/components/LanguageSelector'
import { useLanguage } from '@/components/LanguageProvider'
// import Header from '@/components/Header' // Temporariamente desabilitado
import { CalendarSkeleton } from '@/components/Skeleton'
import EmptyState from '@/components/EmptyState'
import { Plus, Settings, FileText, Calendar as CalendarIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function HomePage() {
  const router = useRouter()
  const supabase = createClient()
  
  // Safe language hook (pode falhar durante SSR)
  let t = (key: string) => key
  try {
    const lang = useLanguage()
    t = lang.t
  } catch (e) {
    // Durante SSR, usar fallback
  }

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [absences, setAbsences] = useState<any[]>([])
  const [holidays, setHolidays] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedAbsence, setSelectedAbsence] = useState<any>(null)

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
  }, [])

  // Recargar ausencias cuando cambian los equipos seleccionados
  useEffect(() => {
    if (selectedTeamIds.length > 0) {
      loadAbsences()
    }
  }, [selectedTeamIds])

  async function loadInitialData() {
    setIsLoading(true)

    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)

    // Cargar perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profileData)

    // Cargar equipos del usuario (DIRETO DO CLIENTE)
    console.log('Loading teams for user:', user.id)
    const { data: membershipsData, error: membershipsError } = await supabase
      .from('team_memberships')
      .select(`
        team_id,
        teams:team_id (
          id,
          name,
          category
        )
      `)
      .eq('profile_id', user.id)
      .eq('status', 'active')

    console.log('Memberships result:', { membershipsData, membershipsError })

    const teams = (membershipsData || [])
      .filter(m => m.teams)
      .map(m => m.teams)
      .filter(Boolean)

    console.log('Teams extracted:', teams)
    
    setUserTeams(teams || [])

    if (!teams || teams.length === 0) {
      toast.error('No tienes equipos asignados. Contacta al administrador.')
      setIsLoading(false)
      return
    }

    // Seleccionar todos los equipos del usuario por defecto
    const teamIds = (teams || []).map((t: any) => t.id)
    setSelectedTeamIds(teamIds)

    // Cargar festivos
    await loadHolidays()

    setIsLoading(false)
  }

  async function loadAbsences() {
    const { data } = await getAbsences(selectedTeamIds)
    setAbsences(data || [])
  }

  async function loadHolidays() {
    const { data } = await getHolidays()
    setHolidays(data || [])
  }

  const handleEventClick = (eventData: any) => {
    // Si es festivo, no hacer nada
    if (eventData.scope) return

    setSelectedAbsence(eventData)
    setShowDetailModal(true)
  }

  const handleModalClose = () => {
    setShowCreateModal(false)
    setShowDetailModal(false)
    setSelectedAbsence(null)
    loadAbsences()
  }

  const canEditAbsence = (absence: any) => {
    if (!profile || !absence) return false
    return profile.role === 'admin' || absence.profile_id === user?.id
  }

  // Calcular rango de fechas para export
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* <Header /> */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <div className="mb-6">
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          </div>
          <CalendarSkeleton />
        </div>
      </div>
    )
  }

  // Se não tem equipos
  if (userTeams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* <Header /> */}
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          <EmptyState
            icon={CalendarIcon}
            title="No tienes equipos asignados"
            description="Contacta con el administrador para que te añada a un equipo y puedas gestionar tus ausencias"
            action={
              profile?.role === 'admin'
                ? {
                    label: 'Ir al Admin Console',
                    onClick: () => router.push('/admin'),
                  }
                : undefined
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* <Header /> */}
      
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🌴 DE PUENTE</h1>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              {profile?.role === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  <Settings size={16} />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                  toast.success(t('toast.session_closed'))
                  router.push('/login')
                }}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                title={t('button.logout')}
              >
                <span className="text-sm">{t('button.logout')}</span>
              </button>
              <button
                onClick={() => router.push('/resumen')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">{t('button.summary')}</span>
              </button>
              <ExportButton
                teamIds={selectedTeamIds}
                startDate={firstDayOfMonth.toISOString().split('T')[0]}
                endDate={lastDayOfMonth.toISOString().split('T')[0]}
              />
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">{t('button.mark_absence')}</span>
              </button>
            </div>
          </div>

          {/* Filtro de equipos */}
          {userTeams.length > 1 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('calendar.filter_teams')}
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTeamIds(userTeams.map(t => t.id))}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    selectedTeamIds.length === userTeams.length
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  Mis equipos
                </button>
                {userTeams.map(team => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeamIds([team.id])}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      selectedTeamIds.length === 1 && selectedTeamIds[0] === team.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Tarjeta "Hoy están de puente" */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TodayOffCard absences={absences} />
        </motion.div>

        {/* Calendario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {absences.length === 0 && holidays.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12">
              <EmptyState
                icon={CalendarIcon}
                title="No hay ausencias este mes"
                description="Aún no se han registrado ausencias. ¡Comienza marcando tu primera ausencia!"
                action={{
                  label: 'Marcar primera ausencia',
                  onClick: () => setShowCreateModal(true),
                }}
              />
            </div>
          ) : (
            <CalendarView
              absences={absences}
              holidays={holidays}
              onEventClick={handleEventClick}
            />
          )}
        </motion.div>

        {/* Modals */}
        <CreateAbsenceModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          userTeams={userTeams}
        />

        {selectedAbsence && (
          <AbsenceDetailModal
            absence={selectedAbsence}
            isOpen={showDetailModal}
            onClose={handleModalClose}
            canEdit={canEditAbsence(selectedAbsence)}
            userTeams={userTeams}
          />
        )}
      </div>
    </div>
  )
}
