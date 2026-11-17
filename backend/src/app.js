require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
require('./models'); // registra los modelos para que sync() cree sus tablas
const routes = require('./routes');
const adminRoutes = require('./routes/adminRoutes');
const sitio = require('./config/sitio');
const frontendRoutes = require('../../frontend/router');
const frontendPath = path.join(__dirname, '..', '..', 'frontend');

if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env (mirá .env.example).');
  process.exit(1);
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.locals.sitio = sitio; // disponible en todas las vistas como "sitio"
app.locals.precio = (valor) => // formato de precio para las vistas: $ 185.000
  Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 2 });
app.use(express.static(path.join(__dirname, '..', 'public'))); // CSS, logo, etc.
app.use('/vendor/jspdf', express.static(path.join(__dirname, '..', 'node_modules', 'jspdf', 'dist')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // imágenes de productos
app.use('/styles', express.static(path.join(frontendPath, 'styles')));
app.use('/assets', express.static(path.join(frontendPath, 'assets')));
app.use('/scrypts', express.static(path.join(frontendPath, 'scrypts')));
// Cada página del front es una ruta que devuelve su archivo HTML (si el archivo todavía no existe, responde 404).
for (const [ruta, archivo] of Object.entries(frontendRoutes)) {
  app.get(ruta, (req, res) => {
    res.sendFile(path.join(frontendPath, 'htmls', archivo), (error) => {
      if (error) res.sendStatus(error.status || 500);
    });
  });
}

app.use(express.json()); // permite leer el body en formato JSON
app.use(express.urlencoded({ extended: false })); // permite leer los formularios HTML (login)
app.use(cookieParser()); // permite leer la cookie con el token del login
app.use('/api', routes); // todas las rutas de la API cuelgan de /api
app.use('/admin', adminRoutes); // pantallas del back office (EJS)

// Errores no previstos: se registran y se responde 500.
// Si el cuerpo de la petición no es un JSON válido, es un error de quien lo envía (400), no del servidor.
app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
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