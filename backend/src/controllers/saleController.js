const sitio = require('../config/sitio');
const { registrarVenta, listarVentas, VENTAS_POR_PAGINA } = require('../services/saleService');
const { leerPaginacion } = require('../middlewares/validarPaginacion');

const crear = async (req, res, next) => {
  try {
    const venta = await registrarVenta(req.body);
    if (venta.error) return res.status(400).json({ error: venta.error });
    res.status(201).json({ data: { ...venta, empresa: sitio.nombre } });
  } catch (error) {
    next(error);
  }
};

// GET /api/sales
const listar = async (req, res) => {
  const { page, limit } = leerPaginacion(req.query, VENTAS_POR_PAGINA);
  const { ventas, totalItems } = await listarVentas({ page, limit });

  res.json({
    data: ventas,
    pagination: { page, limit, totalItems, totalPages: Math.ceil(totalItems / limit) },
  });
};

module.exports = { crear, listar };
