'use client'

import { useState } from 'react'
import { exportAbsencesToExcel } from '@/app/actions/export'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  teamIds: string[]
  startDate: string
  endDate: string
}

export default function ExportButton({ teamIds, startDate, endDate }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const result = await exportAbsencesToExcel({
        teamIds,
        startDate,
        endDate
      })

      if (result.error) {
        alert('Error al exportar: ' + result.error)
        return
      }

      // Crear blob y descargar
      const byteCharacters = atob(result.data!.content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: result.data!.mimeType })

      // Crear link de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.data!.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Error al exportar')
      console.error(error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors"
    >
      <Download size={16} />
      {isExporting ? 'Exportando...' : 'Exportar a Excel'}
    </button>
  )
}
