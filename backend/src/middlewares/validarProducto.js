// Validación de productos con express-validator.
// Va DESPUÉS de multer: recién ahí existen req.body y req.errorImagen.
const fs = require('fs');
const { body, param, validationResult } = require('express-validator');
const { Category } = require('../models');

// Reglas del alta y de la modificación (en la modificación también se envían todos los datos).
// bail() corta la cadena de un campo en su primer error, así cada campo muestra un solo mensaje.
const reglasProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio').bail()
    .isLength({ max: 255 }).withMessage('El nombre no puede superar los 255 caracteres'),

  body('descripcion').optional().trim(),

  body('precio')
    .notEmpty().withMessage('El precio es obligatorio').bail()
    .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor a 0'),

  body('stock')
    .optional({ values: 'falsy' }) // un campo vacío cuenta como "no enviado"
    .isInt({ min: 0 }).withMessage('El stock debe ser un entero mayor o igual a 0'),

  body('categoryId')
    .notEmpty().withMessage('La categoría es obligatoria').bail()
    .isInt({ min: 1 }).withMessage('La categoría no es válida').bail()
    .custom(async (id) => {
      const categoria = await Category.findByPk(id);
      if (!categoria) throw new Error('La categoría no existe');
    }),
];

// Regla para las rutas con :id
const reglasId = [
  param('id').isInt({ min: 1 }).withMessage('El id debe ser un entero positivo'),
];

// Junta los errores de express-validator y el de la imagen (que dejó multer) en una sola lista.
function recolectarErrores(req) {
  const errores = validationResult(req)
    .array()
    .map((e) => ({ campo: e.path, mensaje: e.msg }));
  if (req.errorImagen) errores.push({ campo: 'imagen', mensaje: req.errorImagen });
  return errores;
}

// Si multer ya guardó una imagen y la petición se rechaza, la borra para no dejar archivos huérfanos.
function borrarImagenSubida(req) {
  if (req.file) fs.unlink(req.file.path, () => {});
}

// Cierre de la cadena para la API: si hay errores responde 400 con JSON; si no, sigue.
function responderErroresApi(req, res, next) {
  const errores = recolectarErrores(req);
  if (errores.length === 0) return next();
  borrarImagenSubida(req);
  res.status(400).json({ error: 'Datos inválidos', detalles: errores });
}

module.exports = {
  reglasProducto,
  reglasId,
  recolectarErrores,
  borrarImagenSubida,
  responderErroresApi,
};
