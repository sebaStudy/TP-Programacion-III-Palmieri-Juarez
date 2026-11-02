// Lógica compartida de productos: la usan el controller de la API (JSON) y el de las pantallas (EJS).
const { Product, Category } = require('../models');
const { borrarArchivo } = require('../middlewares/upload');

const incluirCategoria = { include: { model: Category, attributes: ['id', 'nombre'] } };

// Convierte lo que llega del formulario en lo que se guarda en la base.
function armarDatos(body, file) {
  const { nombre, descripcion, precio, stock, categoryId } = body;
  const datos = {
    nombre,
    descripcion: descripcion || null,
    precio,
    stock: stock || 0, // un stock vacío llega como "" y se guarda como 0
    categoryId,
  };
  if (file) datos.imagen = `/uploads/${file.filename}`; // sin foto nueva no se toca la imagen
  return datos;
}

async function crearProducto(body, file) {
  const producto = await Product.create(armarDatos(body, file));
  return Product.findByPk(producto.id, incluirCategoria);
}

// Devuelve null si el producto no existe.
async function modificarProducto(id, body, file) {
  const producto = await Product.findByPk(id);
  if (!producto) return null;

  const imagenAnterior = producto.imagen;
  await producto.update(armarDatos(body, file));
  if (file) borrarArchivo(imagenAnterior); // recién con el cambio guardado se borra la foto vieja

  return Product.findByPk(producto.id, incluirCategoria);
}

// Baja o reactivación lógica: solo cambia "activo", el producto no se borra.
// Devuelve null si no existe. Repetir la operación no cambia nada (da el mismo resultado).
async function cambiarEstado(id, activo) {
  const producto = await Product.findByPk(id);
  if (!producto) return null;

  await producto.update({ activo });
  return Product.findByPk(producto.id, incluirCategoria);
}

// Listado para el cliente: solo productos activos, paginado y con filtro opcional por categoría.
async function listarActivos({ page, limit, categoryId }) {
  const where = { activo: true };
  if (categoryId) where.categoryId = categoryId;

  return Product.findAndCountAll({
    where,
    ...incluirCategoria,
    order: [['id', 'ASC']],
    limit,
    offset: (page - 1) * limit,
  });
}

// Detalle para el cliente: devuelve null si no existe o está inactivo.
async function buscarActivo(id) {
  return Product.findOne({ where: { id, activo: true }, ...incluirCategoria });
}

module.exports = { crearProducto, modificarProducto, cambiarEstado, listarActivos, buscarActivo };
