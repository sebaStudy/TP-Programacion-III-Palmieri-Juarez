require('dotenv').config();
const path = require('path');
const express = require('express');
const sequelize = require('./config/database');
require('./models'); // registra los modelos para que sync() cree sus tablas
const routes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const sitio = require('./config/sitio');
const frontendRoutes = require('../../frontend/router');
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.sitio = sitio; // disponible en todas las vistas como "sitio"
app.locals.precio = (valor) => // formato de precio para las vistas: $ 185.000
  Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2 });
app.use(express.static(path.join(__dirname, '..', 'public'))); // CSS, logo, etc.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // imágenes de productos
app.use('/styles', express.static(path.join(frontendPath, 'styles')));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));
app.use('/scrypts', express.static(path.join(frontendPath, 'scrypts')));
app.get([...Object.keys(frontendRoutes), '/productos/:pagina'], (req, res, next) => {
  const ruta = /^\/productos\/\d+$/.test(req.path) ? '/productos' : req.path;
  const file = frontendRoutes[ruta];
  if (!file) return next();

  res.sendFile(path.join(frontendPath, 'htmls', file), (error) => {
    if (error) {
      if (error.status === 404) return res.sendStatus(404);
      return next(error);
    }
  });
});

app.use(express.json()); // permite leer el body en formato JSON
app.use('/api', routes); // todas las rutas de la API cuelgan de /api
app.use('/admin', adminRoutes); // pantallas del back office (EJS)

// Errores no previstos: se registran y se responde 500
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

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
