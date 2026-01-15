'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAbsences, getUserActiveTeams } from '@/app/actions/absences'
import { CalendarSkeleton } from '@/components/Skeleton'
import { ArrowLeft, Calendar, Users, TrendingUp, Palmtree } from 'lucide-react'
import { motion } from 'framer-motion'
import { ABSENCE_TYPES } from '@/lib/utils/absence-types'

interface Stats {
  totalAbsences: number
  totalDays: number
  byType: { [key: string]: number }
  byPerson: { name: string; count: number; days: number }[]
  byMonth: { month: string; count: number }[]
}

export default function ResumenPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [userTeams, setUserTeams] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [selectedYear])

  async function loadData() {
    setIsLoading(true)

    // Verificar autenticação
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Cargar equipos
    const { data: teams } = await getUserActiveTeams()
    setUserTeams(teams || [])

    if (!teams || teams.length === 0) {
      setIsLoading(false)
      return
    }

    // Cargar ausencias del año
    const startDate = `${selectedYear}-01-01`
    const endDate = `${selectedYear}-12-31`
    const teamIds = teams.map((t: any) => t.id)
    
    const { data: absences } = await getAbsences(teamIds, startDate, endDate)

    if (absences) {
      calculateStats(absences)
    }

    setIsLoading(false)
  }

  function calculateStats(absences: any[]) {
    // DEDUPLICAR ausencias por ID
    // Como la view retorna la misma ausencia múltiples veces (una por equipo),
    // deduplicamos para calcular estadísticas correctas
    const uniqueAbsences = absences.reduce((acc, absence) => {
      if (!acc.find((a: any) => a.id === absence.id)) {
        acc.push(absence)
      }
      return acc
    }, [] as any[])

    const byType: { [key: string]: number } = {}
    const byPerson: { [key: string]: { name: string; count: number; days: number } } = {}
    const byMonth: { [key: string]: number } = {}
    
    let totalDays = 0

    uniqueAbsences.forEach(absence => {
      // Por tipo
      byType[absence.type] = (byType[absence.type] || 0) + 1

      // Por persona
      const personKey = absence.profile_id
      if (!byPerson[personKey]) {
        byPerson[personKey] = {
          name: absence.full_name || 'Usuario',
          count: 0,
          days: 0
        }
      }
      byPerson[personKey].count++
      byPerson[personKey].days += absence.business_days || 0
      totalDays += absence.business_days || 0

      // Por mes
      const month = new Date(absence.start_date).toLocaleString('es-ES', { month: 'long' })
      byMonth[month] = (byMonth[month] || 0) + 1
    })

    setStats({
      totalAbsences: uniqueAbsences.length,
      totalDays,
      byType,
      byPerson: Object.values(byPerson).sort((a, b) => b.days - a.days),
      byMonth: Object.entries(byMonth).map(([month, count]) => ({ month, count }))
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
          <CalendarSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft size={20} />
            Volver al calendario
          </button>

          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              📊 Resumen de Ausencias
            </h1>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {[2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {!stats ? (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No hay datos de ausencias para mostrar
          </div>
        ) : (
          <>
            {/* Cards de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Total Ausencias
                  </div>
                  <Calendar className="text-blue-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalAbsences}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Días Laborables
                  </div>
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalDays}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Promedio por Persona
                  </div>
                  <Users className="text-purple-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.byPerson.length > 0 
                    ? Math.round(stats.totalDays / stats.byPerson.length) 
                    : 0}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    Tipo Más Usado
                  </div>
                  <Palmtree className="text-orange-600" size={24} />
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Object.keys(stats.byType).length > 0
                    ? ABSENCE_TYPES[Object.keys(stats.byType).sort((a, b) => 
                        stats.byType[b] - stats.byType[a]
                      )[0] as keyof typeof ABSENCE_TYPES]?.label || '-'
                    : '-'}
                </div>
              </motion.div>
            </div>

            {/* Por Tipo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ausencias por Tipo
              </h2>
              <div className="space-y-4">
                {Object.entries(stats.byType).map(([type, count]) => {
                  const typeInfo = ABSENCE_TYPES[type as keyof typeof ABSENCE_TYPES]
                  const percentage = (count / stats.totalAbsences) * 100
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 dark:text-gray-300">
                          {typeInfo?.emoji} {typeInfo?.label}
                        </span>
                        <span className="text-gray-900 dark:text-white font-semibold">
                          {count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Por Persona */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Ausencias por Persona
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-400">
                        Persona
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                        Ausencias
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600 dark:text-gray-400">
                        Días Laborables
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {stats.byPerson.map((person, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-gray-900 dark:text-white">
                          {person.name}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                          {person.count}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                          {person.days}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  )
}
