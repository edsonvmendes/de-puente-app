'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  isAdmin, 
  invitePerson, 
  updateMembershipStatus, 
  createTeam, 
  createHoliday,
  getAllPeople,
  getAllTeams
} from '@/app/actions/admin'
import { Users, Building2, Calendar, X, Plus, Trash2, Edit2 } from 'lucide-react'

type Tab = 'people' | 'teams' | 'holidays'

export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('people')
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [loading, setLoading] = useState(true)

  // People state
  const [people, setPeople] = useState<any[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'member' | 'admin'>('member')

  // Teams state
  const [teams, setTeams] = useState<any[]>([])
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [teamName, setTeamName] = useState('')

  // Holidays state
  const [holidays, setHolidays] = useState<any[]>([])
  const [showHolidayModal, setShowHolidayModal] = useState(false)
  const [holidayName, setHolidayName] = useState('')
  const [holidayStart, setHolidayStart] = useState('')
  const [holidayEnd, setHolidayEnd] = useState('')

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (isAdminUser) {
      loadData()
    }
  }, [isAdminUser, activeTab])

  async function checkAdmin() {
    const result = await isAdmin()
    if (!result.isAdmin) {
      router.push('/')
      return
    }
    setIsAdminUser(true)
    setLoading(false)
  }

  async function loadData() {
    const supabase = createClient()
    
    if (activeTab === 'people') {
      const { data } = await getAllPeople()
      setPeople(data || [])
    } else if (activeTab === 'teams') {
      // Buscar teams diretamente via cliente para evitar cache
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select('*')
        .order('name')
      
      if (!error && teamsData) {
        // Contar membros para cada team
        const teamsWithCount = await Promise.all(
          teamsData.map(async (team) => {
            const { count } = await supabase
              .from('team_memberships')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', team.id)
              .eq('status', 'active')
            
            return {
              ...team,
              member_count: count || 0
            }
          })
        )
        console.log('Teams loaded from client:', teamsWithCount)
        setTeams(teamsWithCount)
      } else {
        console.error('Error loading teams:', error)
        setTeams([])
      }
    } else if (activeTab === 'holidays') {
      const { data } = await supabase
        .from('holidays')
        .select('*')
        .order('start_date', { ascending: true })
      setHolidays(data || [])
    }
  }

  async function handleInvite() {
    if (!inviteEmail || !inviteName) return
    
    const result = await invitePerson(inviteEmail, inviteName, []) // Passar array vazio por enquanto
    if (!result.error) {
      setShowInviteModal(false)
      setInviteEmail('')
      setInviteName('')
      setInviteRole('member')
      loadData()
      alert('Persona invitada con éxito')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleCreateTeam() {
    if (!teamName) return
    
    const result = await createTeam(teamName)
    
    if (!result.error) {
      setShowTeamModal(false)
      setTeamName('')
      // Recarregar dados
      await loadData()
      alert('Equipo creado con éxito')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleCreateHoliday() {
    if (!holidayName || !holidayStart || !holidayEnd) return
    
    const result = await createHoliday(holidayName, holidayStart, holidayEnd)
    
    if (!result.error) {
      setShowHolidayModal(false)
      setHolidayName('')
      setHolidayStart('')
      setHolidayEnd('')
      loadData()
      alert('Festivo creado con éxito')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // Função desabilitada temporariamente - necessita refatoração
  // async function handleToggleMembership(personId: string, teamId: string, currentStatus: string) {
  //   const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  //   const result = await updateMembershipStatus(membershipId, newStatus)
  //   
  //   if (!result.error) {
  //     loadData()
  //   } else {
  //     alert(`Error: ${result.error}`)
  //   }
  // }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Volver al calendario
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('people')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'people'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users size={20} />
              Personas
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'teams'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 size={20} />
              Equipos
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === 'holidays'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar size={20} />
              Festivos
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="mt-6 bg-white shadow rounded-lg">
          {/* People Tab */}
          {activeTab === 'people' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Gestión de Personas</h2>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Invitar Persona
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipos</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {people.map((person) => (
                      <tr key={person.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {person.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {person.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            person.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {person.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {person.teams?.length || 0} equipos
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Gestión de Equipos</h2>
                <button
                  onClick={() => setShowTeamModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Crear Equipo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <div key={team.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.member_count || 0} miembros</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Holidays Tab */}
          {activeTab === 'holidays' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Festivos Oficiales</h2>
                <button
                  onClick={() => setShowHolidayModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Crear Festivo
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Inicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Fin</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {holidays.map((holiday) => (
                      <tr key={holiday.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          🎉 {holiday.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(holiday.start_date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(holiday.end_date).toLocaleDateString('es-ES')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Invitar Persona</h3>
              <button onClick={() => setShowInviteModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="juan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="member">Miembro</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInvite}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Invitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crear Equipo</h3>
              <button onClick={() => setShowTeamModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Equipo</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Equipo Marketing"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateTeam}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Holiday Modal */}
      {showHolidayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crear Festivo</h3>
              <button onClick={() => setShowHolidayModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Navidad"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={holidayStart}
                    onChange={(e) => setHolidayStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={holidayEnd}
                    onChange={(e) => setHolidayEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowHolidayModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateHoliday}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
