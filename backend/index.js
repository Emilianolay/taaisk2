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

const SECRET_KEY = process.env.JWT_SECRET || "secreto_temporal";

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Le ponemos la fecha actual al nombre para que nunca se repitan
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    // Devolvemos la URL local donde quedó guardada la imagen
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({ fileUrl });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    res.status(500).json({ error: 'Error al procesar la imagen' });
  }
});



// 🚀 Endpoint: REGISTRO
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    // 2. Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear el usuario en la base de datos
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    res.status(201).json({ message: "Usuario creado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});

// 🔑 Endpoint: LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Buscar al usuario
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 2. Comparar contraseñas
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 3. Generar Token de sesión
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '7d' });

    res.json({ message: "Login exitoso", token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});
// --- RUTA: CREAR TAREA ---
app.post('/api/tasks', async (req, res) => {
  try {
    // 🔥 Agregamos fileUrl aquí
    const { title, description, priority, status, dueDate, tags, userId, fileUrl } = req.body;

    const newTask = await prisma.task.create({
      data: {
        title: title,
        description: description || null,
        status: status || 'TODO',
        priority: priority || 'LOW',
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        fileUrl: fileUrl || null, // 🔥 Ahora sí guardamos el link de la imagen
        position: 0,
        userId: userId
      }
    });

    res.json(newTask);
  } catch (error) {
    console.error("Error creando tarea:", error);
    res.status(500).json({ error: "No se pudieron guardar los detalles de la tarea" });
  }
});
// --- RUTA PARA CARGAR LAS TAREAS DEL USUARIO ---
app.get('/api/tasks/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Le pedimos a Prisma que busque todas las tareas de este usuario
    const userTasks = await prisma.task.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'asc' // Las ordenamos desde la más vieja a la más nueva
      }
    });

    res.json(userTasks);
  } catch (error) {
    console.error("Error al cargar tareas:", error);
    res.status(500).json({ error: "Error al obtener las tareas de la base de datos" });
  }
});
app.put('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    // 🔥 Agregamos fileUrl aquí
    const { title, description, status, priority, dueDate, tags, fileUrl } = req.body;

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (status !== undefined) dataToUpdate.status = status;
    if (priority !== undefined) dataToUpdate.priority = priority;
    if (tags !== undefined) dataToUpdate.tags = tags;
    if (fileUrl !== undefined) dataToUpdate.fileUrl = fileUrl; // 🔥 Lo agregamos a la actualización
    if (dueDate !== undefined) {
      dataToUpdate.dueDate = dueDate ? new Date(dueDate) : null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    res.status(500).json({ error: "No se pudo actualizar la tarea" });
  }
});

// --- NUEVA RUTA: ELIMINAR TAREA ---
app.delete('/api/tasks/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    
    await prisma.task.delete({
      where: { id: taskId }
    });

    res.json({ message: "Tarea eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    res.status(500).json({ error: "No se pudo eliminar la tarea" });
  }
});
// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en http://localhost:${PORT}`);
});