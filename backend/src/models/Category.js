const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabla de categorías. Para este TP van a ser solo dos: Instrumentos y Accesorios.
const Category = sequelize.define('Category', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Category;
