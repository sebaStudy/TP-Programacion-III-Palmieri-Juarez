// Protege las rutas de administrador.
// El token puede llegar de dos formas, y las dos se verifican igual:
//   - en el encabezado  Authorization: Bearer <token>   (lo usa la API)
//   - en la cookie "token"                               (la guarda el login de las pantallas)
const { leerToken } = require('../services/authService');

const NOMBRE_COOKIE = 'token';

// Devuelve los datos del administrador si hay un token válido; si no, null.
function identificar(req) {
  const encabezado = req.headers.authorization || '';
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7) : req.cookies[NOMBRE_COOKIE];
  return token ? leerToken(token) : null;
}

// Para la API: sin token válido responde 401 en JSON.
function requerirAdmin(req, res, next) {
  const usuario = identificar(req);
  if (!usuario) return res.status(401).json({ error: 'Falta el token o no es válido' });
  req.usuario = usuario;
  next();
}

// Para las pantallas: sin token válido lleva al login.
function requerirAdminPanel(req, res, next) {
  const usuario = identificar(req);
  if (!usuario) return res.redirect('/admin/login');
  req.usuario = usuario;
  next();
}

// Para GET /products: ver los productos inactivos solo se permite a los administradores.
function adminSiPideInactivos(req, res, next) {
  if (req.query.incluirInactivos === 'true') return requerirAdmin(req, res, next);
  next();
}

module.exports = { NOMBRE_COOKIE, identificar, requerirAdmin, requerirAdminPanel, adminSiPideInactivos };
