'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { getAbsenceInfo, HOLIDAY_CONFIG } from '@/lib/utils/absence-types'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: any
}

interface CalendarViewProps {
  absences: any[]
  holidays: any[]
  onEventClick: (event: any) => void
  onDateSelect?: (start: Date, end: Date) => void
}

export default function CalendarView({
  absences,
  holidays,
  onEventClick,
  onDateSelect
}: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    // Convertir ausencias a eventos
    const absenceEvents: CalendarEvent[] = absences.map(absence => {
      const info = getAbsenceInfo(absence.type)
      
      return {
        id: absence.id,
        title: `${info.emoji} ${absence.full_name}`,
        start: absence.start_date,
        end: calculateEndDate(absence.end_date), // FullCalendar end es exclusivo
        backgroundColor: info.color,
        borderColor: info.color,
        extendedProps: {
          type: 'absence',
          data: absence
        }
      }
    })

    // Convertir festivos a eventos
    const holidayEvents: CalendarEvent[] = holidays.map(holiday => {
      return {
        id: holiday.id,
        title: `${HOLIDAY_CONFIG.emoji} ${holiday.title}`,
        start: holiday.start_date,
        end: calculateEndDate(holiday.end_date),
        backgroundColor: HOLIDAY_CONFIG.color,
        borderColor: HOLIDAY_CONFIG.color,
        extendedProps: {
          type: 'holiday',
          data: holiday
        }
      }
    })

    setEvents([...absenceEvents, ...holidayEvents])
  }, [absences, holidays])

  // FullCalendar trata end como exclusivo, sumamos 1 día
  function calculateEndDate(dateStr: string): string {
    const date = new Date(dateStr)
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="calendar-container bg-white rounded-lg shadow p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={esLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        buttonText={{
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana'
        }}
        events={events}
        eventClick={(info) => {
          info.jsEvent.preventDefault()
          onEventClick(info.event.extendedProps.data)
        }}
        selectable={!!onDateSelect}
        select={(info) => {
          if (onDateSelect) {
            onDateSelect(info.start, info.end)
          }
        }}
        height="auto"
        firstDay={1} // Lunes
        weekends={true}
        editable={false}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          meridiem: false
        }}
      />

      <style jsx global>{`
        .fc {
          font-family: inherit;
        }
        
        .fc-event {
          cursor: pointer;
          transition: transform 0.2s;
        }
        
        .fc-event:hover {
          transform: scale(1.02);
        }
        
        .fc-daygrid-event {
          padding: 4px 6px;
          margin: 1px 0;
          border-radius: 4px;
        }
        
        .fc-button {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        
        .fc-button:hover {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }
        
        .fc-button-active {
          background-color: #1e40af !important;
          border-color: #1e40af !important;
        }
        
        .fc-daygrid-day.fc-day-today {
          background-color: #eff6ff !important;
        }
      `}</style>
    </div>
  )
}
