'use client'

import { useState } from 'react'
import { useLanguage } from './LanguageProvider'
import { Heart, Shield, FileText, Mail } from 'lucide-react'
import LegalModal from './LegalModal'

export default function Footer() {
  const { t, language } = useLanguage()
  const currentYear = new Date().getFullYear()
  const [showModal, setShowModal] = useState<'privacy' | 'terms' | null>(null)

  const texts = {
    es: {
      madeWith: 'Hecho con',
      by: 'por',
      company: 'tu equipo',
      version: 'Versión',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Uso',
      support: 'Soporte',
      rights: 'Todos los derechos reservados',
      internal: 'Herramienta interna para gestión de ausencias',
      contact: 'Contacto'
    },
    pt: {
      madeWith: 'Feito com',
      by: 'por',
      company: 'sua equipe',
      version: 'Versão',
      privacy: 'Política de Privacidade',
      terms: 'Termos de Uso',
      support: 'Suporte',
      rights: 'Todos os direitos reservados',
      internal: 'Ferramenta interna para gestão de ausências',
      contact: 'Contato'
    },
    en: {
      madeWith: 'Made with',
      by: 'by',
      company: 'your team',
      version: 'Version',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      support: 'Support',
      rights: 'All rights reserved',
      internal: 'Internal tool for absence management',
      contact: 'Contact'
    }
  }

  const text = texts[language as keyof typeof texts] || texts.es

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1: About */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              🌴 DE PUENTE
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {text.internal}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {text.madeWith} <Heart size={12} className="text-red-500 fill-current" /> {text.by} {text.company}
            </p>
          </div>

          {/* Column 2: Links Legales */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setShowModal('privacy')}
                  className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2"
                >
                  <Shield size={14} />
                  {text.privacy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowModal('terms')}
                  className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2"
                >
                  <FileText size={14} />
                  {text.terms}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Soporte */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">{text.support}</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="mailto:edsonvmendes@gmail.com"
                  className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2"
                >
                  <Mail size={14} />
                  {text.contact}
                </a>
              </li>
              <li className="text-xs text-gray-500">
                {text.version} 1.0.0
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © {currentYear} DE PUENTE. {text.rights}.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>🔒 Datos seguros</span>
              <span>•</span>
              <span>⚡ Sistema interno</span>
              <span>•</span>
              <span>🌐 Multi-idioma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legal Modals */}
      {showModal && (
        <LegalModal
          isOpen={!!showModal}
          onClose={() => setShowModal(null)}
          type={showModal}
          language={language as any}
        />
      )}
    </footer>
  )
}
