const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors()); // Permite que React (puerto 5173) se comunique con Node (puerto 3000)
app.use(express.json()); // Permite leer los datos en formato JSON

const SECRET_KEY = process.env.JWT_SECRET || "secreto_temporal";

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
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, userId } = req.body;

    // Le decimos a Prisma que cree la tarea en PostgreSQL
    const newTask = await prisma.task.create({
      data: {
        title: title,
        userId: userId,
        status: 'TODO', // Nace en la columna "Por Hacer"
        position: 0     // Por ahora le damos la posición 0 por defecto
      }
    });

    // Respondemos con la tarea ya creada (incluyendo su ID real de la base de datos)
    res.json(newTask);
    
  } catch (error) {
    console.error("Error creando tarea:", error);
    res.status(500).json({ error: "No se pudo guardar la tarea en la base de datos" });
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
    const { status } = req.body;

    // Le pedimos a Prisma que busque la tarea por su ID y le cambie el estatus
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: status }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    res.status(500).json({ error: "No se pudo actualizar la tarea en la base de datos" });
  }
});
// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en http://localhost:${PORT}`);
});