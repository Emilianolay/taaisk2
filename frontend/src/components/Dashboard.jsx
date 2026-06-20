import { Flame, Trophy, CheckCircle, Palette, Trash2, Plus, User, Moon } from 'lucide-react';

function Dashboard({ user, onLogout }) {
  // Simularemos unas tareas iniciales de prueba para ver cómo se renderizan
  const tasks = [
    { id: '1', title: 'Diseñar la base de datos en PostgreSQL', status: 'TODO' },
    { id: '2', title: 'Conectar el formulario con Axios', status: 'COMPLETED' },
  ];

  // Filtramos las tareas por columna
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">TaAlsk</h1>
            <p className="text-slate-500 font-medium mt-1">Organiza tu trabajo y mantén tu racha activa</p>
          </div>
          
          {/* Botones de Acción Superiores */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 shadow-sm transition-colors text-slate-500">
              <Palette className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 shadow-sm transition-colors text-slate-500">
              <Moon className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 shadow-sm transition-colors text-slate-500">
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-colors text-sm">
              <Plus className="w-4 h-4" /> Nueva Tarea
            </button>
            <button 
              onClick={onLogout}
              className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors text-slate-500"
              title="Cerrar sesión"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* --- PANEL DE ESTADÍSTICAS Y RACHAS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Racha Actual */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
              <Flame className="w-8 h-8 fill-current" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Racha Actual</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">
                {user?.currentStreak || 0} <span className="text-lg font-bold text-slate-500">días</span>
              </p>
            </div>
          </div>

          {/* Mejor Racha */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-500">
              <Trophy className="w-8 h-8 fill-current" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Mejor Racha</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">
                {user?.bestStreak || 0} <span className="text-lg font-bold text-slate-500">días</span>
              </p>
            </div>
          </div>

          {/* Tareas Completadas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-500">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tareas Completadas</p>
              <p className="text-3xl font-black text-slate-900 mt-0.5">
                {user?.tasksCompletedTotal || 0} <span className="text-lg font-bold text-slate-500">total</span>
              </p>
            </div>
          </div>
        </section>

        {/* --- TABLERO KANBAN --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Columna: Por Hacer */}
          <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/40">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-bold text-slate-700">Por Hacer</h3>
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-xs font-bold">{todoTasks.length}</span>
            </div>
            <div className="space-y-3 min-h-[350px]">
              {todoTasks.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-12">Arrastra tareas aquí</p>
              ) : (
                todoTasks.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 font-medium text-sm text-slate-700 hover:shadow transition-shadow cursor-grab">
                    {t.title}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna: En Progreso */}
          <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/40">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-bold text-slate-700">En Progreso</h3>
              <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md text-xs font-bold">{inProgressTasks.length}</span>
            </div>
            <div className="space-y-3 min-h-[350px]">
              {inProgressTasks.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-12">Arrastra tareas aquí</p>
              ) : (
                inProgressTasks.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 font-medium text-sm text-slate-700 hover:shadow transition-shadow cursor-grab">
                    {t.title}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna: Completado */}
          <div className="bg-slate-100/70 rounded-2xl p-4 border border-slate-200/40">
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-bold text-slate-700">Completado</h3>
              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-xs font-bold">{completedTasks.length}</span>
            </div>
            <div className="space-y-3 min-h-[350px]">
              {completedTasks.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-12">Arrastra tareas aquí</p>
              ) : (
                completedTasks.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 font-medium text-sm text-slate-400 line-through hover:shadow transition-shadow cursor-grab">
                    {t.title}
                  </div>
                ))
              )}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}

export default Dashboard;