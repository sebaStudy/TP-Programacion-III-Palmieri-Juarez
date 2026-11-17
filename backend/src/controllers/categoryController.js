const { Category } = require('../models');

// GET /api/categories
const listar = async (req, res) => {
  const categorias = await Category.findAll({ attributes: ['id', 'nombre'], order: [['id', 'ASC']] });
  res.json(categorias);
};

module.exports = { listar };
