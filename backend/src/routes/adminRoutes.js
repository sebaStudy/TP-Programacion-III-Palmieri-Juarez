const express = require('express');
const {
  formularioLogin,
  login,
  cerrarSesion,
  formularioUsuario,
  guardarUsuario,
  dashboard,
  formularioNuevo,
  formularioEditar,
  errorEnFormulario,
  guardarNuevo,
  guardarCambios,
  desactivar,
  activar,
  ventas,
} = require('../controllers/adminController');
const { subirImagen } = require('../middlewares/upload');
const { requerirAdminPanel } = require('../middlewares/autenticar');
const { reglasLogin, reglasUsuario } = require('../middlewares/validarAuth');
const { reglasProducto, reglasId } = require('../middlewares/validarProducto');

const router = express.Router();

// Pantallas del back office (devuelven HTML con EJS). Los formularios usan solo GET y POST.

// Login: es lo único que se puede ver sin haber iniciado sesión.
router.get('/login', formularioLogin);
router.post('/login', ...reglasLogin, login);

// Desde acá, todas las rutas piden sesión: sin token válido llevan al login.
router.use(requerirAdminPanel);

router.get('/', (req, res) => res.redirect('/admin/dashboard'));
router.post('/logout', cerrarSesion);

router.get('/users/new', formularioUsuario);
router.post('/users', ...reglasUsuario, guardarUsuario);

router.get('/dashboard', dashboard);
router.get('/sales', ventas);

router.get('/products/new', formularioNuevo);
router.post('/products', subirImagen, ...reglasProducto, errorEnFormulario, guardarNuevo);

router.get('/products/:id/edit', formularioEditar);
router.post('/products/:id', subirImagen, ...reglasId, ...reglasProducto, errorEnFormulario, guardarCambios);

router.post('/products/:id/desactivar', desactivar);
router.post('/products/:id/activar', activar);

module.exports = router;
