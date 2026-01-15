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
  getAllTeams,
  updateUserRole,
  addTeamMember,
  removeTeamMember,
  updateTeam,
  deleteTeam,
  toggleUserStatus
} from '@/app/actions/admin'
import { Users, Building2, Calendar, X, Plus, Trash2, Edit2, MoreVertical, UserCog, UserPlus, Shield } from 'lucide-react'

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
  
  // People management modals
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const [newRole, setNewRole] = useState<'admin' | 'member'>('member')
  const [showAddToTeamModal, setShowAddToTeamModal] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState('')

  // Teams state
  const [teams, setTeams] = useState<any[]>([])
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [teamName, setTeamName] = useState('')
  
  // Teams management modals
  const [showEditTeamModal, setShowEditTeamModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<any>(null)
  const [editTeamName, setEditTeamName] = useState('')
  const [showTeamMembersModal, setShowTeamMembersModal] = useState(false)
  const [teamMembers, setTeamMembers] = useState<any[]>([])

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
    console.log('useEffect triggered - isAdminUser:', isAdminUser, 'activeTab:', activeTab)
    if (isAdminUser) {
      console.log('Calling loadData...')
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
    console.log('=== loadData CALLED - activeTab:', activeTab)
    const supabase = createClient()
    
    if (activeTab === 'people') {
      console.log('Loading people from client...')
      // Buscar people diretamente via cliente
      const { data: peopleData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name')
      
      console.log('People query result:', { peopleData, error })
      
      if (!error && peopleData) {
        // Para cada pessoa, buscar seus teams
        const peopleWithTeams = await Promise.all(
          peopleData.map(async (person) => {
            const { data: memberships } = await supabase
              .from('team_memberships')
              .select(`
                id,
                status,
                team:team_id (
                  id,
                  name
                )
              `)
              .eq('profile_id', person.id)
            
            return {
              ...person,
              team_memberships: memberships || []
            }
          })
        )
        console.log('People loaded from client:', peopleWithTeams)
        setPeople(peopleWithTeams)
      } else {
        console.error('Error loading people:', error)
        setPeople([])
      }
    } else if (activeTab === 'teams') {
      console.log('Loading teams from client...')
      // Buscar teams diretamente via cliente para evitar cache
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select('*')
        .order('name')
      
      console.log('Teams query result:', { teamsData, error })
      
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

  // === PEOPLE MANAGEMENT ===
  
  async function handleChangeRole() {
    if (!selectedPerson) return
    
    const result = await updateUserRole(selectedPerson.id, newRole)
    if (!result.error) {
      setShowRoleModal(false)
      setSelectedPerson(null)
      await loadData()
      alert('Rol actualizado con éxito')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleAddToTeam() {
    if (!selectedPerson || !selectedTeamId) return
    
    const result = await addTeamMember(selectedTeamId, selectedPerson.id)
    if (!result.error) {
      setShowAddToTeamModal(false)
      setSelectedPerson(null)
      setSelectedTeamId('')
      await loadData()
      alert('Usuario agregado al equipo')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleRemoveFromTeam(membershipId: string) {
    if (!confirm('¿Eliminar este miembro del equipo?')) return
    
    const result = await removeTeamMember(membershipId)
    if (!result.error) {
      await loadData()
      alert('Miembro eliminado del equipo')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleToggleUserStatus(userId: string, currentStatus: boolean) {
    const action = currentStatus ? 'desactivar' : 'activar'
    if (!confirm(`¿Confirmar ${action} este usuario?`)) return
    
    const result = await toggleUserStatus(userId, currentStatus)
    if (!result.error) {
      await loadData()
      alert(`Usuario ${action}do`)
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  // === TEAMS MANAGEMENT ===

  async function handleUpdateTeam() {
    if (!selectedTeam || !editTeamName) return
    
    const result = await updateTeam(selectedTeam.id, editTeamName)
    if (!result.error) {
      setShowEditTeamModal(false)
      setSelectedTeam(null)
      setEditTeamName('')
      await loadData()
      alert('Equipo actualizado')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleDeleteTeam(teamId: string) {
    if (!confirm('¿Eliminar este equipo? Se eliminarán todas las membresías.')) return
    
    const result = await deleteTeam(teamId)
    if (!result.error) {
      await loadData()
      alert('Equipo eliminado')
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  async function handleViewTeamMembers(team: any) {
    setSelectedTeam(team)
    
    // Cargar membros del team
    const supabase = createClient()
    const { data } = await supabase
      .from('team_memberships')
      .select(`
        id,
        status,
        profile:profile_id (
          id,
          full_name,
          email
        )
      `)
      .eq('team_id', team.id)
      .eq('status', 'active')
    
    setTeamMembers(data || [])
    setShowTeamMembersModal(true)
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {people.map((person) => (
                      <tr key={person.id} className="hover:bg-gray-50">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-wrap gap-1">
                            {person.team_memberships?.map((membership: any) => (
                              <span key={membership.id} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center gap-1">
                                {membership.team?.name}
                                <button
                                  onClick={() => handleRemoveFromTeam(membership.id)}
                                  className="hover:text-red-600"
                                  title="Eliminar del equipo"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                            {(!person.team_memberships || person.team_memberships.length === 0) && (
                              <span className="text-gray-400 text-xs">Sin equipos</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            person.active !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {person.active !== false ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedPerson(person)
                                setNewRole(person.role === 'admin' ? 'member' : 'admin')
                                setShowRoleModal(true)
                              }}
                              className="text-purple-600 hover:text-purple-900"
                              title="Cambiar rol"
                            >
                              <Shield size={18} />
                            </button>
                            <button
                              onClick={async () => {
                                setSelectedPerson(person)
                                // Carregar teams se ainda não foram carregados
                                if (teams.length === 0) {
                                  const supabase = createClient()
                                  const { data: teamsData } = await supabase
                                    .from('teams')
                                    .select('*')
                                    .order('name')
                                  if (teamsData) {
                                    setTeams(teamsData)
                                  }
                                }
                                setShowAddToTeamModal(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Agregar a equipo"
                            >
                              <UserPlus size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleUserStatus(person.id, person.active !== false)}
                              className={person.active !== false ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                              title={person.active !== false ? "Desactivar usuario" : "Activar usuario"}
                            >
                              <UserCog size={18} />
                            </button>
                          </div>
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
                  <div key={team.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow relative">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{team.name}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTeam(team)
                            setEditTeamName(team.name)
                            setShowEditTeamModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewTeamMembers(team)}
                      className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Users size={16} />
                      {team.member_count || 0} miembros
                    </button>
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

      {/* Change Role Modal */}
      {showRoleModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Cambiar Rol</h3>
                <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <p className="mb-4 text-sm text-gray-600">
                Usuario: <strong>{selectedPerson.full_name}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo Rol</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'member')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangeRole}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Cambiar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add to Team Modal */}
      {showAddToTeamModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Agregar a Equipo</h3>
                <button onClick={() => setShowAddToTeamModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <p className="mb-4 text-sm text-gray-600">
                Usuario: <strong>{selectedPerson.full_name}</strong>
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Equipo</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={teams.length === 0}
                >
                  <option value="">
                    {teams.length === 0 ? 'Cargando equipos...' : 'Seleccionar equipo'}
                  </option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
                {teams.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">No hay equipos disponibles</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddToTeamModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToTeam}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditTeamModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Editar Equipo</h3>
                <button onClick={() => setShowEditTeamModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Nombre del equipo"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEditTeamModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateTeam}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Members Modal */}
      {showTeamMembersModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Miembros de {selectedTeam.name}</h3>
                <button onClick={() => setShowTeamMembersModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {teamMembers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay miembros en este equipo</p>
              ) : (
                <div className="space-y-2">
                  {teamMembers.map((membership: any) => (
                    <div key={membership.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{membership.profile?.full_name}</p>
                        <p className="text-sm text-gray-600">{membership.profile?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleRemoveFromTeam(membership.id)
                          setShowTeamMembersModal(false)
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <button
                  onClick={() => setShowTeamMembersModal(false)}
                  className="w-full px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
