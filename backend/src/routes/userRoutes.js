const express = require('express');
const { crearUsuario } = require('../controllers/authController');
const { requerirAdmin } = require('../middlewares/autenticar');
const { reglasUsuario } = require('../middlewares/validarAuth');
const { responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

// Solo un administrador con sesión iniciada puede crear a otro.
router.post('/', requerirAdmin, ...reglasUsuario, responderErroresApi, crearUsuario);

module.exports = router;
