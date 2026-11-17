// Carga datos iniciales: categorías, el administrador de prueba, productos y ventas de ejemplo.
// Se ejecuta aparte del servidor con:  npm run seed
// ATENCIÓN: borra y vuelve a crear todas las tablas (se pierden los datos actuales).
require('dotenv').config();
const bcrypt = require('bcrypt');
const adminPrueba = require('./config/adminPrueba');
const sequelize = require('./config/database');
const { Category, Product, User, Sale, SaleProduct } = require('./models');

const instrumentos = [
  { nombre: 'Guitarra criolla clásica', descripcion: 'Guitarra de estudio con tapa de pino y cuerdas de nylon.', precio: 185000, stock: 8, imagen: '/img/productos/guitarra-criolla.jpg' },
  { nombre: 'Guitarra eléctrica semihueca', descripcion: 'Cuerpo semihueco con dos humbuckers, ideal para jazz y blues.', precio: 420000, stock: 5, imagen: '/img/productos/guitarra-electrica.jpg' },
  { nombre: 'Bajo eléctrico 4 cuerdas', descripcion: 'Cuerpo de álamo, mástil de arce y micrófono de bobina doble.', precio: 380000, stock: 4, imagen: '/img/productos/bajo-electrico.jpg' },
  { nombre: 'Teclado electrónico 61 teclas', descripcion: 'Más de 400 sonidos y ritmos, con función de aprendizaje.', precio: 290000, stock: 6, imagen: '/img/productos/teclado-electronico.jpg' },
  { nombre: 'Piano digital 88 teclas', descripcion: 'Teclas con peso y respuesta al toque, incluye pedal.', precio: 950000, stock: 2, imagen: '/img/productos/piano-digital.jpg' },
  { nombre: 'Batería acústica 5 piezas', descripcion: 'Incluye bombo, tom, timbal, redoblante y herrajes.', precio: 1250000, stock: 2, imagen: '/img/productos/bateria-acustica.jpg' },
  { nombre: 'Cajón peruano', descripcion: 'Madera de abedul con bordonas ajustables.', precio: 95000, stock: 12, imagen: '/img/productos/cajon-peruano.jpeg' },
  { nombre: 'Ukelele soprano', descripcion: 'Tamaño compacto, ideal para principiantes.', precio: 68000, stock: 10, imagen: '/img/productos/ukelele.jpg' },
  { nombre: 'Pandereta con parche', descripcion: 'Aro de madera con platillos de metal.', precio: 18000, stock: 15, activo: false, imagen: '/img/productos/pandereta.jpg' },
  { nombre: 'Armónica diatónica en Do', descripcion: 'Diez agujeros, afinación Richter.', precio: 24000, stock: 20, activo: false, imagen: '/img/productos/armonica.jpg' },
  { nombre: 'Guitarra acústica con cutaway', descripcion: 'Tapa de abeto y cuerdas de acero, con ecualizador integrado.', precio: 310000, stock: 6, imagen: '/img/productos/guitarra-acustica.jpeg' },
  { nombre: 'Guitarra eléctrica tipo stratocaster', descripcion: 'Tres micrófonos single coil y puente con vibrato.', precio: 365000, stock: 7, imagen: '/img/productos/guitarra-stratocaster.jpeg' },
  { nombre: 'Bajo eléctrico de 5 cuerdas', descripcion: 'Mástil atornillado y electrónica activa de dos bandas.', precio: 470000, stock: 3, imagen: '/img/productos/bajo-electrico-5-cuerdas.jpeg' },
  { nombre: 'Teclado controlador MIDI 49 teclas', descripcion: 'Con pads y perillas asignables, conexión USB.', precio: 240000, stock: 5, imagen: '/img/productos/teclado-midi.jpeg' },
  { nombre: 'Ukelele concierto', descripcion: 'Cuerpo de caoba con cuerdas de nylon y funda incluida.', precio: 92000, stock: 9, imagen: '/img/productos/ukelele-concierto.jpeg' },
  { nombre: 'Flauta dulce soprano', descripcion: 'Digitación alemana, ideal para estudio.', precio: 12000, stock: 30, imagen: '/img/productos/flauta-dulce.jpeg' },
  { nombre: 'Bongós de madera', descripcion: 'Parches de cuero de 7 y 8 pulgadas con afinación a llave.', precio: 56000, stock: 10, imagen: '/img/productos/bongos.jpeg' },
  { nombre: 'Charango de estudio', descripcion: 'Caja de madera maciza con diez cuerdas dobles.', precio: 135000, stock: 4, imagen: '/img/productos/charango.jpeg' },
];

const accesorios = [
  { nombre: 'Set de cuerdas para guitarra criolla', descripcion: 'Juego completo de nylon, tensión media.', precio: 9500, stock: 40, imagen: '/img/productos/cuerdas-criolla.jpeg' },
  { nombre: 'Set de cuerdas para guitarra eléctrica', descripcion: 'Calibre 009-042, acero niquelado.', precio: 12000, stock: 35, imagen: '/img/productos/cuerdas-electrica.jpeg' },
  { nombre: 'Púas pack x12', descripcion: 'Surtido de espesores fino, medio y grueso.', precio: 4500, stock: 60, imagen: '/img/productos/puas.jpg' },
  { nombre: 'Correa para guitarra', descripcion: 'Tela bordada con terminaciones de cuero.', precio: 15000, stock: 25, imagen: '/img/productos/correa-guitarra.jpeg' },
  { nombre: 'Afinador cromático con clip', descripcion: 'Pantalla a color, sirve para guitarra, bajo y ukelele.', precio: 17000, stock: 30, imagen: '/img/productos/afinador-cromatico.jpeg' },
  { nombre: 'Capodastro de aluminio', descripcion: 'Liviano, para guitarra criolla y eléctrica.', precio: 8000, stock: 28, imagen: '/img/productos/capodastro.jpeg' },
  { nombre: 'Cable para instrumento 3 m', descripcion: 'Plug mono de 6,3 mm con malla antiruido.', precio: 11000, stock: 22, imagen: '/img/productos/cable-instrumento.jpeg' },
  { nombre: 'Baquetas 5A de madera', descripcion: 'Par de baquetas de arce, punta de madera.', precio: 10500, stock: 33, imagen: '/img/productos/baquetas.jpg' },
  { nombre: 'Funda acolchada para guitarra', descripcion: 'Impermeable, con bolsillo frontal y correas de mochila.', precio: 32000, stock: 14, imagen: '/img/productos/funda-guitarra.jpeg' },
  { nombre: 'Soporte plegable para teclado', descripcion: 'Estructura en X, regulable en altura.', precio: 28000, stock: 9, activo: false },
  { nombre: 'Atril plegable para partituras', descripcion: 'De metal, regulable en altura, con bolso de transporte.', precio: 21000, stock: 18, imagen: '/img/productos/atril-partituras.jpeg' },
  { nombre: 'Metrónomo digital', descripcion: 'Pantalla LCD, salida para auriculares y afinador integrado.', precio: 19500, stock: 20, imagen: '/img/productos/metronomo.jpeg' },
  { nombre: 'Soporte de piso para guitarra', descripcion: 'Trípode plegable con protección de espuma.', precio: 16500, stock: 15, imagen: '/img/productos/soporte-guitarra.jpeg' },
  { nombre: 'Pedal de distorsión', descripcion: 'Dos modos de ganancia, carcasa metálica.', precio: 54000, stock: 8, imagen: '/img/productos/pedal-distorsion.jpeg' },
  { nombre: 'Cuerdas para bajo 4 cuerdas', descripcion: 'Acero inoxidable, calibre 045-105.', precio: 23000, stock: 25 },
  { nombre: 'Palillos de percusión con escobillas', descripcion: 'Par de escobillas retráctiles para batería y cajón.', precio: 13500, stock: 22 },
  { nombre: 'Banqueta para teclado', descripcion: 'Regulable en altura, con asiento acolchado.', precio: 38000, stock: 11 },
  { nombre: 'Auriculares de estudio', descripcion: 'Cerrados, con cable desmontable de 3 m.', precio: 42000, stock: 12 },
];

// Ventas de ejemplo. Cada producto va con su cantidad: [nombre del producto, cantidad].
// El precio y el total no se escriben acá: salen de los productos cargados, como cuando se registra una compra.
const ventas = [
  { nombreCliente: 'Julián', fecha: '2026-10-08T15:20:00', items: [['Ukelele soprano', 1], ['Set de cuerdas para guitarra criolla', 1], ['Capodastro de aluminio', 1]] },
  { nombreCliente: 'Valentina', fecha: '2026-10-12T11:15:00', items: [['Guitarra criolla clásica', 1], ['Púas pack x12', 3], ['Set de cuerdas para guitarra criolla', 1]] },
  { nombreCliente: 'Agustina', fecha: '2026-10-15T18:10:00', items: [['Piano digital 88 teclas', 1]] },
  { nombreCliente: 'Martín', fecha: '2026-10-19T17:40:00', items: [['Batería acústica 5 piezas', 1], ['Baquetas 5A de madera', 2]] },
  { nombreCliente: 'Lucía', fecha: '2026-10-24T10:05:00', items: [['Ukelele soprano', 2], ['Afinador cromático con clip', 2]] },
  { nombreCliente: 'Federico', fecha: '2026-10-27T11:45:00', items: [['Guitarra criolla clásica', 1], ['Funda acolchada para guitarra', 1]] },
  { nombreCliente: 'Sofía', fecha: '2026-10-30T19:25:00', items: [['Guitarra eléctrica semihueca', 1], ['Cable para instrumento 3 m', 1], ['Correa para guitarra', 1], ['Set de cuerdas para guitarra eléctrica', 2]] },
  { nombreCliente: 'Florencia', fecha: '2026-11-02T20:05:00', items: [['Teclado electrónico 61 teclas', 1], ['Cable para instrumento 3 m', 1], ['Afinador cromático con clip', 1]] },
  { nombreCliente: 'Tomás', fecha: '2026-11-04T16:50:00', items: [['Cajón peruano', 2]] },
  { nombreCliente: 'Camila', fecha: '2026-11-07T12:30:00', items: [['Bajo eléctrico 4 cuerdas', 1], ['Cable para instrumento 3 m', 2], ['Púas pack x12', 2]] },
  { nombreCliente: 'Nicolás', fecha: '2026-11-08T09:40:00', items: [['Baquetas 5A de madera', 3], ['Púas pack x12', 1], ['Cajón peruano', 1]] },
];

async function seed() {
  await sequelize.sync({ force: true }); // borra y recrea todas las tablas

  const [catInstrumentos, catAccesorios] = await Category.bulkCreate([
    { nombre: 'Instrumentos' },
    { nombre: 'Accesorios' },
  ]);

  await User.create({
    nombre: adminPrueba.nombre,
    email: adminPrueba.email,
    password: await bcrypt.hash(adminPrueba.password, 10), // se guarda el hash, no el texto
  });

  await Product.bulkCreate([
    ...instrumentos.map((p) => ({ ...p, categoryId: catInstrumentos.id })),
    ...accesorios.map((p) => ({ ...p, categoryId: catAccesorios.id })),
  ]);

  const productos = await Product.findAll();
  const productoPorNombre = Object.fromEntries(productos.map((p) => [p.nombre, p]));

  for (const venta of ventas) {
    const items = venta.items.map(([nombre, cantidad]) => ({ producto: productoPorNombre[nombre], cantidad }));
    const total = items.reduce((suma, item) => suma + Number(item.producto.precio) * item.cantidad, 0);

    const sale = await Sale.create({ nombreCliente: venta.nombreCliente, fecha: venta.fecha, total });
    await SaleProduct.bulkCreate(
      items.map((item) => ({
        saleId: sale.id,
        productId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio, // el precio de ese momento
      }))
    );
  }

  const activos = await Product.count({ where: { activo: true } });
  const total = await Product.count();
  console.log(`Seed listo: 2 categorías, 1 administrador, ${total} productos (${activos} activos), ${ventas.length} ventas de ejemplo.`);
}

seed()
  .catch((error) => {
    console.error('Error en el seed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
