const express = require('express');
const { crear } = require('../controllers/saleController');
const { reglasVenta } = require('../middlewares/validarVenta');
const { responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

router.post('/', ...reglasVenta, responderErroresApi, crear);

module.exports = router;
