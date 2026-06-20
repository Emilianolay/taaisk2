const express = require('express');
const cors = require('cors');
const base = require('./database');

const aplicacion = express();
const puerto = 3500;

//aqui confugramos el uso, los json y el get 

aplicacion.use(cors());
aplicacion.use(express.json());

//una pureba para ver si funciona

aplicacion.get('/', (pedir, answer) => {
    answer.send('Funciona el servidor');
});

//aqui iniciamos el servidor

aplicacion.listen(puerto, () => {
    console.log(`El servidor esta corriendo en el puerto ${puerto}`);
});

