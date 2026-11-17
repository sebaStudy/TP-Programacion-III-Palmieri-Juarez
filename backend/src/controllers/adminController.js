const { Op } = require('sequelize');
const { Category, Product } = require('../models');
const { crearProducto, modificarProducto, cambiarEstado } = require('../services/productService');
const { listarVentas, VENTAS_POR_PAGINA } = require('../services/saleService');
const { leerPaginacion } = require('../middlewares/validarPaginacion');
const { recolectarErrores, borrarImagenSubida } = require('../middlewares/validarProducto');
const { verificarCredenciales, crearToken, crearAdmin, HORAS_DE_SESION } = require('../services/authService');
const { NOMBRE_COOKIE, identificar } = require('../middlewares/autenticar');
const adminPrueba = require('../config/adminPrueba');

const MENSAJES = {
  creado: 'Producto creado correctamente',
  modificado: 'Producto modificado correctamente',
  desactivado: 'Producto desactivado: ya no se ve en la tienda',
  activado: 'Producto activado: vuelve a verse en la tienda',
  administrador: 'Administrador creado correctamente',
};

const noEncontrado = (res) =>
  res.status(404).render('admin/error', { titulo: 'No encontrado', mensaje: 'El producto no existe.' });

// GET /admin/dashboard: los productos (activos e inactivos) separados por categoría.
// Filtros opcionales por URL: ?q=<texto del nombre>&categoryId=<id>&estado=activos|inactivos
const dashboard = async (req, res) => {
  const filtros = {
    q: String(req.query.q ?? '').trim(),
    categoryId: /^\d+$/.test(req.query.categoryId) ? req.query.categoryId : '', // si no es un número, se ignora
    estado: ['activos', 'inactivos'].includes(req.query.estado) ? req.query.estado : '',
  };

  const dondeProducto = {};
  if (filtros.q) dondeProducto.nombre = { [Op.like]: `%${filtros.q}%` };
  if (filtros.estado === 'activos') dondeProducto.activo = true;
  if (filtros.estado === 'inactivos') dondeProducto.activo = false;

  // Todas las categorías con sus productos ya filtrados por nombre y estado:
  // de acá salen las pestañas (con su cantidad) y las secciones que se muestran.
  const categorias = await Category.findAll({
    include: { model: Product, where: dondeProducto, required: false }, // required: false deja las categorías sin coincidencias
    order: [['id', 'ASC'], [Product, 'nombre', 'ASC']],
  });
  const visibles = filtros.categoryId ? categorias.filter((c) => String(c.id) === filtros.categoryId) : categorias;
  const total = categorias.reduce((suma, c) => suma + c.Products.length, 0);

  // Link de una pestaña: cambia la categoría y conserva el resto de los filtros.
  const urlCategoria = (categoryId) => {
    const params = new URLSearchParams();
    if (filtros.q) params.set('q', filtros.q);
    if (filtros.estado) params.set('estado', filtros.estado);
    if (categoryId) params.set('categoryId', categoryId);
    const consulta = params.toString();
    return consulta ? `/admin/dashboard?${consulta}` : '/admin/dashboard';
  };

  res.render('admin/dashboard', {
    titulo: 'Productos',
    seccion: 'dashboard',
    categorias,
    visibles,
    total,
    urlCategoria,
    filtros,
    hayFiltros: Boolean(filtros.q || filtros.categoryId || filtros.estado),
    mensaje: MENSAJES[req.query.mensaje] || null,
  });
};

// GET /admin/sales?page=N: las ventas con sus productos, de a una página
const ventas = async (req, res) => {
  const { page, limit } = leerPaginacion(req.query, VENTAS_POR_PAGINA);
  const { ventas, totalItems } = await listarVentas({ page, limit });
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));

  res.render('admin/sales', {
    titulo: 'Ventas',
    seccion: 'ventas',
    ventas,
    totalItems,
    page,
    totalPages,
    fecha: (valor) => new Date(valor).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
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

// Muestra la pantalla de login. "acceso" son los datos que completa el botón de acceso rápido.
const mostrarLogin = (res, { email = '', errores = [], status = 200 } = {}) =>
  res.status(status).render('admin/login', { titulo: 'Ingresar', seccion: 'login', email, errores, acceso: adminPrueba });

// GET /admin/login (si ya hay sesión iniciada, va directo al dashboard)
const formularioLogin = (req, res) => {
  if (identificar(req)) return res.redirect('/admin/dashboard');
  mostrarLogin(res);
};

// POST /admin/login: con datos correctos guarda el token en una cookie y va al dashboard; si no, vuelve a mostrar el login con el error.
const login = async (req, res) => {
  const errores = recolectarErrores(req);
  if (errores.length > 0) return mostrarLogin(res, { email: req.body.email, errores, status: 400 });

  const usuario = await verificarCredenciales(req.body.email, req.body.password);
  if (!usuario) {
    const error = { campo: 'general', mensaje: 'Correo o contraseña incorrectos' };
    return mostrarLogin(res, { email: req.body.email, errores: [error], status: 401 });
  }

  res.cookie(NOMBRE_COOKIE, crearToken(usuario), {
    httpOnly: true, // el JavaScript de la página no puede leer esta cookie
    sameSite: 'lax', // no se envía en pedidos que vienen de otros sitios
    secure: process.env.NODE_ENV === 'production',
    maxAge: HORAS_DE_SESION * 60 * 60 * 1000,
  });
  res.redirect('/admin/dashboard');
};

// Muestra el formulario de nuevo administrador. "datos" es lo que se había escrito (la contraseña nunca se vuelve a mostrar).
const mostrarFormularioUsuario = (res, { datos = {}, errores = [], status = 200 } = {}) =>
  res.status(status).render('admin/user-form', { titulo: 'Nuevo administrador', seccion: 'usuario', datos, errores });

// GET /admin/users/new
const formularioUsuario = (req, res) => mostrarFormularioUsuario(res);

// POST /admin/users: si los datos son válidos crea el administrador y vuelve al dashboard; si no, muestra los errores.
const guardarUsuario = async (req, res) => {
  const errores = recolectarErrores(req);
  if (errores.length > 0) return mostrarFormularioUsuario(res, { datos: req.body, errores, status: 400 });

  const usuario = await crearAdmin(req.body);
  if (!usuario) {
    const error = { campo: 'email', mensaje: 'Ya existe un usuario con ese correo' };
    return mostrarFormularioUsuario(res, { datos: req.body, errores: [error], status: 409 });
  }
  res.redirect('/admin/dashboard?mensaje=administrador');
};

// POST /admin/logout: borra la cookie y vuelve al login.
const cerrarSesion = (req, res) => {
  res.clearCookie(NOMBRE_COOKIE);
  res.redirect('/admin/login');
};

module.exports = {
  formularioLogin,
  login,
  cerrarSesion,
  formularioUsuario,
  guardarUsuario,
  dashboard,
  formularioNuevo,
  formularioEditar,
  errorEnFormulario,
  guardarNuevo,
  guardarCambios,
  desactivar,
  activar,
  ventas,
};
