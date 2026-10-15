// Conexión a MySQL usando Sequelize (el ORM).
// Los datos salen del archivo .env, así no quedan escritos en el código.
require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false, // no imprime cada consulta SQL en la consola
  }
);

module.exports = sequelize;
