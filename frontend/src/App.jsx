import { useState } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import { Zap, Palette, RefreshCw, LayoutTemplate } from 'lucide-react';

function App() {
  const [esLogin, setEsLogin] = useState(true);
  
  const [usuarioActivo, setUsuarioActivo] = useState(() => {
    const usuarioGuardado = localStorage.getItem('user');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });
  
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setMensaje('');
    
    try {
      if (esLogin) {
        const respuesta = await axios.post('http://localhost:3000/api/login', { email: correo, password: contrasena });
        
        // Guardamos el token de seguridad
        localStorage.setItem('token', respuesta.data.token);
        
        // 🔥 CAMBIO 2: Guardamos todos los datos del usuario en el navegador
        localStorage.setItem('user', JSON.stringify(respuesta.data.user));
        
        setMensaje("✅ " + respuesta.data.message);
        setUsuarioActivo(respuesta.data.user);

      } else {
        const respuesta = await axios.post('http://localhost:3000/api/register', { name: nombre, email: correo, password: contrasena });
        setMensaje("🎉 " + respuesta.data.message);
        setNombre('');
        setCorreo('');
        setContrasena('');
        setTimeout(() => setEsLogin(true), 2000);
      }
    } catch (error) {
      setMensaje("❌ " + (error.response?.data?.error || "Error de conexión"));
    }
  };

  const manejarCierreSesion = () => {
    //Limpiamos absolutamente todo al cerrar sesión
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUsuarioActivo(null);
  };

  // Si el usuario ya inicio sesion, mostramos el Dashboard
  if (usuarioActivo) {
    return <Dashboard user={usuarioActivo} onLogout={manejarCierreSesion} />;
  }

  // aqui se muestra al interfaz de iniciar sesion y registrarse
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
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

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
          <p className="text-center text-slate-500 text-sm mb-6">
            {esLogin ? 'Inicia sesión para continuar' : 'Crea una cuenta para comenzar'}
          </p>

          {mensaje && (
            <div className={`mb-4 p-3 text-sm rounded-lg text-center font-medium ${
              mensaje.includes('❌') ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-600 border border-green-100'
            }`}>
              {mensaje}
            </div>
          )}

          <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
            <button type="button" onClick={() => { setEsLogin(true); setMensaje(''); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${esLogin ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
              Iniciar Sesión
            </button>
            <button type="button" onClick={() => { setEsLogin(false); setMensaje(''); }} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${!esLogin ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-800'}`}>
              Registrarse
            </button>
          </div>

          <form className="space-y-4" onSubmit={manejarEnvio}>
            {!esLogin && (
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">Nombre</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 text-slate-800" required />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Email</label>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu@email.com" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 text-slate-800" required />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">Contraseña</label>
              <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-indigo-500 text-slate-800" required />
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white font-semibold rounded-lg px-4 py-3 mt-4 hover:bg-slate-800 transition-colors cursor-pointer">
              {esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;