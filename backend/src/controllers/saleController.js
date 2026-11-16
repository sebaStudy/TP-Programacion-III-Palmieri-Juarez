const sitio = require('../config/sitio');
const { registrarVenta } = require('../services/saleService');

const crear = async (req, res, next) => {
  try {
    const venta = await registrarVenta(req.body);
    if (venta.error) return res.status(400).json({ error: venta.error });
    res.status(201).json({ data: { ...venta, empresa: sitio.nombre } });
  } catch (error) {
    next(error);
  }
};

module.exports = { crear };
