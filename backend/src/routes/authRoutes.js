const express = require('express');
const { login } = require('../controllers/authController');
const { reglasLogin } = require('../middlewares/validarAuth');
const { responderErroresApi } = require('../middlewares/validarProducto');

const router = express.Router();

router.post('/login', ...reglasLogin, responderErroresApi, login);

module.exports = router;
