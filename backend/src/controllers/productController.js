const {
  crearProducto,
  modificarProducto,
  cambiarEstado,
  listarActivos,
  buscarActivo,
} = require('../services/productService');
const { borrarImagenSubida } = require('../middlewares/validarProducto');

// Arma el JSON del contrato: precio como número y la categoría en "category".
function formatear(p) {
  return {
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precio: Number(p.precio),
    stock: p.stock,
    imagen: p.imagen,
    activo: p.activo,
    categoryId: p.categoryId,
    category: p.Category,
  };
}

// GET /api/products (solo productos activos, paginados)
// TODO(login): con el token de administrador, aceptar incluirInactivos=true.
const listar = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;
  const { count, rows } = await listarActivos({ page, limit, categoryId: req.query.categoryId });

  res.json({
    data: rows.map(formatear),
    pagination: { page, limit, totalItems: count, totalPages: Math.ceil(count / limit) },
  });
};

// GET /api/products/:id (404 si no existe o está inactivo)
const obtener = async (req, res) => {
  const producto = await buscarActivo(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(formatear(producto));
};

// POST /api/products
const crear = async (req, res) => {
  try {
    const producto = await crearProducto(req.body, req.file);
    res.status(201).json(formatear(producto));
  } catch (error) {
    borrarImagenSubida(req); // si algo falló, no dejamos la foto huérfana
    throw error;
  }
};

// PUT /api/products/:id
const modificar = async (req, res) => {
  try {
    const producto = await modificarProducto(req.params.id, req.body, req.file);
    if (!producto) {
      borrarImagenSubida(req);
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(formatear(producto));
  } catch (error) {
    borrarImagenSubida(req);
    throw error;
  }
};

// Arma el handler que deja el producto activo o inactivo y responde con el contrato.
const responderEstado = (activo, mensaje) => async (req, res) => {
  const producto = await cambiarEstado(req.params.id, activo);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ mensaje, producto: formatear(producto) });
};

// DELETE /api/products/:id (baja lógica)
const desactivar = responderEstado(false, 'Producto desactivado');

// PATCH /api/products/:id/activar
const activar = responderEstado(true, 'Producto activado');

module.exports = { listar, obtener, crear, modificar, desactivar, activar };
