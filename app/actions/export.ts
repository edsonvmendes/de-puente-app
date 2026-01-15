'use server'

import { createServerClient } from '@/lib/supabase/server'
import ExcelJS from 'exceljs'

interface ExportParams {
  teamIds: string[]
  startDate: string
  endDate: string
}

/**
 * Exportar ausencias a Excel
 * Usa la view absences_all_teams_with_business_days que muestra
 * las ausencias del usuario en TODOS sus equipos activos
 */
export async function exportAbsencesToExcel(params: ExportParams) {
  const supabase = await createServerClient()

  // Obtener datos
  const { data: absences, error } = await supabase
    .from('absences_all_teams_with_business_days')
    .select('*')
    .in('team_id', params.teamIds)
    .gte('start_date', params.startDate)
    .lte('end_date', params.endDate)
    .order('start_date', { ascending: true })

  if (error || !absences) {
    return { error: error?.message || 'Error al obtener datos' }
  }

  // Crear libro Excel
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Ausencias')

  // Definir columnas
  worksheet.columns = [
    { header: 'Usuario', key: 'usuario', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Equipo', key: 'equipo', width: 20 },
    { header: 'Tipo', key: 'tipo', width: 15 },
    { header: 'Fecha inicio', key: 'fecha_inicio', width: 15 },
    { header: 'Fecha fin', key: 'fecha_fin', width: 15 },
    { header: 'Días laborables', key: 'dias_laborables', width: 18 },
    { header: 'Nota', key: 'nota', width: 40 },
  ]

  // Estilizar header
  worksheet.getRow(1).font = { bold: true }
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF3B82F6' }
  }
  worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true }

  // Mapear tipos a español
  const typeLabels: Record<string, string> = {
    vacaciones: 'Vacaciones',
    dia_libre: 'Día libre',
    viaje: 'Viaje',
    baja_medica: 'Baja médica'
  }

  // Agregar datos
  absences.forEach((absence: any) => {
    worksheet.addRow({
      usuario: absence.full_name,
      email: absence.email,
      equipo: absence.team_name,
      tipo: typeLabels[absence.type] || absence.type,
      fecha_inicio: new Date(absence.start_date).toLocaleDateString('es-ES'),
      fecha_fin: new Date(absence.end_date).toLocaleDateString('es-ES'),
      dias_laborables: absence.business_days,
      nota: absence.note || '-',
    })
  })

  // Agregar resumen al final
  worksheet.addRow([])
  worksheet.addRow([])
  
  const summaryRow = worksheet.addRow(['RESUMEN', '', '', '', '', '', '', ''])
  summaryRow.font = { bold: true, size: 12 }
  summaryRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' }
  }

  // Calcular total de días laborables
  const totalDays = absences.reduce((sum: number, a: any) => sum + (a.business_days || 0), 0)
  worksheet.addRow(['Total días laborables:', '', '', '', '', '', totalDays, ''])

  // Generar buffer
  const buffer = await workbook.xlsx.writeBuffer()
  const base64 = Buffer.from(buffer).toString('base64')

  return {
    data: {
      filename: `ausencias_${params.startDate}_${params.endDate}.xlsx`,
      content: base64,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  }
}
