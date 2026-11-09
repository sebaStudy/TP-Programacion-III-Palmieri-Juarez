// Lógica compartida de ventas: la usan el controller de la API (JSON) y el de las pantallas (EJS).
const { Sale, Product } = require('../models');

const VENTAS_POR_PAGINA = 6;

// Arma la venta como la describe el contrato: con sus productos, el precio de ese momento y el subtotal.
function formatearVenta(venta) {
  return {
    id: venta.id,
    nombreCliente: venta.nombreCliente,
    fecha: venta.fecha,
    total: Number(venta.total),
    productos: venta.Products.map((p) => {
      const cantidad = p.SaleProduct.cantidad;
      const precioUnitario = Number(p.SaleProduct.precioUnitario);
      return { id: p.id, nombre: p.nombre, cantidad, precioUnitario, subtotal: cantidad * precioUnitario };
    }),
  };
}

// Ventas de la más reciente a la más antigua, con sus productos, de a una página.
async function listarVentas({ page, limit }) {
  const { count, rows } = await Sale.findAndCountAll({
    include: Product, // trae los productos de cada venta (con cantidad y precioUnitario de SaleProduct)
    order: [['fecha', 'DESC'], ['id', 'DESC'], [Product, 'nombre', 'ASC']],
    limit,
    offset: (page - 1) * limit,
    distinct: true, // cuenta ventas y no filas repetidas por cada producto
  });
  return { ventas: rows.map(formatearVenta), totalItems: count };
}

module.exports = { listarVentas, VENTAS_POR_PAGINA };
