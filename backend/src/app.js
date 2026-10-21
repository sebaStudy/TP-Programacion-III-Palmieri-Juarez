require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
require('./models'); // registra los modelos para que sync() cree sus tablas
const routes = require('./routes');

const app = express();

app.use(express.json()); // permite leer el body en formato JSON
app.use('/api', routes); // todas las rutas de la API cuelgan de /api

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    await sequelize.authenticate(); // prueba la conexión a la base
    console.log('Conexión a la base de datos OK');
    await sequelize.sync(); // crea las tablas que no existan
    console.log('Tablas sincronizadas');
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
    process.exit(1);
  }
}

iniciar();
