// Routes: define qué URL llama a qué controller.
const express = require('express');
const { estado } = require('../controllers/healthController');
const productRoutes = require('./productRoutes');
const saleRoutes = require('./saleRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.get('/health', estado);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
