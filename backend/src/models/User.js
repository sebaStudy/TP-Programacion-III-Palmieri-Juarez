const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Usuario administrador del back office.
// Los clientes NO son User: de ellos solo se guarda el nombre dentro de la venta.
const User = sequelize.define('User', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING, // acá se guarda el HASH de bcrypt, nunca la contraseña en texto
    allowNull: false,
  },
});

module.exports = User;
