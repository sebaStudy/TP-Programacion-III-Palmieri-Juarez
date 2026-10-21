const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Una venta realizada en el autoservicio.
// nombreCliente es el nombre que el cliente escribió en la pantalla de bienvenida.
const Sale = sequelize.define('Sale', {
  nombreCliente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false, // lo calcula el servidor, no el frontend
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Sale;
