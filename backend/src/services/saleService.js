const { Product, Sale, SaleProduct } = require('../models');

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

module.exports = { registrarVenta };
