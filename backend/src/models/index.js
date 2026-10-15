// Junta todos los modelos y define las relaciones entre ellos.
const Category = require('./Category');
const Product = require('./Product');

// Una categoría tiene muchos productos; cada producto pertenece a una categoría.
Category.hasMany(Product, { foreignKey: { name: 'categoryId', allowNull: false } });
Product.belongsTo(Category, { foreignKey: { name: 'categoryId', allowNull: false } });

module.exports = { Category, Product };
