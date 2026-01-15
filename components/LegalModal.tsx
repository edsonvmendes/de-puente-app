'use client'

import { X } from 'lucide-react'

interface LegalModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'privacy' | 'terms'
  language: 'es' | 'pt' | 'en'
}

export default function LegalModal({ isOpen, onClose, type, language }: LegalModalProps) {
  if (!isOpen) return null

  const content = {
    privacy: {
      es: {
        title: 'Política de Privacidad',
        content: `
          <h3>1. Información que Recopilamos</h3>
          <p>DE PUENTE es un sistema interno que recopila:</p>
          <ul>
            <li>Nombre completo y correo electrónico corporativo</li>
            <li>Fechas de ausencias solicitadas</li>
            <li>Tipo de ausencia (vacaciones, días libres, etc.)</li>
            <li>Equipos a los que perteneces</li>
          </ul>

          <h3>2. Uso de la Información</h3>
          <p>Utilizamos tu información exclusivamente para:</p>
          <ul>
            <li>Gestionar las ausencias del equipo</li>
            <li>Coordinar la disponibilidad del personal</li>
            <li>Generar reportes internos</li>
          </ul>

          <h3>3. Seguridad</h3>
          <p>Tus datos están protegidos mediante:</p>
          <ul>
            <li>Autenticación segura (Supabase Auth)</li>
            <li>Encriptación de datos en tránsito y reposo</li>
            <li>Control de acceso basado en roles</li>
            <li>Hosting seguro (Vercel + Supabase)</li>
          </ul>

          <h3>4. Acceso a Datos</h3>
          <p>Solo tienen acceso a tus datos:</p>
          <ul>
            <li>Administradores del sistema</li>
            <li>Miembros de tus equipos (solo fechas de ausencia)</li>
          </ul>

          <h3>5. Retención de Datos</h3>
          <p>Los datos se mantienen mientras seas empleado activo. Al finalizar tu relación laboral, los datos históricos se mantienen por requisitos legales (2 años).</p>

          <h3>6. Tus Derechos</h3>
          <p>Tienes derecho a:</p>
          <ul>
            <li>Acceder a tus datos personales</li>
            <li>Solicitar corrección de datos incorrectos</li>
            <li>Solicitar eliminación de datos (sujeto a requisitos legales)</li>
          </ul>

          <h3>7. Contacto</h3>
          <p>Para consultas sobre privacidad: <strong>edsonvmendes@gmail.com</strong></p>
        `
      },
      pt: {
        title: 'Política de Privacidade',
        content: `
          <h3>1. Informações que Coletamos</h3>
          <p>DE PUENTE é um sistema interno que coleta:</p>
          <ul>
            <li>Nome completo e e-mail corporativo</li>
            <li>Datas de ausências solicitadas</li>
            <li>Tipo de ausência (férias, folgas, etc.)</li>
            <li>Equipes às quais você pertence</li>
          </ul>

          <h3>2. Uso das Informações</h3>
          <p>Utilizamos suas informações exclusivamente para:</p>
          <ul>
            <li>Gerenciar as ausências da equipe</li>
            <li>Coordenar a disponibilidade do pessoal</li>
            <li>Gerar relatórios internos</li>
          </ul>

          <h3>3. Segurança</h3>
          <p>Seus dados estão protegidos mediante:</p>
          <ul>
            <li>Autenticação segura (Supabase Auth)</li>
            <li>Criptografia de dados em trânsito e em repouso</li>
            <li>Controle de acesso baseado em funções</li>
            <li>Hospedagem segura (Vercel + Supabase)</li>
          </ul>

          <h3>4. Acesso aos Dados</h3>
          <p>Apenas têm acesso aos seus dados:</p>
          <ul>
            <li>Administradores do sistema</li>
            <li>Membros das suas equipes (apenas datas de ausência)</li>
          </ul>

          <h3>5. Retenção de Dados</h3>
          <p>Os dados são mantidos enquanto você for funcionário ativo. Ao finalizar sua relação de trabalho, os dados históricos são mantidos por requisitos legais (2 anos).</p>

          <h3>6. Seus Direitos</h3>
          <p>Você tem direito a:</p>
          <ul>
            <li>Acessar seus dados pessoais</li>
            <li>Solicitar correção de dados incorretos</li>
            <li>Solicitar exclusão de dados (sujeito a requisitos legais)</li>
          </ul>

          <h3>7. Contato</h3>
          <p>Para consultas sobre privacidade: <strong>edsonvmendes@gmail.com</strong></p>
        `
      },
      en: {
        title: 'Privacy Policy',
        content: `
          <h3>1. Information We Collect</h3>
          <p>DE PUENTE is an internal system that collects:</p>
          <ul>
            <li>Full name and corporate email</li>
            <li>Requested absence dates</li>
            <li>Absence type (vacation, days off, etc.)</li>
            <li>Teams you belong to</li>
          </ul>

          <h3>2. Use of Information</h3>
          <p>We use your information exclusively to:</p>
          <ul>
            <li>Manage team absences</li>
            <li>Coordinate staff availability</li>
            <li>Generate internal reports</li>
          </ul>

          <h3>3. Security</h3>
          <p>Your data is protected by:</p>
          <ul>
            <li>Secure authentication (Supabase Auth)</li>
            <li>Data encryption in transit and at rest</li>
            <li>Role-based access control</li>
            <li>Secure hosting (Vercel + Supabase)</li>
          </ul>

          <h3>4. Data Access</h3>
          <p>Only have access to your data:</p>
          <ul>
            <li>System administrators</li>
            <li>Members of your teams (absence dates only)</li>
          </ul>

          <h3>5. Data Retention</h3>
          <p>Data is retained while you are an active employee. Upon termination of employment, historical data is retained for legal requirements (2 years).</p>

          <h3>6. Your Rights</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of incorrect data</li>
            <li>Request data deletion (subject to legal requirements)</li>
          </ul>

          <h3>7. Contact</h3>
          <p>For privacy inquiries: <strong>edsonvmendes@gmail.com</strong></p>
        `
      }
    },
    terms: {
      es: {
        title: 'Términos de Uso',
        content: `
          <h3>1. Aceptación de Términos</h3>
          <p>Al acceder a DE PUENTE, aceptas estos términos de uso.</p>

          <h3>2. Uso Permitido</h3>
          <p>Este sistema es exclusivamente para:</p>
          <ul>
            <li>Empleados activos de la empresa</li>
            <li>Gestión de ausencias laborales</li>
            <li>Coordinación interna del equipo</li>
          </ul>

          <h3>3. Prohibiciones</h3>
          <p>Está estrictamente prohibido:</p>
          <ul>
            <li>Compartir tus credenciales de acceso</li>
            <li>Acceder a datos de otros sin autorización</li>
            <li>Intentar burlar las medidas de seguridad</li>
            <li>Usar el sistema para fines no relacionados con el trabajo</li>
            <li>Extraer datos masivamente sin autorización</li>
          </ul>

          <h3>4. Responsabilidades del Usuario</h3>
          <p>Como usuario, te comprometes a:</p>
          <ul>
            <li>Mantener la confidencialidad de tu contraseña</li>
            <li>Reportar cualquier uso no autorizado</li>
            <li>Proporcionar información precisa y actualizada</li>
            <li>Seguir las políticas internas de la empresa</li>
          </ul>

          <h3>5. Disponibilidad del Servicio</h3>
          <p>Nos esforzamos por mantener el sistema disponible 24/7, pero no garantizamos disponibilidad continua debido a:</p>
          <ul>
            <li>Mantenimiento programado</li>
            <li>Actualizaciones de seguridad</li>
            <li>Circunstancias fuera de nuestro control</li>
          </ul>

          <h3>6. Cambios en los Términos</h3>
          <p>Nos reservamos el derecho de modificar estos términos. Los cambios serán notificados por email corporativo.</p>

          <h3>7. Terminación de Acceso</h3>
          <p>El acceso puede ser suspendido o terminado por:</p>
          <ul>
            <li>Violación de estos términos</li>
            <li>Finalización de la relación laboral</li>
            <li>Inactividad prolongada</li>
          </ul>

          <h3>8. Contacto</h3>
          <p>Para consultas sobre términos de uso: <strong>edsonvmendes@gmail.com</strong></p>
        `
      },
      pt: {
        title: 'Termos de Uso',
        content: `
          <h3>1. Aceitação dos Termos</h3>
          <p>Ao acessar o DE PUENTE, você aceita estes termos de uso.</p>

          <h3>2. Uso Permitido</h3>
          <p>Este sistema é exclusivamente para:</p>
          <ul>
            <li>Funcionários ativos da empresa</li>
            <li>Gestão de ausências de trabalho</li>
            <li>Coordenação interna da equipe</li>
          </ul>

          <h3>3. Proibições</h3>
          <p>É estritamente proibido:</p>
          <ul>
            <li>Compartilhar suas credenciais de acesso</li>
            <li>Acessar dados de outros sem autorização</li>
            <li>Tentar burlar as medidas de segurança</li>
            <li>Usar o sistema para fins não relacionados ao trabalho</li>
            <li>Extrair dados massivamente sem autorização</li>
          </ul>

          <h3>4. Responsabilidades do Usuário</h3>
          <p>Como usuário, você se compromete a:</p>
          <ul>
            <li>Manter a confidencialidade da sua senha</li>
            <li>Reportar qualquer uso não autorizado</li>
            <li>Fornecer informações precisas e atualizadas</li>
            <li>Seguir as políticas internas da empresa</li>
          </ul>

          <h3>5. Disponibilidade do Serviço</h3>
          <p>Nos esforçamos para manter o sistema disponível 24/7, mas não garantimos disponibilidade contínua devido a:</p>
          <ul>
            <li>Manutenção programada</li>
            <li>Atualizações de segurança</li>
            <li>Circunstâncias fora do nosso controle</li>
          </ul>

          <h3>6. Alterações nos Termos</h3>
          <p>Reservamo-nos o direito de modificar estes termos. As alterações serão notificadas por e-mail corporativo.</p>

          <h3>7. Encerramento de Acesso</h3>
          <p>O acesso pode ser suspenso ou encerrado por:</p>
          <ul>
            <li>Violação destes termos</li>
            <li>Término da relação de trabalho</li>
            <li>Inatividade prolongada</li>
          </ul>

          <h3>8. Contato</h3>
          <p>Para consultas sobre termos de uso: <strong>edsonvmendes@gmail.com</strong></p>
        `
      },
      en: {
        title: 'Terms of Use',
        content: `
          <h3>1. Acceptance of Terms</h3>
          <p>By accessing DE PUENTE, you accept these terms of use.</p>

          <h3>2. Permitted Use</h3>
          <p>This system is exclusively for:</p>
          <ul>
            <li>Active company employees</li>
            <li>Work absence management</li>
            <li>Internal team coordination</li>
          </ul>

          <h3>3. Prohibitions</h3>
          <p>It is strictly prohibited to:</p>
          <ul>
            <li>Share your access credentials</li>
            <li>Access others' data without authorization</li>
            <li>Attempt to bypass security measures</li>
            <li>Use the system for non-work purposes</li>
            <li>Mass extract data without authorization</li>
          </ul>

          <h3>4. User Responsibilities</h3>
          <p>As a user, you commit to:</p>
          <ul>
            <li>Maintain password confidentiality</li>
            <li>Report any unauthorized use</li>
            <li>Provide accurate and updated information</li>
            <li>Follow company internal policies</li>
          </ul>

          <h3>5. Service Availability</h3>
          <p>We strive to maintain 24/7 availability, but do not guarantee continuous service due to:</p>
          <ul>
            <li>Scheduled maintenance</li>
            <li>Security updates</li>
            <li>Circumstances beyond our control</li>
          </ul>

          <h3>6. Changes to Terms</h3>
          <p>We reserve the right to modify these terms. Changes will be notified via corporate email.</p>

          <h3>7. Access Termination</h3>
          <p>Access may be suspended or terminated for:</p>
          <ul>
            <li>Violation of these terms</li>
            <li>Termination of employment</li>
            <li>Prolonged inactivity</li>
          </ul>

          <h3>8. Contact</h3>
          <p>For terms of use inquiries: <strong>edsonvmendes@gmail.com</strong></p>
        `
      }
    }
  }

  const data = content[type][language]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <div 
          className="p-6 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: data.content }}
          style={{
            fontSize: '14px',
            lineHeight: '1.6'
          }}
        />

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style jsx global>{`
        .prose h3 {
          font-size: 1.1em;
          font-weight: 600;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }
        .prose p {
          margin-bottom: 1em;
          color: #4b5563;
        }
        .prose ul {
          margin-left: 1.5em;
          margin-bottom: 1em;
          list-style-type: disc;
        }
        .prose li {
          margin-bottom: 0.5em;
          color: #4b5563;
        }
        .prose strong {
          color: #3b82f6;
        }
      `}</style>
    </div>
  )
}
