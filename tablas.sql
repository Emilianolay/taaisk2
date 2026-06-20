
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(70) NOT NULL,
    role VARCHAR(20) DEFAULT 'usuario',
    racha INTEGER DEFAULT 0,
    mejor_racha INTEGER DEFAULT 0,
    ultima_tarea DATE,
    tema VARCHAR(20) DEFAULT 'light',
    tema_color VARCHAR(20) DEFAULT 'blue',
    creacion_cuenta TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
 
CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) DEFAULT 'Por Hacer',
    prioridad VARCHAR(50) DEFAULT 'Media',
    creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE etiquetas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    color VARCHAR(50) DEFAULT '#ccc'
);

CREATE TABLE tareas_etiquetas (
    id_tarea INTEGER REFERENCES tareas(id) ON DELETE CASCADE,
    id_etiquetas INTEGER REFERENCES etiquetas(id) ON DELETE CASCADE,
    PRIMARY KEY (id_tarea, id_etiquetas)
);
