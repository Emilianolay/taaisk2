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

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor Backend corriendo en http://localhost:${PORT}`);
});