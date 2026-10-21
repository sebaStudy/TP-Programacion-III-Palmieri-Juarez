// Controller: recibe la petición y arma la respuesta.
const estado = (req, res) => {
  res.json({ ok: true, mensaje: 'API del autoservicio funcionando' });
};

module.exports = { estado };
