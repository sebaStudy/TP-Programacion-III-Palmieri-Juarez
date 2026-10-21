const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Tabla intermedia de la relación muchos a muchos entre Sale y Product.
// Cada fila es "esta venta incluyó este producto, tantas unidades, a este precio".
// Las columnas saleId y productId las agrega Sequelize al definir la relación (models/index.js).
const SaleProduct = sequelize.define('SaleProduct', {
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  precioUnitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false, // precio del producto AL MOMENTO de la venta
  },
});

module.exports = SaleProduct;
