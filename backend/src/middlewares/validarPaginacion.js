// Paginación de los listados: reglas para validar page y limit, y función que los lee ya convertidos a número.
const { query } = require('express-validator');

const reglasPaginacion = [
  query('page').optional().isInt({ min: 1 }).withMessage('page debe ser un entero mayor o igual a 1'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit debe ser un entero entre 1 y 50'),
];

// Cada listado indica cuántos elementos muestra por página si no se pide otra cosa.
// Un valor inválido se reemplaza por el de por defecto.
function leerPaginacion(query, limitPorDefecto) {
  const page = Number.parseInt(query.page, 10);
  const limit = Number.parseInt(query.limit, 10);
  return {
    page: page >= 1 ? page : 1,
    limit: limit >= 1 && limit <= 50 ? limit : limitPorDefecto,
  };
}

module.exports = { reglasPaginacion, leerPaginacion };
