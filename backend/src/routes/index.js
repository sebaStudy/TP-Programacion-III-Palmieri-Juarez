// Routes: define qué URL llama a qué controller.
const express = require('express');
const { estado } = require('../controllers/healthController');

const router = express.Router();

router.get('/health', estado);

module.exports = router;
