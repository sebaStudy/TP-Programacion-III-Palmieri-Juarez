// Carga datos iniciales: categorías, el administrador de prueba y productos.
// Se ejecuta aparte del servidor con:  npm run seed
// ATENCIÓN: borra y vuelve a crear todas las tablas (se pierden los datos actuales).
require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const { Category, Product, User } = require('./models');

const instrumentos = [
  { nombre: 'Guitarra criolla clásica', descripcion: 'Guitarra de estudio con tapa de pino y cuerdas de nylon.', precio: 185000, stock: 8 },
  { nombre: 'Guitarra eléctrica tipo Stratocaster', descripcion: 'Tres micrófonos single coil, ideal para rock y blues.', precio: 420000, stock: 5 },
  { nombre: 'Bajo eléctrico 4 cuerdas', descripcion: 'Cuerpo de álamo, mástil de arce y micrófono de bobina doble.', precio: 380000, stock: 4 },
  { nombre: 'Teclado electrónico 61 teclas', descripcion: 'Más de 400 sonidos y ritmos, con función de aprendizaje.', precio: 290000, stock: 6 },
  { nombre: 'Piano digital 88 teclas', descripcion: 'Teclas con peso y respuesta al toque, incluye pedal.', precio: 950000, stock: 2 },
  { nombre: 'Batería acústica 5 piezas', descripcion: 'Incluye bombo, tom, timbal, redoblante y herrajes.', precio: 1250000, stock: 2 },
  { nombre: 'Cajón peruano', descripcion: 'Madera de abedul con bordonas ajustables.', precio: 95000, stock: 12 },
  { nombre: 'Ukelele soprano', descripcion: 'Tamaño compacto, ideal para principiantes.', precio: 68000, stock: 10 },
  { nombre: 'Pandereta con parche', descripcion: 'Aro de madera con platillos de metal.', precio: 18000, stock: 15, activo: false },
  { nombre: 'Armónica diatónica en Do', descripcion: 'Diez agujeros, afinación Richter.', precio: 24000, stock: 20, activo: false },
];

const accesorios = [
  { nombre: 'Set de cuerdas para guitarra criolla', descripcion: 'Juego completo de nylon, tensión media.', precio: 9500, stock: 40 },
  { nombre: 'Set de cuerdas para guitarra eléctrica', descripcion: 'Calibre 009-042, acero niquelado.', precio: 12000, stock: 35 },
  { nombre: 'Púas pack x12', descripcion: 'Surtido de espesores fino, medio y grueso.', precio: 4500, stock: 60 },
  { nombre: 'Correa para guitarra', descripcion: 'Tela bordada con terminaciones de cuero.', precio: 15000, stock: 25 },
  { nombre: 'Afinador cromático con clip', descripcion: 'Pantalla a color, sirve para guitarra, bajo y ukelele.', precio: 17000, stock: 30 },
  { nombre: 'Capodastro de aluminio', descripcion: 'Liviano, para guitarra criolla y eléctrica.', precio: 8000, stock: 28 },
  { nombre: 'Cable para instrumento 3 m', descripcion: 'Plug mono de 6,3 mm con malla antiruido.', precio: 11000, stock: 22 },
  { nombre: 'Baquetas 5A de madera', descripcion: 'Par de baquetas de arce, punta de madera.', precio: 10500, stock: 33 },
  { nombre: 'Funda acolchada para guitarra', descripcion: 'Impermeable, con bolsillo frontal y correas de mochila.', precio: 32000, stock: 14 },
  { nombre: 'Soporte plegable para teclado', descripcion: 'Estructura en X, regulable en altura.', precio: 28000, stock: 9, activo: false },
];

async function seed() {
  await sequelize.sync({ force: true }); // borra y recrea todas las tablas

  const [catInstrumentos, catAccesorios] = await Category.bulkCreate([
    { nombre: 'Instrumentos' },
    { nombre: 'Accesorios' },
  ]);

  await User.create({
    nombre: 'Administrador',
    email: 'admin@autoservicio.com',
    password: await bcrypt.hash('admin1234', 10), // se guarda el hash, no el texto
  });

  await Product.bulkCreate([
    ...instrumentos.map((p) => ({ ...p, categoryId: catInstrumentos.id })),
    ...accesorios.map((p) => ({ ...p, categoryId: catAccesorios.id })),
  ]);

  const activos = await Product.count({ where: { activo: true } });
  const total = await Product.count();
  console.log(`Seed listo: 2 categorías, 1 administrador, ${total} productos (${activos} activos).`);
}

seed()
  .catch((error) => {
    console.error('Error en el seed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
