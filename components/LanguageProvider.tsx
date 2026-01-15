'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Language = 'pt' | 'en' | 'es'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  pt: {
    // Header
    'app.title': 'DE PUENTE',
    'button.admin': 'Admin',
    'button.logout': 'Sair',
    'button.summary': 'Resumen',
    'button.export': 'Exportar a Excel',
    'button.mark_absence': 'Marcar ausencia',
    
    // Calendar
    'calendar.today': 'Hoy',
    'calendar.month': 'Mes',
    'calendar.week': 'Semana',
    'calendar.filter_teams': 'Filtrar por equipo:',
    'calendar.my_teams': 'Mis equipos',
    
    // Absence types
    'absence.vacaciones': 'Vacaciones',
    'absence.dia_libre': 'Día libre',
    'absence.viaje': 'Viaje',
    'absence.baja_medica': 'Baja médica',
    
    // Modal
    'modal.create_absence': 'Marcar ausencia',
    'modal.type': 'Tipo de ausencia',
    'modal.team': 'Equipo',
    'modal.select_team': 'Selecciona un equipo',
    'modal.from': 'Desde',
    'modal.to': 'Hasta',
    'modal.note': 'Nota (opcional)',
    'modal.quick_actions': 'Acciones rápidas',
    'modal.today_only': 'Solo hoy',
    'modal.whole_week': 'Toda la semana',
    'modal.cancel': 'Cancelar',
    'modal.save': 'Guardar y disfrutar',
    
    // Toast messages
    'toast.absence_created': '¡Ausencia creada con éxito!',
    'toast.absence_updated': '¡Ausencia actualizada!',
    'toast.absence_deleted': 'Ausencia eliminada',
    'toast.session_closed': 'Sesión cerrada',
    'toast.error': 'Error',
    
    // Empty states
    'empty.no_teams': 'No tienes equipos asignados',
    'empty.no_teams_desc': 'Contacta con el administrador para que te añada a un equipo',
    'empty.no_absences': 'No hay ausencias este mes',
    'empty.no_absences_desc': 'Aún no se han registrado ausencias',
    
    // Summary
    'summary.title': 'Resumen de Ausencias',
    'summary.back': 'Volver al calendario',
    'summary.total_absences': 'Total Ausencias',
    'summary.business_days': 'Días Laborables',
    'summary.avg_per_person': 'Promedio por Persona',
    'summary.most_used': 'Tipo Más Usado',
    'summary.by_type': 'Ausencias por Tipo',
    'summary.by_person': 'Ausencias por Persona',
    'summary.person': 'Persona',
    'summary.absences': 'Ausencias',
    
    // Admin
    'admin.title': 'Admin Console',
    'admin.people': 'Personas',
    'admin.teams': 'Equipos',
    'admin.holidays': 'Festivos',
    'admin.invite': 'Invitar Persona',
    'admin.create_team': 'Crear Equipo',
    'admin.create_holiday': 'Crear Festivo',
  },
  en: {
    // Header
    'app.title': 'DE PUENTE',
    'button.admin': 'Admin',
    'button.logout': 'Logout',
    'button.summary': 'Summary',
    'button.export': 'Export to Excel',
    'button.mark_absence': 'Mark Absence',
    
    // Calendar
    'calendar.today': 'Today',
    'calendar.month': 'Month',
    'calendar.week': 'Week',
    'calendar.filter_teams': 'Filter by team:',
    'calendar.my_teams': 'My teams',
    
    // Absence types
    'absence.vacaciones': 'Vacation',
    'absence.dia_libre': 'Day Off',
    'absence.viaje': 'Business Trip',
    'absence.baja_medica': 'Sick Leave',
    
    // Modal
    'modal.create_absence': 'Mark Absence',
    'modal.type': 'Absence Type',
    'modal.team': 'Team',
    'modal.select_team': 'Select a team',
    'modal.from': 'From',
    'modal.to': 'To',
    'modal.note': 'Note (optional)',
    'modal.quick_actions': 'Quick Actions',
    'modal.today_only': 'Today only',
    'modal.whole_week': 'Whole week',
    'modal.cancel': 'Cancel',
    'modal.save': 'Save & Enjoy',
    
    // Toast messages
    'toast.absence_created': 'Absence created successfully!',
    'toast.absence_updated': 'Absence updated!',
    'toast.absence_deleted': 'Absence deleted',
    'toast.session_closed': 'Session closed',
    'toast.error': 'Error',
    
    // Empty states
    'empty.no_teams': 'No teams assigned',
    'empty.no_teams_desc': 'Contact the administrator to be added to a team',
    'empty.no_absences': 'No absences this month',
    'empty.no_absences_desc': 'No absences have been registered yet',
    
    // Summary
    'summary.title': 'Absence Summary',
    'summary.back': 'Back to calendar',
    'summary.total_absences': 'Total Absences',
    'summary.business_days': 'Business Days',
    'summary.avg_per_person': 'Average per Person',
    'summary.most_used': 'Most Used Type',
    'summary.by_type': 'Absences by Type',
    'summary.by_person': 'Absences by Person',
    'summary.person': 'Person',
    'summary.absences': 'Absences',
    
    // Admin
    'admin.title': 'Admin Console',
    'admin.people': 'People',
    'admin.teams': 'Teams',
    'admin.holidays': 'Holidays',
    'admin.invite': 'Invite Person',
    'admin.create_team': 'Create Team',
    'admin.create_holiday': 'Create Holiday',
  },
  es: {
    // Header
    'app.title': 'DE PUENTE',
    'button.admin': 'Admin',
    'button.logout': 'Cerrar Sesión',
    'button.summary': 'Resumen',
    'button.export': 'Exportar a Excel',
    'button.mark_absence': 'Marcar Ausencia',
    
    // Calendar
    'calendar.today': 'Hoy',
    'calendar.month': 'Mes',
    'calendar.week': 'Semana',
    'calendar.filter_teams': 'Filtrar por equipo:',
    'calendar.my_teams': 'Mis equipos',
    
    // Absence types
    'absence.vacaciones': 'Vacaciones',
    'absence.dia_libre': 'Día Libre',
    'absence.viaje': 'Viaje',
    'absence.baja_medica': 'Baja Médica',
    
    // Modal
    'modal.create_absence': 'Marcar Ausencia',
    'modal.type': 'Tipo de Ausencia',
    'modal.team': 'Equipo',
    'modal.select_team': 'Selecciona un equipo',
    'modal.from': 'Desde',
    'modal.to': 'Hasta',
    'modal.note': 'Nota (opcional)',
    'modal.quick_actions': 'Acciones Rápidas',
    'modal.today_only': 'Solo Hoy',
    'modal.whole_week': 'Toda la Semana',
    'modal.cancel': 'Cancelar',
    'modal.save': 'Guardar y Disfrutar',
    
    // Toast messages
    'toast.absence_created': '¡Ausencia creada con éxito!',
    'toast.absence_updated': '¡Ausencia actualizada!',
    'toast.absence_deleted': 'Ausencia eliminada',
    'toast.session_closed': 'Sesión cerrada',
    'toast.error': 'Error',
    
    // Empty states
    'empty.no_teams': 'No tienes equipos asignados',
    'empty.no_teams_desc': 'Contacta con el administrador para que te añada a un equipo',
    'empty.no_absences': 'No hay ausencias este mes',
    'empty.no_absences_desc': 'Aún no se han registrado ausencias',
    
    // Summary
    'summary.title': 'Resumen de Ausencias',
    'summary.back': 'Volver al Calendario',
    'summary.total_absences': 'Total Ausencias',
    'summary.business_days': 'Días Laborables',
    'summary.avg_per_person': 'Promedio por Persona',
    'summary.most_used': 'Tipo Más Usado',
    'summary.by_type': 'Ausencias por Tipo',
    'summary.by_person': 'Ausencias por Persona',
    'summary.person': 'Persona',
    'summary.absences': 'Ausencias',
    
    // Admin
    'admin.title': 'Consola de Administración',
    'admin.people': 'Personas',
    'admin.teams': 'Equipos',
    'admin.holidays': 'Festivos',
    'admin.invite': 'Invitar Persona',
    'admin.create_team': 'Crear Equipo',
    'admin.create_holiday': 'Crear Festivo',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('pt')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedLang = localStorage.getItem('language') as Language | null
    if (savedLang && (savedLang === 'pt' || savedLang === 'en' || savedLang === 'es')) {
      setLanguageState(savedLang)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['pt']] || key
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
