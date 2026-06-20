const {Pool} = require('pg');

const conexion = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'TaAIsk',
    password: 'hola123', //aqui pon tu contrasena jajaja
    port: 5432
});

conexion.connect(
    (error, cliente, liberar) => {
        if (error) {
            return console.error('No se pudo conectar', error.stack);
        }
        console.log('Conexion exitosa');
        liberar();
    }
);

module.exports = conexion;
