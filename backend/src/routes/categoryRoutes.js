const express = require('express');
const { listar } = require('../controllers/categoryController');

const router = express.Router();

// Pública: la usa el cliente para filtrar productos por categoría.
router.get('/', listar);

module.exports = router;
