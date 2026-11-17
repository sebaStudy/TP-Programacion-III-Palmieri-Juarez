const express = require('express');
const { crear, listar } = require('../controllers/saleController');
const { reglasVenta } = require('../middlewares/validarVenta');
const { reglasPaginacion } = require('../middlewares/validarPaginacion');
const { requerirAdmin } = require('../middlewares/autenticar');
const { responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

// Compra desde la tienda (pública)
router.post('/', ...reglasVenta, responderErroresApi, crear);
// Listado de ventas: solo para administradores.
router.get('/', requerirAdmin, ...reglasPaginacion, responderErroresApi, listar);

module.exports = router;
