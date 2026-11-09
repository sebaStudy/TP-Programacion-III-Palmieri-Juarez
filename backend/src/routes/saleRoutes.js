const express = require('express');
const { listar } = require('../controllers/saleController');
const { reglasPaginacion } = require('../middlewares/validarPaginacion');
const { responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

// TODO(login): solo para administradores, cuando esté el login.
router.get('/', ...reglasPaginacion, responderErroresApi, listar);

module.exports = router;
