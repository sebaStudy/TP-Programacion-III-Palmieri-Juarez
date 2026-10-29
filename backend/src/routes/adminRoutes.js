const express = require('express');
const {
  dashboard,
  formularioNuevo,
  formularioEditar,
  errorEnFormulario,
  guardarNuevo,
  guardarCambios,
} = require('../controllers/adminController');
const { subirImagen } = require('../middlewares/upload');
const { reglasProducto, reglasId } = require('../middlewares/validarProducto');

const router = express.Router();

// Pantallas del back office (devuelven HTML con EJS). Los formularios usan solo GET y POST.
// TODO(login): proteger estas rutas cuando esté el login.
router.get('/dashboard', dashboard);

router.get('/products/new', formularioNuevo);
router.post('/products', subirImagen, ...reglasProducto, errorEnFormulario, guardarNuevo);

router.get('/products/:id/edit', formularioEditar);
router.post('/products/:id', subirImagen, ...reglasId, ...reglasProducto, errorEnFormulario, guardarCambios);

module.exports = router;
