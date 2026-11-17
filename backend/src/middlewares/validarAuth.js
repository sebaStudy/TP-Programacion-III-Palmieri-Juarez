// Validación de los datos de login y de la creación de administradores.
const { body } = require('express-validator');

const reglasLogin = [
  body('email')
    .trim().toLowerCase()
    .notEmpty().withMessage('El correo es obligatorio').bail()
    .isEmail().withMessage('El correo no tiene un formato válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),
];

const reglasUsuario = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 255 }).withMessage('El nombre no puede superar los 255 caracteres'),

  body('email')
    .trim().toLowerCase()
    .notEmpty().withMessage('El correo es obligatorio').bail()
    .isEmail().withMessage('El correo no tiene un formato válido').bail()
    .isLength({ max: 255 }).withMessage('El correo no puede superar los 255 caracteres'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria').bail()
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres').bail()
    .isLength({ max: 72 }).withMessage('La contraseña no puede superar los 72 caracteres'), // límite de bcrypt
];

module.exports = { reglasLogin, reglasUsuario };
