// Lógica de autenticación: la usan el controller de la API (JSON) y el de las pantallas (EJS).
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const HORAS_DE_SESION = 8;

// Lo que se puede mostrar de un usuario: nunca la contraseña, ni siquiera el hash.
function datosPublicos(usuario) {
  return { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
}

// Devuelve el usuario si el correo existe y la contraseña coincide con el hash guardado; si no, null.
async function verificarCredenciales(email, password) {
  const usuario = await User.findOne({ where: { email } });
  if (!usuario) return null;

  const coincide = await bcrypt.compare(password, usuario.password);
  return coincide ? datosPublicos(usuario) : null;
}

// El token queda firmado con JWT_SECRET: si alguien lo modifica, deja de ser válido.
function crearToken(usuario) {
  return jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
    expiresIn: `${HORAS_DE_SESION}h`,
  });
}

// Devuelve los datos del token, o null si está vencido o fue modificado.
function leerToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Crea un administrador guardando solo el hash de la contraseña. Devuelve null si el correo ya existe.
async function crearAdmin({ nombre, email, password }) {
  const existente = await User.findOne({ where: { email } });
  if (existente) return null;

  const usuario = await User.create({ nombre, email, password: await bcrypt.hash(password, 10) });
  return datosPublicos(usuario);
}

module.exports = { HORAS_DE_SESION, verificarCredenciales, crearToken, leerToken, crearAdmin };
