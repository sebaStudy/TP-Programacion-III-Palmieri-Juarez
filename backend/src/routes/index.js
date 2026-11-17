// Routes: define qué URL llama a qué controller.
const express = require('express');
const { estado } = require('../controllers/healthController');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const saleRoutes = require('./saleRoutes');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

router.get('/health', estado);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Cualquier otra URL que empiece con /api no existe: se responde 404 en JSON (y no con el HTML de Express).
router.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = router;
