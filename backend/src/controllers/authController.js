const { verificarCredenciales, crearToken, crearAdmin } = require('../services/authService');

// POST /api/auth/login
const login = async (req, res) => {
  const usuario = await verificarCredenciales(req.body.email, req.body.password);
  // El mismo mensaje para correo y contraseña incorrectos: no se aclara cuál de los dos falló.
  if (!usuario) return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

  res.json({ token: crearToken(usuario), usuario });
};

// POST /api/users (solo administradores)
const crearUsuario = async (req, res) => {
  const usuario = await crearAdmin(req.body);
  if (!usuario) return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });

  res.status(201).json(usuario);
};

module.exports = { login, crearUsuario };
