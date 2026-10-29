const { crearProducto, modificarProducto } = require('../services/productService');
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

module.exports = { crear, modificar };
