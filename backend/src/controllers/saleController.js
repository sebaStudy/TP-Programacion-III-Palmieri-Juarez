const { listarVentas, VENTAS_POR_PAGINA } = require('../services/saleService');
const { leerPaginacion } = require('../middlewares/validarPaginacion');

// GET /api/sales
const listar = async (req, res) => {
  const { page, limit } = leerPaginacion(req.query, VENTAS_POR_PAGINA);
  const { ventas, totalItems } = await listarVentas({ page, limit });

  res.json({
    data: ventas,
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
  });
};

module.exports = { listar };
