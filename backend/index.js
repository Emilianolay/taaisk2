const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const prisma = new PrismaClient();

app.use(cors()); // Permite que React (puerto 5173) se comunique con Node (puerto 3000)
app.use(express.json()); // Permite leer los datos en formato JSON

const CLAVE_SECRETA = process.env.JWT_SECRET || "secreto_temporal";

const directorioSubidas = path.join(__dirname, 'uploads');
if (!fs.existsSync(directorioSubidas)) {
  fs.mkdirSync(directorioSubidas);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const almacenamiento = multer.diskStorage({
  destination: function (req, archivo, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, archivo, cb) {
    // Le ponemos la fecha actual al nombre para que nunca se repitan
    cb(null, Date.now() + '-' + archivo.originalname.replace(/\s+/g, '-'));
  }
});
const subir = multer({ storage: almacenamiento });

app.post('/api/upload', subir.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    // Devolvemos la URL local donde quedó guardada la imagen
    const urlArchivo = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ fileUrl: urlArchivo }); // Mantenemos fileUrl por ahora para que el front lo entienda si no se ha cambiado
  } catch (error) {
    console.error("Error al subir archivo:", error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});



// Endpoint: REGISTRO
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({ where: { correo: email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // 2. Encriptar la contraseña
    const contrasenaEncriptada = await bcrypt.hash(password, 10);

    // 3. Crear el usuario en la base de datos
    const nuevoUsuario = await prisma.usuario.create({
      data: { nombre: name, correo: email, contrasena: contrasenaEncriptada }
    });

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// Endpoint: LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario
    const usuario = await prisma.usuario.findUnique({ where: { correo: email } });
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2. Comparar contraseñas
    const contrasenaValida = await bcrypt.compare(password, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 3. Generar Token de sesión
    const token = jwt.sign({ userId: usuario.id }, CLAVE_SECRETA, { expiresIn: '7d' });

    res.json({ message: "Login exitoso", token, user: { id: usuario.id, name: usuario.nombre, email: usuario.correo } });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// --- RUTA: CREAR TAREA ---
app.post('/api/tasks', async (req, res) => {
  try {
    // Aceptamos las claves del frontend y mapeamos a la BD en español
    const { title, description, priority, status, dueDate, tags, userId, fileUrl } = req.body;

    // Mapeo temporal de enums
    const mapaEstado = { 'TODO': 'porHacer', 'IN_PROGRESS': 'enProgreso', 'COMPLETED': 'completado', 'porHacer': 'porHacer', 'enProgreso': 'enProgreso', 'completado': 'completado' };
    const mapaPrioridad = { 'LOW': 'baja', 'MEDIUM': 'media', 'HIGH': 'alta', 'baja': 'baja', 'media': 'media', 'alta': 'alta' };

    const estadoEspanol = mapaEstado[status] || 'porHacer';
    const prioridadEspanol = mapaPrioridad[priority] || 'baja';

    const nuevaTarea = await prisma.tarea.create({
      data: {
        titulo: title,
        descripcion: description || null,
        estado: estadoEspanol,
        prioridad: prioridadEspanol,
        fechaLimite: dueDate ? new Date(dueDate) : null,
        etiquetas: tags || [],
        urlArchivo: fileUrl || null,
        posicion: 0,
        idUsuario: userId
      }
    });

    res.json(nuevaTarea);
  } catch (error) {
    console.error("Error creando tarea:", error);
    res.status(500).json({ error: "No se pudieron guardar los detalles de la tarea" });
  }
});

// --- RUTA PARA CARGAR LAS TAREAS DEL USUARIO ---
app.get('/api/tasks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const tareasUsuario = await prisma.tarea.findMany({
      where: {
        idUsuario: userId
      },
      orderBy: {
        fechaCreacion: 'asc' // Las ordenamos desde la más vieja a la más nueva
      }
    });

    res.json(tareasUsuario);
  } catch (error) {
    console.error("Error al cargar tareas:", error);
    res.status(500).json({ error: "Error al obtener las tareas de la base de datos" });
  }
});

app.put('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, tags, fileUrl } = req.body;

    const mapaEstado = { 'TODO': 'porHacer', 'IN_PROGRESS': 'enProgreso', 'COMPLETED': 'completado', 'porHacer': 'porHacer', 'enProgreso': 'enProgreso', 'completado': 'completado' };
    const mapaPrioridad = { 'LOW': 'baja', 'MEDIUM': 'media', 'HIGH': 'alta', 'baja': 'baja', 'media': 'media', 'alta': 'alta' };

    const datosAActualizar = {};
    if (title !== undefined) datosAActualizar.titulo = title;
    if (description !== undefined) datosAActualizar.descripcion = description;
    if (status !== undefined) datosAActualizar.estado = mapaEstado[status] || status;
    if (priority !== undefined) datosAActualizar.prioridad = mapaPrioridad[priority] || priority;
    if (tags !== undefined) datosAActualizar.etiquetas = tags;
    if (fileUrl !== undefined) datosAActualizar.urlArchivo = fileUrl;
    if (dueDate !== undefined) {
      datosAActualizar.fechaLimite = dueDate ? new Date(dueDate) : null;
    }

    const tareaActualizada = await prisma.tarea.update({
      where: { id: taskId },
      data: datosAActualizar
    });

    res.json(tareaActualizada);
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    res.status(500).json({ error: "No se pudo actualizar la tarea" });
  }
});

// --- NUEVA RUTA: ELIMINAR TAREA ---
app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    await prisma.tarea.delete({
      where: { id: taskId }
    });

    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    res.status(500).json({ error: "No se pudo eliminar la tarea" });
  }
});

//Editamos el perfil del usuario
//Para su nombre 
app.put('/api/users/:userId/profile', async (req, res) => {
  try{
    const {userId} = req.params;
    const {nuevoNombre} = req.body; // Esto sí viene como "nuevoNombre" del frontend

    const usActualizado = await prisma.usuario.update({
      where: {id: userId},
      data: {nombre: nuevoNombre}
    });

    res.json(usActualizado);
  }catch(error){
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({ error: "No se actualizo el perfil"});
  }
});

//Para su contraseña
app.put('/api/users/:userId/password', async (req, res) =>{
  try{
    const {userId} = req.params;
    const {contraVieja, contraNueva} = req.body; // Vienen en español del frontend
    
    const usEncontrado = await prisma.usuario.findUnique({ where: { id: userId}});
    if(!usEncontrado){
      return res.status(404).json({ error: "Usuario no encontrado"});
    }

    const contraValida = await bcrypt.compare(contraVieja, usEncontrado.contrasena);
    if(!contraValida){
      return res.status(401).json({error: "La contraseña actual es incorrecta"});
    }

    const encrNuevaContra = await bcrypt.hash(contraNueva, 10);

    await prisma.usuario.update({
      where: {id: userId},
      data: {contrasena: encrNuevaContra}
    });
    res.json({ message: "Contraseña actualizada con exito"});
  }catch (error){
    console.error("Error al cambiar contraseña:", error);
    res.status(500).json({error: "Error al cambiar la contraseña"});
  }
});

// Iniciar el servidor
const PUERTO = 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor Backend corriendo en http://localhost:${PUERTO}`);
});