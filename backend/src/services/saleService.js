// Lógica compartida de ventas: la usan el controller de la API (JSON) y el de las pantallas (EJS).
const { Sale, Product, SaleProduct } = require('../models');

const VENTAS_POR_PAGINA = 6;

// Registra una compra: valida productos y stock, guarda la venta con el precio de ese momento y descuenta el stock.
async function registrarVenta({ nombreCliente, productos: items }) {
  const productos = await Product.findAll({
    where: { id: items.map((item) => item.productId) },
  });
  const detalles = items.map((item) => {
    const producto = productos.find((actual) => actual.id === Number(item.productId));
    if (!producto || !producto.activo) {
      return { error: 'Uno o más productos ya no están disponibles.' };
    }
    if (producto.stock < Number(item.cantidad)) {
      return { error: `No hay stock suficiente de «${producto.nombre}».` };
    }
    return { producto, cantidad: Number(item.cantidad) };
  });

  const error = detalles.find((detalle) => detalle.error);
  if (error) return error;

  const total = Math.round(detalles.reduce(
    (suma, detalle) => suma + Number(detalle.producto.precio) * detalle.cantidad,
    0
  ) * 100) / 100;
  const venta = await Sale.create({ nombreCliente: nombreCliente.trim(), total });

  for (const detalle of detalles) {
    await SaleProduct.create({
      saleId: venta.id,
      productId: detalle.producto.id,
      cantidad: detalle.cantidad,
      precioUnitario: detalle.producto.precio,
    });
    await detalle.producto.update({
      stock: detalle.producto.stock - detalle.cantidad,
    });
  }

  return {
    id: venta.id,
    nombreCliente: venta.nombreCliente,
    fecha: venta.fecha,
    total,
    productos: detalles.map(({ producto, cantidad }) => ({
      productId: producto.id,
      nombre: producto.nombre,
      cantidad,
      precioUnitario: Number(producto.precio),
      subtotal: Number(producto.precio) * cantidad,
    })),
  };
}

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

module.exports = { registrarVenta, listarVentas, VENTAS_POR_PAGINA };
