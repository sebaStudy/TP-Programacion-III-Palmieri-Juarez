const express = require('express');
const { listar, obtener, crear, modificar, desactivar, activar } = require('../controllers/productController');
const { subirImagen } = require('../middlewares/upload');
const { requerirAdmin, adminSiPideInactivos } = require('../middlewares/autenticar');
const { reglasProducto, reglasId, reglasListado, responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

// Rutas públicas: las usa el cliente y solo devuelven productos activos
// (con incluirInactivos=true y token de administrador se ven también los inactivos).
router.get('/', ...reglasListado, responderErroresApi, adminSiPideInactivos, listar);
router.get('/:id', ...reglasId, responderErroresApi, obtener);

// Rutas de administrador: sin token válido responden 401 antes de leer el formulario o guardar la imagen.
// Orden: autenticación -> multer (lee el formulario) -> reglas -> responde errores -> controller.
router.post('/', requerirAdmin, subirImagen, ...reglasProducto, responderErroresApi, crear);
router.put('/:id', requerirAdmin, subirImagen, ...reglasId, ...reglasProducto, responderErroresApi, modificar);

router.delete('/:id', requerirAdmin, ...reglasId, responderErroresApi, desactivar);
router.patch('/:id/activar', requerirAdmin, ...reglasId, responderErroresApi, activar);

module.exports = router;
