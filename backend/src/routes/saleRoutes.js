const express = require('express');
const { crear, listar } = require('../controllers/saleController');
const { reglasVenta } = require('../middlewares/validarVenta');
const { reglasPaginacion } = require('../middlewares/validarPaginacion');
const { responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

// Compra desde la tienda (pública)
router.post('/', ...reglasVenta, responderErroresApi, crear);
// TODO(login): solo para administradores, cuando esté el login.
router.get('/', ...reglasPaginacion, responderErroresApi, listar);

module.exports = router;
