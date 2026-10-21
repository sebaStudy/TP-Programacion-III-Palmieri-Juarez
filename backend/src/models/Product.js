const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  imagen: {
    type: DataTypes.STRING, // ruta del archivo guardado en el servidor
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // baja lógica: en vez de borrar, se pone en false
  },
});

module.exports = Product;
