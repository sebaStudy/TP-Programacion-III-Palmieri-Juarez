const express = require('express');
const { listar, obtener, crear, modificar, desactivar, activar } = require('../controllers/productController');
const { subirImagen } = require('../middlewares/upload');
const { reglasProducto, reglasId, reglasListado, responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

// Rutas públicas: las usa el cliente y solo devuelven productos activos.
router.get('/', ...reglasListado, responderErroresApi, listar);
router.get('/:id', ...reglasId, responderErroresApi, obtener);

// TODO(login): proteger estas rutas con el middleware de autenticación cuando esté el login.
// Orden: multer (lee el formulario) -> reglas -> responde errores -> controller.
router.post('/', subirImagen, ...reglasProducto, responderErroresApi, crear);
router.put('/:id', subirImagen, ...reglasId, ...reglasProducto, responderErroresApi, modificar);

router.delete('/:id', ...reglasId, responderErroresApi, desactivar);
router.patch('/:id/activar', ...reglasId, responderErroresApi, activar);

module.exports = router;
