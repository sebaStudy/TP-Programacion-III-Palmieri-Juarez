const { Category, Product } = require('../models');
const { crearProducto, modificarProducto, cambiarEstado } = require('../services/productService');
const { recolectarErrores, borrarImagenSubida } = require('../middlewares/validarProducto');

const MENSAJES = {
  creado: 'Producto creado correctamente',
  modificado: 'Producto modificado correctamente',
  desactivado: 'Producto desactivado: ya no se ve en la tienda',
  activado: 'Producto activado: vuelve a verse en la tienda',
};

const noEncontrado = (res) =>
  res.status(404).render('admin/error', { titulo: 'No encontrado', mensaje: 'El producto no existe.' });

// GET /admin/dashboard: todos los productos (activos e inactivos) separados por categoría
const dashboard = async (req, res) => {
  const categorias = await Category.findAll({
    include: Product,
    order: [['id', 'ASC'], [Product, 'nombre', 'ASC']],
  });
  res.render('admin/dashboard', {
    titulo: 'Productos',
    seccion: 'dashboard',
    categorias,
    mensaje: MENSAJES[req.query.mensaje] || null,
  });
};

// Muestra el formulario (el mismo para alta y edición).
// "datos" son los valores de los campos: los del producto, pisados por lo que escribió el usuario.
async function mostrarFormulario(res, { producto = null, valores = {}, errores = [], status = 200 }) {
  const categorias = await Category.findAll({ order: [['id', 'ASC']] });
  const datos = { ...(producto ? producto.toJSON() : {}), ...valores };
  res.status(status).render('admin/product-form', {
    titulo: producto ? 'Editar producto' : 'Agregar producto',
    seccion: producto ? 'dashboard' : 'nuevo',
    producto,
    datos,
    categorias,
    errores,
  });
}

// GET /admin/products/new
const formularioNuevo = (req, res) => mostrarFormulario(res, {});

// GET /admin/products/:id/edit
const formularioEditar = async (req, res) => {
  const producto = await Product.findByPk(req.params.id);
  if (!producto) return noEncontrado(res);
  mostrarFormulario(res, { producto });
};

// Cierre de la cadena de validación de los formularios:
// si hay errores, vuelve a mostrar el formulario con los mensajes y lo que se había escrito.
const errorEnFormulario = async (req, res, next) => {
  const errores = recolectarErrores(req);
  if (errores.length === 0) return next();

  borrarImagenSubida(req);
  const producto = req.params.id ? await Product.findByPk(req.params.id) : null;
  if (req.params.id && !producto) return noEncontrado(res);
  mostrarFormulario(res, { producto, valores: req.body, errores, status: 400 });
};

// POST /admin/products
const guardarNuevo = async (req, res) => {
  try {
    await crearProducto(req.body, req.file);
  } catch (error) {
    borrarImagenSubida(req);
    throw error;
  }
  res.redirect('/admin/dashboard?mensaje=creado');
};

// POST /admin/products/:id
const guardarCambios = async (req, res) => {
  let producto;
  try {
    producto = await modificarProducto(req.params.id, req.body, req.file);
  } catch (error) {
    borrarImagenSubida(req);
    throw error;
  }
  if (!producto) {
    borrarImagenSubida(req);
    return noEncontrado(res);
  }
  res.redirect('/admin/dashboard?mensaje=modificado');
};

// Arma el handler que deja el producto activo o inactivo y vuelve al dashboard con un aviso.
const responderEstado = (activo, mensaje) => async (req, res) => {
  const producto = await cambiarEstado(req.params.id, activo);
  if (!producto) return noEncontrado(res);
  res.redirect(`/admin/dashboard?mensaje=${mensaje}`);
};

// POST /admin/products/:id/desactivar
const desactivar = responderEstado(false, 'desactivado');

// POST /admin/products/:id/activar
const activar = responderEstado(true, 'activado');

module.exports = {
  dashboard,
  formularioNuevo,
  formularioEditar,
  errorEnFormulario,
  guardarNuevo,
  guardarCambios,
  desactivar,
  activar,
};
