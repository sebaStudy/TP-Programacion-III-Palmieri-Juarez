/* productos */
const listado = document.getElementById('listado-productos');
const estadoCarga = document.getElementById('estado-carga');
const botonesCategoria = document.querySelectorAll('[data-categoria]');
const formularioFiltros = document.getElementById('filtros-productos');
const campoBusqueda = document.getElementById('q');
const campoCategoria = document.getElementById('categoria-busqueda');
const LOGO = '/assets/img/logo.svg';
const PRODUCTOS_POR_PAGINA = 12;

let productosCargados = null;
let categoriaSeleccionada = obtenerCategoriaDeRuta();
let busquedaSeleccionada = obtenerBusquedaDeRuta();
let paginaSeleccionada = obtenerPaginaDeRuta();

function obtenerCategoriaDeRuta() {
    const categoria = new URLSearchParams(window.location.search).get('categoria');
    return categoria === 'Accesorios' ? categoria : 'Instrumentos';
}

function obtenerBusquedaDeRuta() {
    return new URLSearchParams(window.location.search).get('q')?.trim() || '';
}

function obtenerPaginaDeRuta() {
    const coincidencia = window.location.pathname.match(/^\/productos\/(\d+)\/?$/);
    const pagina = coincidencia ? Number(coincidencia[1]) : 1;
    const paginaValida = Number.isSafeInteger(pagina) && pagina > 0 ? pagina : 1;
    if (coincidencia && window.location.pathname !== `/productos/${paginaValida}`) {
        actualizarRuta(paginaValida);
    }
    return paginaValida;
}

function actualizarRuta(pagina) {
    const parametros = new URLSearchParams({ categoria: categoriaSeleccionada });
    if (busquedaSeleccionada) {
        parametros.set('q', busquedaSeleccionada);
    }
    const ruta = `/productos/${pagina}?${parametros}`;
    window.history.replaceState(null, '', ruta);
}

campoBusqueda.value = busquedaSeleccionada;
campoCategoria.value = categoriaSeleccionada;

formularioFiltros.addEventListener('submit', (evento) => {
    evento.preventDefault();
    busquedaSeleccionada = campoBusqueda.value.trim();
    paginaSeleccionada = 1;
    campoCategoria.value = categoriaSeleccionada;
    actualizarRuta(paginaSeleccionada);
    if (productosCargados !== null) {
        mostrarProductos(productosCargados);
    }
});

botonesCategoria.forEach((boton) => {
    const seleccionado = boton.dataset.categoria === categoriaSeleccionada;
    boton.classList.toggle('activo', seleccionado);
    boton.setAttribute('aria-pressed', String(seleccionado));
});

botonesCategoria.forEach((boton) => {
    boton.addEventListener('click', () => {
        categoriaSeleccionada = boton.dataset.categoria;
        paginaSeleccionada = 1;
        campoCategoria.value = categoriaSeleccionada;
        actualizarRuta(paginaSeleccionada);
        botonesCategoria.forEach((otroBoton) => {
            const seleccionado = otroBoton === boton;
            otroBoton.classList.toggle('activo', seleccionado);
            otroBoton.setAttribute('aria-pressed', String(seleccionado));
        });
        if (productosCargados !== null) {
            mostrarProductos(productosCargados);
        }
    });
});

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
    boton.disabled = Number(producto.stock) <= 0;
    boton.addEventListener('click', () => {
        try {
            const resultado = window.carrito.agregar(producto);
            if (resultado === 'sin-stock') {
                estadoCarga.textContent = 'No hay más unidades disponibles de este producto.';
                estadoCarga.className = 'alerta';
                return;
            }

            estadoCarga.textContent = `${producto.nombre} se agregó al carrito.`;
            estadoCarga.className = 'aviso';
        } catch (error) {
            console.error('Error al agregar el producto al carrito:', error);
            estadoCarga.textContent = 'No se pudo actualizar el carrito. Intenta nuevamente.';
            estadoCarga.className = 'alerta';
        }
    });
    cuerpo.append(boton);

    tarjeta.append(cabecera, informacion, cuerpo);
    return tarjeta;
}

function mostrarProductos(productos) {
    const productosFiltrados = productos.filter((producto) => {
        if (!producto.category) {
            throw new Error('Un producto no tiene una categoría asociada.');
        }

        const coincideCategoria = producto.category.nombre === categoriaSeleccionada;
        const coincideNombre = producto.nombre.toLocaleLowerCase('es-AR')
            .includes(busquedaSeleccionada.toLocaleLowerCase('es-AR'));
        return coincideCategoria && coincideNombre;
    });

    listado.replaceChildren();
    const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);
    if (productosFiltrados.length === 0) {
        estadoCarga.textContent = busquedaSeleccionada
            ? 'No se encontraron productos con ese nombre en esta categoría.'
            : productos.length
            ? 'No hay productos disponibles en esta categoría.'
            : 'No hay productos disponibles en este momento.';
        return;
    }

    if (paginaSeleccionada > totalPaginas) {
        estadoCarga.textContent = 'No hay productos disponibles en esta página.';
        return;
    }

    estadoCarga.textContent = '';
    const grilla = document.createElement('div');
    grilla.className = 'grilla';
    const inicio = (paginaSeleccionada - 1) * PRODUCTOS_POR_PAGINA;
    const productosPagina = productosFiltrados.slice(inicio, inicio + PRODUCTOS_POR_PAGINA);
    for (const producto of productosPagina) {
        grilla.append(crearProducto(producto));
    }
    listado.append(grilla);
    listado.append(crearPaginacion(totalPaginas));
}

function crearPaginacion(totalPaginas) {
    const navegacion = document.createElement('nav');
    navegacion.className = 'paginacion';
    navegacion.setAttribute('aria-label', 'Páginas de productos');

    for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
        const enlace = document.createElement('a');
        enlace.className = 'boton-pagina';
        const parametros = new URLSearchParams({ categoria: categoriaSeleccionada });
        if (busquedaSeleccionada) {
            parametros.set('q', busquedaSeleccionada);
        }
        enlace.href = `/productos/${pagina}?${parametros}`;
        enlace.textContent = String(pagina);
        if (pagina === paginaSeleccionada) {
            enlace.classList.add('activo');
            enlace.setAttribute('aria-current', 'page');
        }
        navegacion.append(enlace);
    }

    return navegacion;
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

        productosCargados = productos;
        if (window.location.pathname === '/productos') {
            actualizarRuta(paginaSeleccionada);
        }
        mostrarProductos(productosCargados);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        estadoCarga.textContent = 'No se pudieron cargar los productos. Intenta nuevamente más tarde.';
        estadoCarga.classList.add('alerta');
    }
}

cargarProductos();
