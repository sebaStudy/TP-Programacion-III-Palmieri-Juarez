const express = require('express');
const { crear, modificar } = require('../controllers/productController');
const { subirImagen } = require('../middlewares/upload');
const { reglasProducto, reglasId, responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

// TODO(login): proteger estas rutas con el middleware de autenticación cuando esté el login.
// Orden: multer (lee el formulario) -> reglas -> responde errores -> controller.
router.post('/', subirImagen, ...reglasProducto, responderErroresApi, crear);
router.put('/:id', subirImagen, ...reglasId, ...reglasProducto, responderErroresApi, modificar);

module.exports = router;
