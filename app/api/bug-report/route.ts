import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const bugReport = await request.json()

    // Opção 1: Salvar no Supabase
    const { error: dbError } = await supabase
      .from('bug_reports')
      .insert({
        description: bugReport.description,
        user_email: bugReport.user_email,
        url: bugReport.url,
        user_agent: bugReport.user_agent,
        screen_size: bugReport.screen_size,
        language: bugReport.language,
        created_at: bugReport.timestamp
      })

    if (dbError) {
      console.error('Error saving bug report:', dbError)
    }

    // Opção 2: Enviar email (se tiver Resend configurado)
    if (process.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DE PUENTE Bugs <bugs@depuente.com>',
          to: ['edsonvmendes@gmail.com'], // Seu email
          subject: `🐛 Bug Report: ${bugReport.url}`,
          html: `
            <h2>🐛 Novo Bug Reportado</h2>
            <p><strong>Usuário:</strong> ${bugReport.user_email}</p>
            <p><strong>Página:</strong> ${bugReport.url}</p>
            <p><strong>Data:</strong> ${new Date(bugReport.timestamp).toLocaleString('es-ES')}</p>
            
            <h3>Descrição:</h3>
            <p style="white-space: pre-wrap;">${bugReport.description}</p>
            
            <h3>Informação Técnica:</h3>
            <ul>
              <li><strong>Navegador:</strong> ${bugReport.user_agent}</li>
              <li><strong>Tela:</strong> ${bugReport.screen_size}</li>
              <li><strong>Idioma:</strong> ${bugReport.language}</li>
            </ul>
            
            <hr>
            <p><small>Enviado automaticamente de DE PUENTE</small></p>
          `
        })
      })
    }

    // Opção 3: Webhook para Slack (se tiver)
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🐛 *Nuevo Bug Reportado*\n*Usuario:* ${bugReport.user_email}\n*Página:* ${bugReport.url}\n*Descripción:* ${bugReport.description}`
        })
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Bug report error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
