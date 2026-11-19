const sitio = require('../config/sitio');
const { registrarVenta, listarVentas, buscarVenta, VENTAS_POR_PAGINA } = require('../services/saleService');
const { generarPdfTicket } = require('../services/ticketPdfService');
const { leerPaginacion } = require('../middlewares/validarPaginacion');

const descargarPdf = async (req, res, next) => {
  const ticket = req.body;
  const esNumeroValido = (valor) => typeof valor === 'number' && Number.isFinite(valor) && valor >= 0;
  const ticketValido = ticket
    && typeof ticket === 'object'
    && typeof ticket.empresa === 'string'
    && typeof ticket.nombreCliente === 'string'
    && ticket.nombreCliente.length > 0
    && Number.isFinite(Date.parse(ticket.fecha))
    && esNumeroValido(ticket.total)
    && Array.isArray(ticket.productos)
    && ticket.productos.length > 0
    && ticket.productos.length <= 100
    && ticket.productos.every((producto) =>
      producto
      && typeof producto.nombre === 'string'
      && Number.isInteger(producto.cantidad)
      && producto.cantidad > 0
      && esNumeroValido(producto.precioUnitario)
      && esNumeroValido(producto.subtotal)
    );

  if (!ticketValido) {
    return res.status(400).json({ error: 'Los datos del ticket no son válidos.' });
  }

  try {
    const pdf = await generarPdfTicket(ticket);
    const id = String(ticket.id || 'compra').replace(/[^\w-]/g, '');
    res.type('application/pdf').attachment(`ticket-${id || 'compra'}.pdf`).send(pdf);
  } catch (error) {
    next(error);
  }
};

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

// GET /api/sales/:id (404 si no existe)
const obtener = async (req, res) => {
  const venta = await buscarVenta(req.params.id);
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json({ data: venta });
};

module.exports = { crear, listar, obtener, descargarPdf };
