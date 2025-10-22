import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BarChart3, Plus, Trash2, LogOut, Download, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabase = createClient(
  'https://wqsrhakdozxubgwjfzov.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indxc3JoYWtkb3p4dWJnd2pmem92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjc3ODUsImV4cCI6MjA3Njc0Mzc4NX0.Wgl3mhDvamJPA69x0fDHC1lp5vVv8tI0AiLvQV1cvQU'
);

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
const App = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [tab, setTab] = useState('myHours');
  const [loading, setLoading] = useState(true);

  // Cargar datos desde Supabase
  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, projectsRes, entriesRes] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('entries').select('*')
      ]);
      
      if (usersRes.data) setUsers(usersRes.data);
      if (projectsRes.data) setProjects(projectsRes.data);
      if (entriesRes.data) setEntries(entriesRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Clock className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Pantalla de login
  if (!user) {
    return <Login setUser={setUser} users={users} loadData={loadData} />;
  }

  // Pantalla principal
  return (
    <Main 
      user={user} 
      setUser={setUser} 
      users={users} 
      projects={projects} 
      entries={entries} 
      tab={tab} 
      setTab={setTab} 
      loadData={loadData} 
    />
  );
};

// ========================================
// COMPONENTE LOGIN
// ========================================
const Login = ({ setUser, users, loadData }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async () => {
    setError('');
    
    if (isRegister) {
      // Validaciones para registro
      if (!email.endsWith('@lxgcapital.com')) {
        return setError('Solo emails @lxgcapital.com');
      }
      if (password.length < 6) {
        return setError('Contraseña mínimo 6 caracteres');
      }
      if (!name.trim()) {
        return setError('Ingresa tu nombre');
      }
      if (users.find(u => u.email === email)) {
        return setError('Email ya registrado');
      }
      
      // Crear nuevo usuario
      const newUser = { 
        email, 
        name: name.trim(), 
        password, 
        is_admin: email === 'jose.correa@lxgcapital.com' 
      };
      
      const { error: insertError } = await supabase.from('users').insert([newUser]);
      if (insertError) {
        return setError('Error al crear usuario');
      }
      
      await loadData();
      setUser(newUser);
    } else {
      // Login
      const foundUser = users.find(u => u.email === email && u.password === password);
      if (!foundUser) {
        return setError('Email o contraseña incorrectos');
      }
      setUser(foundUser);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-xl mr-3">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Time Tracker LXG
          </h1>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button 
            onClick={() => setIsRegister(false)} 
            className={`flex-1 py-2 rounded-lg font-medium transition ${!isRegister ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsRegister(true)} 
            className={`flex-1 py-2 rounded-lg font-medium transition ${isRegister ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
          >
            Registro
          </button>
        </div>

        <div className="space-y-4">
          {isRegister && (
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Nombre completo" 
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-600 outline-none" 
            />
          )}
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="tu@lxgcapital.com" 
            className="w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-600 outline-none" 
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••••" 
            className="w-full px-4 py-3 border-2 rounded-xl focus:border-indigo-600 outline-none" 
            onKeyPress={e => e.key === 'Enter' && handleAuth()} 
          />
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <button 
            onClick={handleAuth} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
          >
            {isRegister ? 'Crear cuenta' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================
// COMPONENTE PRINCIPAL
// ========================================
const Main = ({ user, setUser, users, projects, entries, tab, setTab, loadData }) => {
  // Obtener semana actual
  const getCurrentWeek = () => {
    const date = new Date();
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date - startOfYear;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNum = Math.ceil(diff / oneWeek);
    return `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
  };

  // Estados
  const [week, setWeek] = useState(getCurrentWeek());
  const [selectedProject, setSelectedProject] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startWeek, setStartWeek] = useState('');
  const [endWeek, setEndWeek] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Calcular horas aprobadas de una semana
  const getWeekHours = (userEmail, weekNumber) => {
    return entries
      .filter(e => e.user_email === userEmail && e.week === weekNumber && e.status === 'approved')
      .reduce((sum, e) => sum + parseFloat(e.hours), 0);
  };

  const myWeekHours = getWeekHours(user.email, week);

  // Agregar entrada
  const addEntry = async () => {
    if (!selectedProject || !hours || parseFloat(hours) <= 0) return;
    
    const status = myWeekHours + parseFloat(hours) > 70 ? 'pending' : 'approved';
    const project = projects.find(p => p.id === parseInt(selectedProject));
    
    const newEntry = {
      user_email: user.email,
      user_name: user.name,
      project_id: parseInt(selectedProject),
      project_name: project?.name,
      week,
      hours: parseFloat(hours),
      description: description.trim(),
      status
    };
    
    const { error } = await supabase.from('entries').insert([newEntry]);
    if (error) {
      alert('Error al agregar entrada');
      return;
    }
    
    await loadData();
    setSelectedProject('');
    setHours('');
    setDescription('');
    
    if (status === 'pending') {
      alert('⚠️ Excede 70 horas, requiere aprobación del admin');
    }
  };

  // Eliminar entrada
  const deleteEntry = async (id) => {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    
    if (!user.is_admin && entry.user_email !== user.email) {
      alert('No tienes permisos para eliminar este registro');
      return;
    }
    
    setConfirmDelete(id);
  };

  const confirmDeleteEntry = async () => {
    const { error } = await supabase.from('entries').delete().eq('id', confirmDelete);
    if (error) {
      alert('Error al eliminar');
      return;
    }
    
    setConfirmDelete(null);
    await loadData();
  };

  // Aprobar entrada
  const approveEntry = async (id) => {
    const { error } = await supabase.from('entries').update({ 
      status: 'approved', 
      approved_by: user.email, 
      approved_at: new Date().toISOString() 
    }).eq('id', id);
    
    if (error) {
      alert('Error al aprobar');
      return;
    }
    
    await loadData();
  };

  // Rechazar entrada
  const rejectEntry = async (id) => {
    const { error } = await supabase.from('entries').update({ 
      status: 'rejected', 
      rejected_by: user.email, 
      rejected_at: new Date().toISOString() 
    }).eq('id', id);
    
    if (error) {
      alert('Error al rechazar');
      return;
    }
    
    await loadData();
  };

  // Agregar proyecto
  const addProject = async () => {
    if (!newProjectName.trim()) return;
    
    const { error } = await supabase.from('projects').insert([{ 
      name: newProjectName.trim(), 
      created_by: user.email 
    }]);
    
    if (error) {
      alert('Error al crear proyecto');
      return;
    }
    
    await loadData();
    setNewProjectName('');
  };

  // Eliminar proyecto
  const deleteProject = async (id) => {
    if (!user.is_admin) {
      alert('Solo admins pueden eliminar proyectos');
      return;
    }
    setConfirmDelete(`proj-${id}`);
  };

  const confirmDeleteProject = async () => {
    const id = confirmDelete.replace('proj-', '');
    const { error } = await supabase.from('projects').delete().eq('id', parseInt(id));
    
    if (error) {
      alert('Error al eliminar proyecto');
      return;
    }
    
    setConfirmDelete(null);
    await loadData();
  };

  // Exportar a CSV
  const exportToCSV = () => {
    const data = user.is_admin ? filteredEntries : myEntries;
    const csvContent = [
      ['Semana', 'Usuario', 'Email', 'Proyecto', 'Horas', 'Descripción', 'Estado'],
      ...data.map(e => [
        e.week, 
        e.user_name, 
        e.user_email, 
        e.project_name || 'N/A', 
        e.hours, 
        e.description || '', 
        e.status === 'approved' ? 'Aprobado' : e.status === 'pending' ? 'Pendiente' : 'Rechazado'
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `timesheet-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filtros y cálculos
  const myEntries = entries
    .filter(e => e.user_email === user.email)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const filteredEntries = entries
    .filter(e => 
      (filterProject === 'all' || e.project_id === parseInt(filterProject)) && 
      (filterUser === 'all' || e.user_email === filterUser) && 
      (filterStatus === 'all' || e.status === filterStatus)
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const pendingEntries = entries
    .filter(e => e.status === 'pending')
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Estadísticas por proyecto
  const projectStats = {};
  entries.forEach(e => {
    if (e.status !== 'approved') return;
    if (startWeek && e.week < startWeek) return;
    if (endWeek && e.week > endWeek) return;
    
    if (!projectStats[e.project_id]) {
      projectStats[e.project_id] = { 
        totalHours: 0, 
        userHours: {}, 
        userNames: {} 
      };
    }
    
    projectStats[e.project_id].totalHours += parseFloat(e.hours);
    projectStats[e.project_id].userHours[e.user_email] = 
      (projectStats[e.project_id].userHours[e.user_email] || 0) + parseFloat(e.hours);
    projectStats[e.project_id].userNames[e.user_email] = e.user_name;
  });

  // Totales generales
  const totalStats = {
    hours: entries.filter(e => e.status === 'approved').reduce((sum, e) => sum + parseFloat(e.hours), 0),
    users: new Set(entries.filter(e => e.status === 'approved').map(e => e.user_email)).size,
    pending: pendingEntries.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modal de confirmación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-4">¿Estás seguro de eliminar este registro?</p>
            <div className="flex gap-2">
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete.startsWith('proj-') ? confirmDeleteProject : confirmDeleteEntry} 
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Time Tracker LXG</h1>
              <p className="text-xs text-gray-500">LXG Capital</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={loadData} 
              className="p-2 hover:bg-gray-100 rounded-lg transition" 
              title="Recargar datos"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-sm">{user.name}</div>
              <div className="text-xs text-gray-500">{user.is_admin ? 'Admin' : 'Usuario'}</div>
            </div>
            <button 
              onClick={() => setUser(null)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Stats (solo admin) */}
      {user.is_admin && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-xs opacity-90">Total Horas</div>
                <div className="text-2xl font-bold">{totalStats.hours.toFixed(1)}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-xs opacity-90">Usuarios Activos</div>
                <div className="text-2xl font-bold">{totalStats.users}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-xs opacity-90">Proyectos</div>
                <div className="text-2xl font-bold">{projects.length}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-xs opacity-90">Pendientes</div>
                <div className="text-2xl font-bold">{totalStats.pending}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setTab('myHours')} 
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${tab === 'myHours' ? 'bg-indigo-600 text-white shadow' : 'bg-white hover:bg-gray-50'}`}
          >
            <Calendar className="w-4 h-4 inline mr-1" />
            Mis Horas
          </button>
          {user.is_admin && (
            <>
              <button 
                onClick={() => setTab('approvals')} 
                className={`px-4 py-2 rounded-lg whitespace-nowrap relative transition ${tab === 'approvals' ? 'bg-indigo-600 text-white shadow' : 'bg-white hover:bg-gray-50'}`}
              >
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Aprobar
                {totalStats.pending > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalStats.pending}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setTab('reports')} 
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${tab === 'reports' ? 'bg-indigo-600 text-white shadow' : 'bg-white hover:bg-gray-50'}`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Reportes
              </button>
              <button 
                onClick={() => setTab('projects')} 
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${tab === 'projects' ? 'bg-indigo-600 text-white shadow' : 'bg-white hover:bg-gray-50'}`}
              >
                <Users className="w-4 h-4 inline mr-1" />
                Proyectos
              </button>
            </>
          )}
        </div>

        {/* Tab: Mis Horas */}
        {tab === 'myHours' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Registrar Horas</h2>
              
              {projects.length === 0 && (
                <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg text-amber-800 text-sm">
                  ⚠️ No hay proyectos disponibles. {user.is_admin ? 'Ve a la pestaña Proyectos para crear uno.' : 'Contacta al administrador.'}
                </div>
              )}
              
              <div className="mb-4 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                <span className="text-sm font-medium">Horas aprobadas esta semana:</span>
                <span className={`font-bold text-lg ${myWeekHours > 70 ? 'text-red-600' : myWeekHours > 60 ? 'text-amber-600' : 'text-green-600'}`}>
                  {myWeekHours.toFixed(1)} / 70h
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Semana</label>
                  <input 
                    type="week" 
                    value={week} 
                    onChange={e => setWeek(e.target.value)} 
                    className="w-full px-4 py-2 border-2 rounded-lg focus:border-indigo-600 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Proyecto</label>
                  <select 
                    value={selectedProject} 
                    onChange={e => setSelectedProject(e.target.value)} 
                    className="w-full px-4 py-2 border-2 rounded-lg focus:border-indigo-600 outline-none"
                  >
                    <option value="">Seleccionar...</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Horas</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={hours} 
                    onChange={e => setHours(e.target.value)} 
                    placeholder="8.0" 
                    className="w-full px-4 py-2 border-2 rounded-lg focus:border-indigo-600 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Descripción (opcional)</label>
                  <input 
                    type="text" 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    placeholder="Descripción de la tarea..." 
                    className="w-full px-4 py-2 border-2 rounded-lg focus:border-indigo-600 outline-none" 
                  />
                </div>
              </div>
              
              <button 
                onClick={addEntry} 
                disabled={!selectedProject || !hours || parseFloat(hours) <= 0} 
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Agregar Registro
              </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Mis Registros</h2>
                <button 
                  onClick={exportToCSV} 
                  className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Exportar CSV
                </button>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {myEntries.map(entry => (
                  <div key={entry.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex-1">
                      <div className="font-semibold">{entry.project_name || 'Proyecto eliminado'}</div>
                      <div className="text-sm text-gray-600">
                        {entry.week} • {entry.hours}h • 
                        {entry.status === 'approved' && ' ✓ Aprobado'}
                        {entry.status === 'pending' && ' ⏳ Pendiente'}
                        {entry.status === 'rejected' && ' ✗ Rechazado'}
                      </div>
                      {entry.description && (
                        <div className="text-sm text-gray-500 mt-1">{entry.description}</div>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteEntry(entry.id)} 
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {myEntries.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No hay registros todavía
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Aprobaciones (solo admin) */}
        {tab === 'approvals' && user.is_admin && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Aprobaciones Pendientes</h2>
            
            <div className="space-y-3">
              {pendingEntries.map(entry => (
                <div key={entry.id} className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{entry.user_name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {entry.project_name} • {entry.week} • {entry.hours} horas
                      </div>
                      {entry.description && (
                        <div className="text-sm text-gray-500 mt-2 italic">
                          "{entry.description}"
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => approveEntry(entry.id)} 
                        className="p-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
                        title="Aprobar"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => rejectEntry(entry.id)} 
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                        title="Rechazar"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {pendingEntries.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-semibold">No hay aprobaciones pendientes</p>
                  <p className="text-sm mt-1">Todos los registros están procesados</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Reportes (solo admin) */}
        {tab === 'reports' && user.is_admin && (
          <div className="space-y-6">
            {/* Estadísticas por proyecto */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold mb-4">Estadísticas por Proyecto</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold mb-1">Desde semana</label>
                  <input 
                    type="week" 
                    value={startWeek} 
                    onChange={e => setStartWeek(e.target.value)} 
                    className="w-full px-4 py-2 border-2 rounded-lg focus:border-indigo-600 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Hasta semana</label>
                  <input 
                    type="week" 
                    value={endWeek} 
                    onChange={e => setEndWeek(e.target.value)} 
                    className="w-full px-4 py-2 border-2 rounded-lg focus:border-indigo-600 outline-none" 
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(projectStats).map(([projectId, stats]) => {
                  const project = projects.find(p => p.id === parseInt(projectId));
                  return (
                    <div key={projectId} className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-100">
                      <h3 className="font-bold mb-3 text-lg">{project?.name || 'Proyecto eliminado'}</h3>
                      
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between border-b pb-2 mb-2">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-indigo-600">{stats.totalHours.toFixed(1)}h</span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-700 mb-1">Por usuario:</div>
                          {Object.entries(stats.userHours).map(([email, hours]) => (
                            <div key={email} className="flex justify-between pl-2">
                              <span className="text-gray-600">{stats.userNames[email]}:</span>
                              <span className="font-semibold text-indigo-600">{hours.toFixed(1)}h</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {Object.keys(projectStats).length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-400">
                    <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-semibold">No hay datos para mostrar</p>
                    <p className="text-sm mt-1">Ajusta los filtros de fecha</p>
                  </div>
                )}
              </div>
            </div>

            {/* Todos los registros */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h2 className="text-xl font-bold">Todos los Registros</h2>
                
                <div className="flex gap-2 flex-wrap">
                  <select 
                    value={filterProject} 
                    onChange={e => setFilterProject(e.target.value)} 
                    className="px-3 py-2 border rounded-lg text-sm focus:border-indigo-600 outline-none"
                  >
                    <option value="all">Todos los proyectos</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={filterUser} 
                    onChange={e => setFilterUser(e.target.value)} 
                    className="px-3 py-2 border rounded-lg text-sm focus:border-indigo-600 outline-none"
                  >
                    <option value="all">Todos los usuarios</option>
                    {users.map(u => (
                      <option key={u.email} value={u.email}>{u.name}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)} 
                    className="px-3 py-2 border rounded-lg text-sm focus:border-indigo-600 outline-none"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="approved">Aprobados</option>
                    <option value="pending">Pendientes</option>
                    <option value="rejected">Rechazados</option>
                  </select>
                  
                  <button 
                    onClick={exportToCSV} 
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    CSV
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredEntries.map(entry => (
                  <div key={entry.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {entry.user_name} • {entry.project_name || 'Proyecto eliminado'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {entry.week} • {entry.hours}h • 
                          {entry.status === 'approved' && ' ✓ Aprobado'}
                          {entry.status === 'pending' && ' ⏳ Pendiente'}
                          {entry.status === 'rejected' && ' ✗ Rechazado'}
                        </div>
                        {entry.description && (
                          <div className="text-xs text-gray-500 mt-1">{entry.description}</div>
                        )}
                      </div>
                      <button 
                        onClick={() => deleteEntry(entry.id)} 
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredEntries.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No hay registros que coincidan con los filtros
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Proyectos (solo admin) */}
        {tab === 'projects' && user.is_admin && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Gestión de Proyectos</h2>
            
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={newProjectName} 
                onChange={e => setNewProjectName(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && addProject()} 
                placeholder="Nombre del nuevo proyecto..." 
                className="flex-1 px-4 py-2 border-2 rounded-lg focus:border-indigo-600 outline-none" 
              />
              <button 
                onClick={addProject} 
                disabled={!newProjectName.trim()} 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                Agregar
              </button>
            </div>
            
            {projects.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-semibold mb-1">No hay proyectos</p>
                <p className="text-sm">Crea tu primer proyecto arriba</p>
              </div>
            )}
            
            <div className="space-y-2">
              {projects.map(project => (
                <div key={project.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <div className="font-semibold">{project.name}</div>
                    <div className="text-xs text-gray-500">
                      Creado por: {users.find(u => u.email === project.created_by)?.name || project.created_by}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteProject(project.id)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
          