const express = require('express');
const { crear, listar, obtener } = require('../controllers/saleController');
const { reglasVenta } = require('../middlewares/validarVenta');
const { reglasPaginacion } = require('../middlewares/validarPaginacion');
const { requerirAdmin } = require('../middlewares/autenticar');
const { reglasId, responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

// Compra desde la tienda (pública)
router.post('/', ...reglasVenta, responderErroresApi, crear);
// Listado de ventas: solo para administradores.
router.get('/', requerirAdmin, ...reglasPaginacion, responderErroresApi, listar);
router.get('/:id', requerirAdmin, ...reglasId, responderErroresApi, obtener);

module.exports = router;
