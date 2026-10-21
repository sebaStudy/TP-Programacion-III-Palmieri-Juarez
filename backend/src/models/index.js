// Junta todos los modelos y define las relaciones entre ellos.
const Category = require('./Category');
const Product = require('./Product');
const User = require('./User');
const Sale = require('./Sale');
const SaleProduct = require('./SaleProduct');

// Una categoría tiene muchos productos; cada producto pertenece a una categoría.
Category.hasMany(Product, { foreignKey: { name: 'categoryId', allowNull: false } });
Product.belongsTo(Category, { foreignKey: { name: 'categoryId', allowNull: false } });

// Muchos a muchos: una venta tiene muchos productos y un producto está en muchas ventas.
// La tabla intermedia SaleProduct guarda además la cantidad y el precio unitario.
Sale.belongsToMany(Product, { through: SaleProduct, foreignKey: 'saleId', otherKey: 'productId' });
Product.belongsToMany(Sale, { through: SaleProduct, foreignKey: 'productId', otherKey: 'saleId' });

module.exports = { Category, Product, User, Sale, SaleProduct };
