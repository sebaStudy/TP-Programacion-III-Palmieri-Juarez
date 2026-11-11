/* productos */
const listado = document.getElementById('listado-productos');
const estadoCarga = document.getElementById('estado-carga');
const LOGO = '/assets/img/logo.svg';
/* productos */
function crearProducto(producto) {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';

    const cabecera = document.createElement('div');
    cabecera.className = 'tarjeta-cabecera';

    const imagen = document.createElement('img');
    const rutaImagen = producto.imagen;
    if (typeof rutaImagen === 'string' && /^\/(?:img|uploads)\//.test(rutaImagen)) {
        imagen.className = 'foto';
        imagen.src = rutaImagen;
        imagen.alt = producto.nombre;
        imagen.addEventListener('error', () => {
            imagen.src = LOGO;
            imagen.alt = 'Producto sin imagen';
            imagen.className = 'sin-foto';
        }, { once: true });
    } else {
        imagen.className = 'sin-foto';
        imagen.src = LOGO;
        imagen.alt = 'Producto sin imagen';
    }

    const informacion = document.createElement('div');
    informacion.className = 'tarjeta-info';

    const nombre = document.createElement('h3');
    nombre.textContent = producto.nombre;

    const precio = document.createElement('p');
    precio.className = 'precio';
    precio.textContent = Number(producto.precio).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });

    informacion.append(nombre, precio);
    cabecera.append(imagen);

    const cuerpo = document.createElement('div');
    cuerpo.className = 'tarjeta-cuerpo';

    if (producto.descripcion) {
        const descripcion = document.createElement('p');
        descripcion.className = 'descripcion';
        descripcion.textContent = producto.descripcion;
        cuerpo.append(descripcion);
    }

    /* stock */
    const stock = document.createElement('p');
    stock.className = 'fila';
    const etiquetaStock = document.createElement('span');
    etiquetaStock.textContent = 'Stock';
    const cantidadStock = document.createElement('span');
    cantidadStock.textContent = `${producto.stock} u.`;
    stock.append(etiquetaStock, cantidadStock);
    cuerpo.append(stock);

    /* boton */
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton boton-chico';
    boton.textContent = 'Agregar al carrito';
    cuerpo.append(boton);

    tarjeta.append(cabecera, informacion, cuerpo);
    return tarjeta;
}

function mostrarProductos(productos) {
    const categorias = new Map();
    for (const producto of productos) {
        const categoria = producto.category;
        if (!categoria) {
            throw new Error('Un producto no tiene una categoría asociada.');
        }

        if (!categorias.has(categoria.id)) {
            categorias.set(categoria.id, { nombre: categoria.nombre, productos: [] });
        }
        categorias.get(categoria.id).productos.push(producto);
    }

    listado.replaceChildren();
    for (const [id, categoria] of categorias) {
        const seccion = document.createElement('section');
        seccion.className = 'categoria';

        const titulo = document.createElement('h2');
        titulo.textContent = categoria.nombre;

        const contador = document.createElement('span');
        contador.className = 'contador';
        contador.textContent = String(categoria.productos.length);
        titulo.append(' ', contador);

        const grilla = document.createElement('div');
        grilla.className = 'grilla';
        for (const producto of categoria.productos) {
            grilla.append(crearProducto(producto));
        }

        seccion.setAttribute('aria-labelledby', `categoria-${id}`);
        titulo.id = `categoria-${id}`;
        seccion.append(titulo, grilla);
        listado.append(seccion);
    }
}

async function cargarProductos() {
    try {
        const productos = [];
        let pagina = 1;
        let totalPaginas = 1;

        do {
            const respuesta = await fetch(`/api/products?page=${pagina}&limit=50`);
            if (!respuesta.ok) {
                throw new Error(`No se pudieron cargar los productos (HTTP ${respuesta.status}).`);
            }

            const resultado = await respuesta.json();
            if (!Array.isArray(resultado.data)
                || !resultado.pagination
                || !Number.isInteger(resultado.pagination.totalPages)
                || resultado.pagination.totalPages < 0) {
                throw new Error('El servidor devolvió una respuesta de productos inválida.');
            }

            productos.push(...resultado.data);
            totalPaginas = resultado.pagination.totalPages;
            pagina += 1;
        } while (pagina <= totalPaginas);

        mostrarProductos(productos);
        estadoCarga.textContent = productos.length
            ? ''
            : 'No hay productos disponibles en este momento.';
    } catch (error) {
        console.error('Error al cargar productos:', error);
        estadoCarga.textContent = 'No se pudieron cargar los productos. Intenta nuevamente más tarde.';
        estadoCarga.classList.add('alerta');
    }
}

cargarProductos();
