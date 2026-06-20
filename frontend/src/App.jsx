import { useState } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard'; 
import { Zap, Palette, RefreshCw, LayoutTemplate } from 'lucide-react';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Estado para controlar qué pantalla mostrar
  const [activeUser, setActiveUser] = useState(null);
  
  // Estados del formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:3000/api/login', { email, password });
        
        localStorage.setItem('token', response.data.token);
        setMessage("✅ " + response.data.message);
        
        // 🎯 Guardamos el usuario en el estado para cambiar de pantalla de inmediato
        setActiveUser(response.data.user);

      } else {
        const response = await axios.post('http://localhost:3000/api/register', { name, email, password });
        setMessage("🎉 " + response.data.message);
        setName('');
        setEmail('');
        setPassword('');
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (error) {
      setMessage("❌ " + (error.response?.data?.error || "Error de conexión"));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setActiveUser(null); // Regresa a la pantalla de login
  };

  if (activeUser) {
    return <Dashboard user={activeUser} onLogout={handleLogout} />;
  }

  // Si no está logueado, muestra el login tradicional que ya teníamos
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-extrabold text-indigo-600 mb-3 tracking-tight">TaAlsk</h1>
            <p className="text-xl text-slate-500 font-medium">Tu gestor de tareas inteligente con IA</p>
          </div>
          <div className="space-y-5">
            <div className="flex items-center gap-4 text-slate-700 font-medium">
              <div className="bg-slate-200 p-2 rounded-lg"><LayoutTemplate className="w-5 h-5 text-slate-700" /></div>
              <span>Tablero Kanban con drag & drop</span>
            </div>
            <div className="flex items-center gap-4 text-slate-700 font-medium">
              <div className="bg-slate-200 p-2 rounded-lg"><Zap className="w-5 h-5 text-slate-700" /></div>
              <span>Sistema de rachas motivacional</span>
            </div>
            <div className="flex items-center gap-4 text-slate-700 font-medium">
              <div className="bg-slate-200 p-2 rounded-lg"><Palette className="w-5 h-5 text-slate-700" /></div>
              <span>Personalización de temas</span>
            </div>
            <div className="flex items-center gap-4 text-slate-700 font-medium">
              <div className="bg-slate-200 p-2 rounded-lg"><RefreshCw className="w-5 h-5 text-slate-700" /></div>
              <span>Sincronización automática</span>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 w-max mt-8">
            <p className="text-slate-500 italic text-sm mb-4">"TaAlsk ha transformado mi productividad. ¡El sistema de rachas es increíble!"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-400"></div>
              <div>
                <p className="text-sm font-bold text-slate-800">María García</p>
                <p className="text-xs text-slate-500">Product Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: Formulario --- */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <p className="text-center text-slate-500 text-sm mb-6">
            {isLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para comenzar'}
          </p>

          {message && (
            <div className={`mb-4 p-3 text-sm rounded-lg text-center font-medium ${
              message.includes('❌') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
            <button type="button" onClick={() => { setIsLogin(true); setMessage(''); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${isLogin ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
              Iniciar Sesión
            </button>
            <button type="button" onClick={() => { setIsLogin(false); setMessage(''); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!isLogin ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
              Registrarse
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Nombre</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 text-slate-800" required />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 text-slate-800" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 text-slate-800" required />
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-semibold rounded-lg px-4 py-3 mt-4 hover:bg-slate-800 transition-colors cursor-pointer">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;