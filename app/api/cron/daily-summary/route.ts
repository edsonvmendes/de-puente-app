import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    // Verificar authorization header (segurança do cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar se é dia útil (seg-sex)
    const today = new Date()
    const dayOfWeek = today.getDay() // 0=domingo, 6=sábado
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return NextResponse.json({ 
        message: 'Skipped: weekend', 
        day: dayOfWeek 
      })
    }

    // Obter data de hoje
    const todayStr = today.toISOString().split('T')[0]

    // Buscar ausências de hoje
    const { data: absences, error: absencesError } = await supabase
      .from('absences')
      .select(`
        *,
        profile:profile_id (
          id,
          full_name,
          email
        )
      `)
      .lte('start_date', todayStr)
      .gte('end_date', todayStr)
      .eq('status', 'approved')

    if (absencesError) {
      throw absencesError
    }

    // Buscar todos os usuários ativos que querem receber email
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('active', true)
      .eq('daily_email', true)

    if (usersError) {
      throw usersError
    }

    // Separar quem está ausente vs disponível
    const absentUserIds = new Set(absences?.map(a => a.profile_id) || [])
    const absentUsers = absences?.map(a => ({
      name: a.profile?.full_name,
      type: a.absence_type,
      startDate: a.start_date,
      endDate: a.end_date
    })) || []

    const availableUsers = users?.filter(u => !absentUserIds.has(u.id)) || []

    // Gerar HTML do email
    const emailHtml = generateEmailHtml(
      todayStr,
      absentUsers,
      availableUsers
    )

    // Enviar email para cada usuário
    const emailPromises = users?.map(async (user) => {
      return await sendEmail(user.email, emailHtml)
    }) || []

    await Promise.all(emailPromises)

    return NextResponse.json({
      success: true,
      date: todayStr,
      absentCount: absentUsers.length,
      availableCount: availableUsers.length,
      emailsSent: users?.length || 0
    })

  } catch (error: any) {
    console.error('Daily summary error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

function generateEmailHtml(
  date: string,
  absentUsers: any[],
  availableUsers: any[]
) {
  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const absentSection = absentUsers.length > 0 ? `
    <div style="margin: 20px 0;">
      <h2 style="color: #EF4444; font-size: 18px; margin-bottom: 15px;">
        🏖️ DE AUSENCIA HOY (${absentUsers.length})
      </h2>
      ${absentUsers.map(user => `
        <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; margin-bottom: 10px; border-radius: 4px;">
          <div style="font-weight: 600; color: #1F2937; margin-bottom: 4px;">
            ${user.name}
          </div>
          <div style="color: #6B7280; font-size: 14px;">
            ${getAbsenceTypeLabel(user.type)}
          </div>
          <div style="color: #9CA3AF; font-size: 12px; margin-top: 4px;">
            ${formatDateRange(user.startDate, user.endDate)}
          </div>
        </div>
      `).join('')}
    </div>
  ` : `
    <div style="margin: 20px 0;">
      <p style="color: #10B981; font-weight: 600;">
        ✅ ¡Todos disponibles hoy!
      </p>
    </div>
  `

  const availableSection = availableUsers.length > 0 ? `
    <div style="margin: 20px 0; padding: 15px; background: #F0FDF4; border-radius: 8px;">
      <h3 style="color: #10B981; font-size: 16px; margin-bottom: 10px;">
        ✅ DISPONIBLES HOY (${availableUsers.length})
      </h3>
      <div style="color: #1F2937; line-height: 1.6;">
        ${availableUsers.map(u => u.full_name).join(', ')}
      </div>
    </div>
  ` : ''

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #F9FAFB;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">
            📅 Daily Standup
          </h1>
          <p style="color: #DBEAFE; margin: 10px 0 0 0; font-size: 16px;">
            ${formattedDate}
          </p>
        </div>

        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          ${absentSection}
          ${availableSection}

          <!-- Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://de-puente-app.vercel.app'}" 
               style="display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Ver Calendário Completo
            </a>
            <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
              DE PUENTE - Gestión de Ausencias
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

function getAbsenceTypeLabel(type: string): string {
  const types: Record<string, string> = {
    'vacaciones': '🌴 Vacaciones',
    'dia_libre': '🏠 Día Libre',
    'permiso_medico': '🏥 Permiso Médico',
    'permiso_personal': '👤 Permiso Personal',
    'otro': '📋 Otro'
  }
  return types[type] || type
}

function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  if (start === end) {
    return startDate.toLocaleDateString('es-ES')
  }
  
  return `${startDate.toLocaleDateString('es-ES')} - ${endDate.toLocaleDateString('es-ES')}`
}

async function sendEmail(to: string, html: string): Promise<boolean> {
  try {
    // Usar Supabase Auth para enviar email
    // Nota: Supabase não tem API de email genérico, então vamos usar Resend
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'DE PUENTE <noreply@depuente.com>',
        to: [to],
        subject: `📅 Daily Standup - ${new Date().toLocaleDateString('es-ES')}`,
        html: html
      })
    })

    return response.ok
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}
