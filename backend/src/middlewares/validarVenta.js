const { body } = require('express-validator');

const reglasVenta = [
  body('nombreCliente')
    .isString().withMessage('El nombre del cliente es obligatorio').bail()
    .trim()
    .notEmpty().withMessage('El nombre del cliente es obligatorio')
    .isLength({ max: 255 }).withMessage('El nombre no puede superar los 255 caracteres'),

  body('productos')
    .isArray({ min: 1 }).withMessage('La venta debe incluir productos'),

  body('productos').custom((productos) => {
    if (!Array.isArray(productos)) return true;
    const ids = productos.map((item) => item && String(item.productId));
    if (new Set(ids).size !== ids.length) {
      throw new Error('No se puede repetir un producto en la venta');
    }
    return true;
  }),

  body('productos.*.productId')
    .isInt({ min: 1 }).withMessage('El id del producto debe ser un entero positivo'),

  body('productos.*.cantidad')
    .isInt({ min: 1, max: 999 }).withMessage('La cantidad debe ser un entero entre 1 y 999'),
];

module.exports = { reglasVenta };
