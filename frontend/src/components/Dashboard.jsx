import { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Flame, Trophy, CheckCircle, Palette, Trash2, Plus, User, Moon, X, Flag, Calendar, Image as ImageIcon } from 'lucide-react';
import Customizacion from './customizacion';

function Dashboard({ user, onLogout }) {
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [primaryColor, setPrimaryColor] = useState({ id: 'blue', hex: '#4f46e5', lightHex: '#818cf8' });

  const [tasks, setTasks] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [status, setStatus] = useState('TODO');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagsList, setTagsList] = useState([]);
  
  // 🔥 NUEVOS ESTADOS PARA LA IMAGEN
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(''); // Guarda la URL de la imagen si ya existe

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/tasks/${user.id}`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error al descargar mis tareas:", error);
      }
    };
    if (user && user.id) fetchMyTasks();
  }, [user]);

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const priorityConfig = {
    LOW: { color: 'text-slate-400 dark:text-blue-300', bg: 'bg-slate-100 dark:bg-[#01004A]', label: 'Baja' },
    MEDIUM: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40', label: 'Media' },
    HIGH: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/40', label: 'Alta' }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tagsList.includes(tagInput.trim())) {
      setTagsList([...tagsList, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTagsList(tagsList.filter(t => t !== tagToRemove));
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setNewTaskTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setTagsList(task.tags || []);
    setFileUrl(task.fileUrl || ''); // Cargamos la foto existente
    setSelectedFile(null); // Limpiamos la selección de nuevos archivos
    setIsModalOpen(true);
  };

  const resetModal = () => {
    setEditingTaskId(null);
    setNewTaskTitle('');
    setDescription('');
    setPriority('LOW');
    setStatus('TODO');
    setDueDate('');
    setTagsList([]);
    setFileUrl('');
    setSelectedFile(null);
    setIsModalOpen(false);
  };

  // --- 🔥 LOGICA ACTUALIZADA PARA SUBIR LA FOTO PRIMERO ---
  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    let finalFileUrl = fileUrl; // Mantiene la foto vieja si no subimos una nueva

    // Si el usuario seleccionó una foto nueva, la subimos a nuestro backend primero
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const uploadResponse = await axios.post('http://localhost:3000/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalFileUrl = uploadResponse.data.fileUrl; // Guardamos el link de la nueva foto
      } catch (error) {
        console.error("Error al subir imagen:", error);
        alert("No se pudo subir la imagen");
        return; // Si falla la subida, cancelamos guardar la tarea
      }
    }

    try {
      if (editingTaskId) {
        const response = await axios.put(`http://localhost:3000/api/tasks/${editingTaskId}`, {
          title: newTaskTitle,
          description,
          priority,
          status,
          dueDate: dueDate || null,
          tags: tagsList,
          fileUrl: finalFileUrl // Le mandamos la URL de la foto a la base de datos
        });
        setTasks(tasks.map(t => t.id === editingTaskId ? response.data : t));
      } else {
        const response = await axios.post('http://localhost:3000/api/tasks', {
          title: newTaskTitle,
          description,
          priority,
          status,
          dueDate: dueDate || null,
          tags: tagsList,
          userId: user.id,
          fileUrl: finalFileUrl // Le mandamos la URL de la foto a la base de datos
        });
        setTasks([...tasks, response.data]); 
      }
      resetModal();
    } catch (error) {
      console.error("Error al guardar la tarea:", error);
      alert("Hubo un error al guardar la tarea");
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta tarea permanentemente?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Error al eliminar la tarea:", error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const movedTask = tasks.find(t => t.id === draggableId);
    const newTasks = tasks.filter(t => t.id !== draggableId);
    const updatedTask = { ...movedTask, status: destination.droppableId };
    
    newTasks.splice(destination.index, 0, updatedTask);
    setTasks(newTasks);

    try {
      await axios.put(`http://localhost:3000/api/tasks/${draggableId}`, {
        status: destination.droppableId
      });
    } catch (error) {
      console.error("Error al guardar la posición:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#000033] text-slate-800 dark:text-blue-50 transition-colors duration-500 p-6 md:p-12 font-sans relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--c_primario)] tracking-tight drop-shadow-sm transition-colors duration-300">TaAlsk</h1>
            <p className="text-slate-500 dark:text-blue-300 font-medium mt-1">Organiza tu trabajo y mantén tu racha activa</p>
          </div>
          
          <div className="flex items-center gap-3 self-end md:self-auto">
            <button onClick={() => setIsCustomizerOpen(true)} className='p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-slate-100 dark:hover:bg-[#020166] shadow-sm transition-all text-slate-500 dark:text-blue-200 cursor-pointer'>
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={() => setIsDark(!isDark)} className='p-2.5 bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-xl hover:bg-slate-100 dark:hover:bg-[#020166] shadow-sm transition-all text-slate-500 dark:text-blue-200 cursor-pointer'>
              <Moon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => { resetModal(); setIsModalOpen(true); }}
              className="bg-[var(--c_primario)] text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-80 shadow-md shadow-[var(--c_primario)]/20 flex items-center gap-2 transition-all duration-300 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nueva Tarea
            </button>
            <button onClick={onLogout} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 dark:hover:text-red-400 shadow-sm transition-all text-slate-500 dark:text-blue-200 cursor-pointer" title="Cerrar sesión">
              <User className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* --- PANEL DE ESTADÍSTICAS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#01004A] p-6 rounded-2xl border border-slate-200/80 dark:border-[#030188] shadow-sm flex items-center gap-5">
            <div className="p-4 bg-orange-50 dark:bg-orange-500/10 rounded-2xl text-orange-500"><Flame className="w-8 h-8 fill-current" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-blue-300 uppercase tracking-widest">Racha Actual</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{user?.currentStreak || 0} <span className="text-lg font-bold text-slate-500 dark:text-blue-300">días</span></p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#01004A] p-6 rounded-2xl border border-slate-200/80 dark:border-[#030188] shadow-sm flex items-center gap-5">
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-500"><Trophy className="w-8 h-8 fill-current" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-blue-300 uppercase tracking-widest">Mejor Racha</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{user?.bestStreak || 0} <span className="text-lg font-bold text-slate-500 dark:text-blue-300">días</span></p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#01004A] p-6 rounded-2xl border border-slate-200/80 dark:border-[#030188] shadow-sm flex items-center gap-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-500"><CheckCircle className="w-8 h-8" /></div>
            <div>
              <p className="text-sm font-bold text-slate-400 dark:text-blue-300 uppercase tracking-widest">Tareas Completadas</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
                {completedTasks.length} <span className="text-lg font-bold text-slate-500 dark:text-blue-300">total</span>
              </p>
            </div>
          </div>
        </section>

        {/* --- TABLERO KANBAN CON DRAG AND DROP --- */}
        <DragDropContext onDragEnd={onDragEnd}>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {[{ id: 'TODO', title: 'Por Hacer', data: todoTasks, dragColor: 'indigo' },
              { id: 'IN_PROGRESS', title: 'En Progreso', data: inProgressTasks, dragColor: 'amber' },
              { id: 'COMPLETED', title: 'Completado', data: completedTasks, dragColor: 'emerald' }
            ].map(col => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className={`bg-slate-100/70 dark:bg-[#01004A] rounded-3xl p-5 border transition-all duration-500 ${snapshot.isDraggingOver ? `border-${col.dragColor}-300 dark:border-${col.dragColor}-500 bg-${col.dragColor}-50/50 dark:bg-[#020166]/80` : 'border-slate-200/50 dark:border-[#030188]'}`}>
                    <div className="flex justify-between items-center mb-5 px-1">
                      <h3 className="font-extrabold text-slate-700 dark:text-blue-100 tracking-wide">{col.title}</h3>
                      <span className="bg-slate-200 dark:bg-[#020166] text-[var(--c_primario)] px-2.5 py-1 rounded-lg text-xs font-black shadow-sm">{col.data.length}</span>
                    </div>
                    <div className="space-y-4 min-h-[350px]">
                      {col.data.length === 0 && !snapshot.isDraggingOver && col.id === 'IN_PROGRESS' && <p className="text-center text-slate-400 dark:text-blue-400 font-medium text-sm mt-12 border-2 border-dashed border-slate-200 dark:border-[#030188] rounded-xl py-8">Arrastra tareas aquí</p>}
                      {col.data.map((t, index) => (
                        <Draggable key={t.id} draggableId={t.id} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                              onClick={() => openEditModal(t)}
                              className={`bg-white dark:bg-[#020166] p-4 rounded-2xl shadow-sm border transition-all cursor-pointer flex flex-col group ${snapshot.isDragging ? 'shadow-lg ring-2 ring-[var(--c_primario)]/50 rotate-2 dark:border-[#0401AD]' : 'border-slate-200/80 dark:border-[#030188] hover:shadow-[0_4px_15px_rgba(6,2,213,0.4)] dark:hover:border-[#0401AD]'} ${col.id === 'COMPLETED' ? 'opacity-75' : ''}`}
                            >
                              
                              {/* 🔥 NUEVO: Render de la Imagen en la Tarjeta */}
                              {t.fileUrl && (
                                <div className="mb-3 -mx-4 -mt-4 overflow-hidden rounded-t-2xl">
                                  <img src={t.fileUrl} alt="Adjunto de tarea" className={`w-full h-32 object-cover ${col.id === 'COMPLETED' ? 'opacity-60 grayscale' : ''}`} />
                                </div>
                              )}

                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  {t.priority && (
                                    <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md ${col.id === 'COMPLETED' ? 'opacity-50' : ''} ${priorityConfig[t.priority].bg} ${priorityConfig[t.priority].color}`}>
                                      <Flag className="w-3 h-3 fill-current" /> {priorityConfig[t.priority].label}
                                    </span>
                                  )}
                                </div>
                                <button onClick={(e) => handleDeleteTask(t.id, e)} className="text-slate-300 hover:text-red-500 dark:text-blue-300/40 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className={`font-bold text-sm leading-tight mb-1 ${col.id === 'COMPLETED' ? 'text-slate-400 dark:text-blue-300 line-through' : 'text-slate-700 dark:text-blue-50'}`}>{t.title}</div>
                              {t.description && <div className={`text-xs font-medium line-clamp-2 mb-3 ${col.id === 'COMPLETED' ? 'text-slate-400/60 dark:text-blue-300/40 line-through' : 'text-slate-400 dark:text-blue-300/60'}`}>{t.description}</div>}
                              
                              <div className={`mt-auto pt-3 flex justify-between items-end gap-2 ${col.id === 'COMPLETED' ? 'opacity-60' : ''}`}>
                                <div className="flex flex-wrap gap-1">
                                  {t.tags && t.tags.length > 0 && t.tags.map((tag, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 dark:bg-[#01004A] text-slate-500 dark:text-blue-300 px-1.5 py-0.5 rounded font-mono">#{tag}</span>
                                  ))}
                                </div>
                                {t.dueDate && (
                                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-blue-300/80 bg-slate-50 dark:bg-[#01004A] px-2 py-1 rounded-lg border border-slate-100 dark:border-[#030188]">
                                    <Calendar className="w-3 h-3" /> {formatDate(t.dueDate)}
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

      {isCustomizerOpen && (
        <Customizacion isDark={isDark} toggleDark={() => setIsDark(!isDark)} primaryColor={primaryColor} setPrimaryColor={setPrimaryColor} onClose={() => setIsCustomizerOpen(false)} />
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#01004A] border border-slate-200 dark:border-[#030188] rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-blue-50">
                {editingTaskId ? "Editar Tarea" : "Crear nueva tarea"}
              </h2>
              <button onClick={resetModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-blue-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-[#020166] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4">
              
              {/* 🔥 NUEVO: PREVISUALIZACIÓN DE IMAGEN */}
              {(fileUrl || selectedFile) && (
                <div className="relative w-full h-32 mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[#030188]">
                  <img 
                    src={selectedFile ? URL.createObjectURL(selectedFile) : fileUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <button 
                    type="button" 
                    onClick={() => { setFileUrl(''); setSelectedFile(null); }}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-lg backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-1">Título</label>
                <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Avance de Proyecto" className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2.5 outline-none focus:border-[var(--c_primario)] text-slate-800 dark:text-blue-50 text-sm" required autoFocus />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-1">Descripción</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Objetivos" className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2 outline-none focus:border-[var(--c_primario)] text-slate-800 dark:text-blue-50 text-sm resize-none min-h-[70px]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-1">Prioridad</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-3 py-2.5 outline-none focus:border-[var(--c_primario)] text-slate-700 dark:text-blue-100 text-sm cursor-pointer">
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-1">Estado</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-3 py-2.5 outline-none focus:border-[var(--c_primario)] text-slate-700 dark:text-blue-100 text-sm cursor-pointer">
                    <option value="TODO">Por Hacer</option>
                    <option value="IN_PROGRESS">En Progreso</option>
                    <option value="COMPLETED">Completado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-1">Fecha límite</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-3 py-2 outline-none focus:border-[var(--c_primario)] text-slate-700 dark:text-blue-100 text-sm cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-1">Adjuntar Imagen</label>
                  {/* 🔥 BOTÓN REAL PARA SUBIR ARCHIVOS */}
                  <label className="w-full bg-indigo-50 hover:bg-indigo-100 dark:bg-[#020166] dark:hover:bg-[#030188] border border-indigo-200 dark:border-[#030188] rounded-xl px-2 py-2 text-xs font-bold text-[var(--c_primario)] dark:text-blue-300 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <ImageIcon className="w-4 h-4" /> 
                    {selectedFile ? 'Cambiar imagen' : 'Seleccionar archivo'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-blue-200 uppercase tracking-wider mb-1">Etiquetas</label>
                <div className="flex gap-2">
                  <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Ej. Diseño, urgente..." className="flex-1 bg-slate-50 dark:bg-[#020166] border border-slate-200 dark:border-[#030188] rounded-xl px-4 py-2 outline-none focus:border-[var(--c_primario)] text-slate-800 dark:text-blue-50 text-sm" />
                  <button onClick={handleAddTag} className="bg-slate-100 dark:bg-[#020166] hover:bg-slate-200 dark:hover:bg-[#030188] border border-slate-200 dark:border-[#030188] text-slate-700 dark:text-blue-100 font-bold px-4 rounded-xl text-xs transition-colors cursor-pointer">Añadir</button>
                </div>
                {tagsList.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tagsList.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-[#020166] border border-indigo-100 dark:border-[#030188] text-indigo-600 dark:text-blue-300 px-2 py-0.5 rounded-lg text-xs font-semibold">
                        #{tag}
                        <X onClick={() => handleRemoveTag(tag)} className="w-3 h-3 cursor-pointer hover:text-red-500" />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 dark:border-[#030188]">
                <button type="button" onClick={resetModal} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-blue-200 hover:bg-slate-100 dark:hover:bg-[#020166] transition-colors cursor-pointer text-sm">Cancelar</button>
                <button type="submit" className="bg-[var(--c_primario)] text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-90 shadow-md transition-colors cursor-pointer text-sm">
                  {editingTaskId ? "Guardar Cambios" : "Crear Tarea"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;