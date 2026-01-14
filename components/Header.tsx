'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, Moon, Sun, User } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import toast from 'react-hot-toast'
import { useState, useEffect } from 'react'
import UserAvatar from './UserAvatar'

export default function Header() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    loadUser()
  }, [])

  async function loadUser() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setUserName(profile.full_name)
        setUserEmail(profile.email)
      }
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - empty for now */}
          <div></div>

          {/* Right side - User info & actions */}
          <div className="flex items-center gap-4">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? (
                <Sun size={20} className="text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>

            {/* User info */}
            {userName && (
              <div className="flex items-center gap-3">
                <UserAvatar name={userName} size="sm" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userEmail}
                  </p>
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
