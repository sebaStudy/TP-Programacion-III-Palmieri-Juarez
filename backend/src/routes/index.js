// Routes: define qué URL llama a qué controller.
const express = require('express');
const { estado } = require('../controllers/healthController');
const productRoutes = require('./productRoutes');
const saleRoutes = require('./saleRoutes');

const router = express.Router();

router.get('/health', estado);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);

module.exports = router;
