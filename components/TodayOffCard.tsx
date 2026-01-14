'use client'

import { getAbsenceInfo } from '@/lib/utils/absence-types'
import { isToday, formatDate } from '@/lib/utils/dates'

interface TodayOffCardProps {
  absences: any[]
}

export default function TodayOffCard({ absences }: TodayOffCardProps) {
  // Filtrar ausencias que incluyen hoy
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const todayAbsences = absences.filter(absence => {
    const start = new Date(absence.start_date)
    const end = new Date(absence.end_date)
    return start <= today && end >= today
  })

  if (todayAbsences.length === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="font-semibold text-blue-900 mb-3">
        Hoy están de puente:
      </h3>
      <div className="space-y-2">
        {todayAbsences.map((absence) => {
          const info = getAbsenceInfo(absence.type)
          const isOnlyToday = absence.start_date === todayStr && absence.end_date === todayStr
          const endsToday = absence.end_date === todayStr
          
          return (
            <div key={absence.id} className="flex items-center gap-2 text-sm">
              <span className="text-xl">{info.emoji}</span>
              <span className="font-medium">{absence.full_name}</span>
              <span className="text-gray-600">
                {isOnlyToday 
                  ? '(solo hoy)' 
                  : endsToday
                  ? '(último día)'
                  : `(hasta ${formatDate(absence.end_date)})`
                }
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
