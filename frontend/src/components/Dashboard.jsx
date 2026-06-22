import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Flame, Trophy, CheckCircle, Palette, Trash2, Plus, User, Moon, X, Flag, Calendar, Image as ImageIcon, Settings, Key, LogOut } from 'lucide-react';
import Customizacion from './customizacion';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
  const [personalizadorAbierto, setPersonalizadorAbierto] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [editarPerfil, setEditarPerfil] = useState(false);
  const [cambiarContra, setCambiarContra] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState(user?.name || '');
  const [contraVieja, setContraVieja] = useState('');
  const [contraNueva, setContraNueva] = useState('');
  const [esOscuro, setEsOscuro] = useState(false);
  const [colorPrimario, setColorPrimario] = useState({ id: 'blue', hex: '#4f46e5', hexClaro: '#818cf8' });

  const [tareas, setTareas] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);

  const [idTareaEditando, setIdTareaEditando] = useState(null);
  const [tituloNuevaTarea, setTituloNuevaTarea] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('baja');
  const [estado, setEstado] = useState('porHacer');
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [inputEtiqueta, setInputEtiqueta] = useState('');
  const [listaEtiquetas, setListaEtiquetas] = useState([]);

  // Estados para la iamgen
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [urlArchivo, setUrlArchivo] = useState(''); // Guardamos la url de la imagen si ya existe

  useEffect(() => {
    if (esOscuro) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [esOscuro]);

  useEffect(() => {
    const obtenerMisTareas = async () => {
      try {
        const respuesta = await axios.get(`http://localhost:3000/api/tasks/${user.id}`);
        setTareas(respuesta.data);
      } catch (error) {
        console.error("Error al descargar mis tareas:", error);
      }
    };
    if (user && user.id) obtenerMisTareas();
  }, [user]);

  const tareasPorHacer = tareas.filter(t => t.estado === 'porHacer');
  const tareasEnProgreso = tareas.filter(t => t.estado === 'enProgreso');
  const tareasCompletadas = tareas.filter(t => t.estado === 'completado');

  const formatearFecha = (cadenaFecha) => {
    if (!cadenaFecha) return null;
    const fecha = new Date(cadenaFecha);
    fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const configPrioridad = {
    baja: { color: 'text-slate-400 dark:text-blue-300', bg: 'bg-slate-100 dark:bg-[#01004A]', label: 'Baja' },
    media: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', label: 'Media' },
    alta: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', label: 'Alta' }
  };

  const agregarEtiqueta = (e) => {
    e.preventDefault();
    if (inputEtiqueta.trim() && !listaEtiquetas.includes(inputEtiqueta.trim())) {
      setListaEtiquetas([...listaEtiquetas, inputEtiqueta.trim()]);
      setInputEtiqueta('');
    }
  };

  const eliminarEtiqueta = (etiquetaAEliminar) => {
    setListaEtiquetas(listaEtiquetas.filter(t => t !== etiquetaAEliminar));
  };

  const abrirModalEdicion = (tarea) => {
    setIdTareaEditando(tarea.id);
    setTituloNuevaTarea(tarea.titulo);
    setDescripcion(tarea.descripcion || '');
    setPrioridad(tarea.prioridad);
    setEstado(tarea.estado);
    setFechaVencimiento(tarea.fechaLimite ? new Date(tarea.fechaLimite).toISOString().split('T')[0] : '');
    setListaEtiquetas(tarea.etiquetas || []);
    setUrlArchivo(tarea.urlArchivo || ''); // Cargamos la foto existente
    setArchivoSeleccionado(null); // Limpiamos la seleccion de nuevos archivos
    setModalAbierto(true);
  };

  const reiniciarModal = () => {
    setIdTareaEditando(null);
    setTituloNuevaTarea('');
    setDescripcion('');
    setPrioridad('baja');
    setEstado('porHacer');
    setFechaVencimiento('');
    setListaEtiquetas([]);
    setUrlArchivo('');
    setArchivoSeleccionado(null);
    setModalAbierto(false);
  };

  // Para subir la foto primero
  const guardarTarea = async (e) => {
    e.preventDefault();
    if (!tituloNuevaTarea.trim()) return;

    let urlArchivoFinal = urlArchivo; // Mantiene la foto vieja si no subimos una nueva

    // Si el usuario selecciono una foto nueva, la subimos a nuestro backend primero
    if (archivoSeleccionado) {
      const formData = new FormData();
      formData.append('file', archivoSeleccionado);
      try {
        const respuestaSubida = await axios.post('http://localhost:3000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        urlArchivoFinal = respuestaSubida.data.fileUrl; // Guardamos el link de la nueva foto
      } catch (error) {
        console.error("Error al subir imagen:", error);
        alert("No se pudo subir la imagen");
        return; // Si falla la subida, cancelamos guardar la tarea
      }
    }

    try {
      if (idTareaEditando) {
        const respuesta = await axios.put(`http://localhost:3000/api/tasks/${idTareaEditando}`, {
          title: tituloNuevaTarea,
          description: descripcion,
          priority: prioridad,
          status: estado,
          dueDate: fechaVencimiento || null,
          tags: listaEtiquetas,
          fileUrl: urlArchivoFinal // Mandamos la url de la foto a la base de datos
        });
        setTareas(tareas.map(t => t.id === idTareaEditando ? respuesta.data : t));
      } else {
        const respuesta = await axios.post('http://localhost:3000/api/tasks', {
          title: tituloNuevaTarea,
          description: descripcion,
          priority: prioridad,
          status: estado,
          dueDate: fechaVencimiento || null,
          tags: listaEtiquetas,
          userId: user.id,
          fileUrl: urlArchivoFinal // Mandamos la url de la foto a la base de datos
        });
        setTareas([...tareas, respuesta.data]);
      }
      reiniciarModal();
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      alert("Hubo un error al guardar la tarea");
    }
  };

  const borrarTarea = async (idTarea, e) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta tarea permanentemente?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/tasks/${idTarea}`);
      setTareas(tareas.filter(t => t.id !== idTarea));
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  const alTerminarArrastre = async (resultado) => {
    const { destination: destino, source: origen, draggableId: idArrastrable } = resultado;
    if (!destino) return;
    if (destino.droppableId === origen.droppableId && destino.index === origen.index) return;

    const tareaMovida = tareas.find(t => t.id === idArrastrable);
    const nuevasTareas = tareas.filter(t => t.id !== idArrastrable);
    const tareaActualizada = { ...tareaMovida, estado: destino.droppableId };

    nuevasTareas.splice(destino.index, 0, tareaActualizada);
    setTareas(nuevasTareas);

    try {
      await axios.put(`http://localhost:3000/api/tasks/${idArrastrable}`, {
        status: destino.droppableId
      });
    } catch (error) {
      console.error("Error al guardar la posición:", error);
    }
  };

  //Funciones de guardar y actualizar para el perfil
  const guardarPerfil = async () => {
    if (!nuevoNombre.trim()) return alert("El nombre no puede estar vacío");
    try {
      await axios.put(`http://localhost:3000/api/users/${user.id}/profile`, {
        nuevoNombre: nuevoNombre
      });
      alert("Perfil actualizado, vuelve a entrar para ver los cambios.");
      setEditarPerfil(false); //Cerramos la ventana
    } catch (error) {
      alert("Error al actualizar el perfil");
    }
  };

  const actualizarContra = async () => {
    if (!contraVieja || !contraNueva) return alert("Por favor llena ambos campos");
    try {
      await axios.put(`http://localhost:3000/api/users/${user.id}/password`, {
        contraVieja: contraVieja,
        contraNueva: contraNueva
      });
      alert("Contraseña actualizada, se cerrará tu sesion por seguridad(:");
      setCambiarContra(false);
      onLogout(); //Cerramos la sesion automaticamente
    } catch (error) {
      alert(error.response?.data?.error || "Error al cambiar contraseña");
    }
  };

  return (
    <div className="fondo_app">
      <div className="contenedor_principal">

        {/* --- HEADER --- */}
        <header className="encabezado">
          <div>
            <h1 className="titulo_principal">TaAlsk</h1>
            <p className="subtitulo">Organiza tu trabajo y mantén tu racha activa</p>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto">
            <button onClick={() => setPersonalizadorAbierto(true)} className="btn_icono">
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={() => setEsOscuro(!esOscuro)} className="btn_icono">
              <Moon className="w-5 h-5" />
            </button>
            <button
              onClick={() => { reiniciarModal(); setModalAbierto(true); }}
              className="btn_primario"
            >
              <Plus className="w-4 h-4" /> Nueva Tarea
            </button>
            <div className='relative'>
              <button onClick={() => setPerfilAbierto(!perfilAbierto)}
                className={`btn_perfil ${perfilAbierto ? 'btn_perfil_activo' : 'btn_perfil_inactivo'}`}
                title='Mi perfil'>
                <User className='w-5 h-5' />
              </button>

              {/* cajita despegable para editar perfil*/}
              {perfilAbierto && (
                <div className="caja_menu animate-in fade-in slide-in-from-top-2 duration-200">

                  {/*Encabezado del nombre y correo del perfil */}
                  <div className="menu_header">
                    <p className="menu_nombre">{user?.name || 'Usuario'}</p>
                    <p className="menu_correo">{user?.email || 'correo@ejemplo.com'}</p>
                  </div>

                  {/*Opciones del Menu */}
                  <div className='p-2 space-y-1'>
                    <button onClick={() => {
                      setEditarPerfil(true); setPerfilAbierto(false);
                    }}
                      className="menu_opcion">
                      <Settings className='w-4 h-4' />Editar perfil
                    </button>
                    <button onClick={() => {
                      setCambiarContra(true); setPerfilAbierto(false);
                    }}
                      className="menu_opcion">
                      <Key className='w-4 h-4' />Cambiar contraseña
                    </button>
                    <div className='h-px bg-slate-100 dark:bg-[#030188] my-1 mx-2'></div>
                    <button onClick={onLogout} className="menu_opcion_salir">
                      <LogOut className='w-4 h-4' />Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Panel de la estadistica */}
        <section className="estadisticas_grid">
          <div className="estadistica_caja">
            <div className="estadistica_icono_naranja"><Flame className="w-8 h-8 fill-current" /></div>
            <div>
              <p className="estadistica_titulo">Racha Actual</p>
              <p className="estadistica_valor">{user?.currentStreak || 0} <span className="estadistica_subtexto">días</span></p>
            </div>
          </div>
          <div className="estadistica_caja">
            <div className="estadistica_icono_ambar"><Trophy className="w-8 h-8 fill-current" /></div>
            <div>
              <p className="estadistica_titulo">Mejor Racha</p>
              <p className="estadistica_valor">{user?.bestStreak || 0} <span className="estadistica_subtexto">días</span></p>
            </div>
          </div>
          <div className="estadistica_caja">
            <div className="estadistica_icono_esmeralda"><CheckCircle className="w-8 h-8" /></div>
            <div>
              <p className="estadistica_titulo">Tareas Completadas</p>
              <p className="estadistica_valor">
                {tareasCompletadas.length} <span className="estadistica_subtexto">total</span>
              </p>
            </div>
          </div>
        </section>

        {/* Tablero Kanban con drag and drop */}
        <DragDropContext onDragEnd={alTerminarArrastre}>
          <section className="kanban_grid">

            {[{ id: 'porHacer', title: 'Por Hacer', data: tareasPorHacer, dragColor: 'indigo' },
            { id: 'enProgreso', title: 'En Progreso', data: tareasEnProgreso, dragColor: 'amber' },
            { id: 'completado', title: 'Completado', data: tareasCompletadas, dragColor: 'emerald' }
            ].map(col => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`columna_kanban ${snapshot.isDraggingOver ? `border-${col.dragColor}-300 dark:border-${col.dragColor}-500 bg-${col.dragColor}-50/50 dark:bg-[#020166]/80` : 'border-slate-200/50 dark:border-[#030188]'}`}>
                    <div className="flex justify-between items-center mb-5 px-1">
                      <h3 className="columna_titulo">{col.title}</h3>
                      <span className="columna_contador">{col.data.length}</span>
                    </div>
                    <div className="space-y-4 min-h-[350px]">
                      {col.data.length === 0 && !snapshot.isDraggingOver && col.id === 'enProgreso' && <p className="tarea_vacia">Arrastra tareas aquí</p>}
                      {col.data.map((t, index) => (
                        <Draggable key={t.id} draggableId={t.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                              onClick={() => abrirModalEdicion(t)}
                              className={`tarea_tarjeta group ${snapshot.isDragging ? 'tarea_tarjeta_drag' : 'tarea_tarjeta_normal'} ${col.id === 'completado' ? 'opacity-75' : ''}`}
                            >

                              {/* Render de la Imagen en la Tarjeta */}
                              {t.urlArchivo && (
                                <div className="tarea_imagen_caja">
                                  <img src={t.urlArchivo} alt="Adjunto de tarea" className={`tarea_imagen ${col.id === 'completado' ? 'opacity-60 grayscale' : ''}`} />
                                </div>
                              )}

                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  {t.prioridad && (
                                    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${col.id === 'completado' ? 'opacity-50' : ''} ${configPrioridad[t.prioridad]?.bg || ''} ${configPrioridad[t.prioridad]?.color || ''}`}>
                                      <Flag className="w-3 h-3 fill-current" /> {configPrioridad[t.prioridad]?.label || t.prioridad}
                                    </span>
                                  )}
                                </div>
                                <button onClick={(e) => borrarTarea(t.id, e)} className="btn_borrar">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className={col.id === 'completado' ? 'tarea_titulo_hecho' : 'tarea_titulo_normal'}>{t.titulo}</div>
                              {t.descripcion && <div className={col.id === 'completado' ? 'tarea_desc_hecho' : 'tarea_desc_normal'}>{t.descripcion}</div>}

                              <div className={`tarea_pie ${col.id === 'completado' ? 'opacity-60' : ''}`}>
                                <div className="flex flex-wrap gap-1">
                                  {t.etiquetas && t.etiquetas.length > 0 && t.etiquetas.map((tag, i) => (
                                    <span key={i} className="tarea_etiqueta">#{tag}</span>
                                  ))}
                                </div>
                                {t.fechaLimite && (
                                  <div className="tarea_fecha">
                                    <Calendar className="w-3 h-3" /> {formatearFecha(t.fechaLimite)}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}

          </section>
        </DragDropContext>
      </div>

      {personalizadorAbierto && (
        <Customizacion esOscuro={esOscuro} alternarOscuro={() => setEsOscuro(!esOscuro)} colorPrimario={colorPrimario} setColorPrimario={setColorPrimario} alCerrar={() => setPersonalizadorAbierto(false)} />
      )}

      {/* Aqui creamos una nueva tarea*/}
      {modalAbierto && (
        <div className="modal_fondo">
          <div className="modal_caja modal_caja_larga animate-in fade-in zoom-in-95 duration-200">

            <div className="modal_encabezado">
              <h2 className="modal_titulo">
                {idTareaEditando ? "Editar Tarea" : "Crear nueva tarea"}
              </h2>
              <button onClick={reiniciarModal} className="btn_cerrar">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarTarea} className="space-y-4">

              {/* Aqui previsualizamos la imagen */}
              {(urlArchivo || archivoSeleccionado) && (
                <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#030188]">
                  <img
                    src={archivoSeleccionado ? URL.createObjectURL(archivoSeleccionado) : urlArchivo}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setUrlArchivo(''); setArchivoSeleccionado(null); }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-lg backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="form_label">Título</label>
                <input type="text" value={tituloNuevaTarea} onChange={(e) => setTituloNuevaTarea(e.target.value)} placeholder="Avance de Proyecto" className="form_input" required autoFocus />
              </div>

              <div>
                <label className="form_label">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Objetivos" className="form_textarea" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form_label">Prioridad</label>
                  <select value={prioridad} onChange={(e) => setPrioridad(e.target.value)} className="form_select">
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="form_label">Estado</label>
                  <select value={estado} onChange={(e) => setEstado(e.target.value)} className="form_select">
                    <option value="porHacer">Por Hacer</option>
                    <option value="enProgreso">En Progreso</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form_label">Fecha límite</label>
                  <input type="date" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} className="form_input" />
                </div>
                <div>
                  <label className="form_label">Adjuntar Imagen</label>
                  <label className="btn_upload">
                    <ImageIcon className="w-4 h-4" />
                    {archivoSeleccionado ? 'Cambiar imagen' : 'Seleccionar archivo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setArchivoSeleccionado(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div>
                <label className="form_label">Etiquetas</label>
                <div className="flex gap-2">
                  <input type="text" value={inputEtiqueta} onChange={(e) => setInputEtiqueta(e.target.value)} placeholder="Ej. Diseño, urgente..." className="form_input" />
                  <button onClick={agregarEtiqueta} type="button" className="bg-slate-100 dark:bg-[#020166] hover:bg-slate-200 dark:hover:bg-[#030188] border border-slate-200 dark:border-[#030188] text-slate-700 dark:text-blue-100 font-bold px-4 rounded-xl text-xs transition-colors cursor-pointer">Añadir</button>
                </div>
                {listaEtiquetas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {listaEtiquetas.map((tag, index) => (
                      <span key={index} className="etiqueta_badge">
                        #{tag}
                        <X onClick={() => eliminarEtiqueta(tag)} className="w-3 h-3 cursor-pointer hover:text-red-500" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-[#030188]">
                <button type="button" onClick={reiniciarModal} className="btn_secundario">Cancelar</button>
                <button type="submit" className="btn_primario">
                  {idTareaEditando ? "Guardar Cambios" : "Crear Tarea"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/*Pantalla para editar el perfil*/}
      {editarPerfil && (
        <div className="modal_fondo">
          <div className="modal_caja modal_caja_corta animate-in fade-in zoom-in-95 duration-200">
            <div className='modal_encabezado'>
              <h2 className="modal_titulo">Editar Perfil</h2>
              <button onClick={() => setEditarPerfil(false)} className="btn_cerrar">
                <X className='w-5 h-5' />
              </button>
            </div>
            <div>
              <label className="form_label">Nombre</label>
              <input type='text' value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} className="form_input" />
            </div>

            {/* Botones de Acción */}
            <div className="modal_pie">
              <button onClick={() => setEditarPerfil(false)} className="btn_secundario">Cancelar</button>
              <button onClick={guardarPerfil} className="btn_primario">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/*Cambiar contraseña*/}
      {cambiarContra && (
        <div className="modal_fondo">
          <div className="modal_caja modal_caja_corta animate-in fade-in zoom-in-95 duration-200">
            <div className='modal_encabezado'>
              <h2 className="modal_titulo">Cambiar contraseña</h2>
              <button onClick={() => setCambiarContra(false)} className="btn_cerrar">
                <X className='w-5 h-5' />
              </button>
            </div>
            <div className='space-y-4'>
              <div>
                <label className="form_label">Contraseña Actual</label>
                <input type='password' value={contraVieja} onChange={(e) => setContraVieja(e.target.value)} placeholder='........' className="form_input" />
              </div>
            </div>
            <label className="form_label mt-4">Nueva Contraseña</label>
            <input type='password' value={contraNueva} onChange={(e) => setContraNueva(e.target.value)} placeholder='........' className="form_input" />

            {/* Botones de accion cambiar contraseña */}
            <div className='modal_pie'>
              <button onClick={() => setCambiarContra(false)} className="btn_secundario">Cancelar</button>
              <button onClick={actualizarContra} className="btn_peligro">Actualizar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;