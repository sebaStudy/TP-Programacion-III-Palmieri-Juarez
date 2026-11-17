const listadoCarrito = document.getElementById('listado-productos');
const estadoCarrito = document.getElementById('estado-carga');
const totalCarrito = document.getElementById('total-carrito');
const botonConfirmarCompra = document.getElementById('boton-confirmar-compra');
const LOGO_CARRITO = '/assets/img/logo.svg';

function formatearPrecio(valor) {
    return Number(valor).toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function crearTarjetaCarrito(item) {
    const { producto, cantidad } = item;
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta tarjeta-carrito';

    const cabecera = document.createElement('div');
    cabecera.className = 'tarjeta-cabecera';

    const imagen = document.createElement('img');
    if (typeof producto.imagen === 'string' && /^\/(?:img|uploads)\//.test(producto.imagen)) {
        imagen.className = 'foto';
        imagen.src = producto.imagen;
        imagen.alt = producto.nombre;
        imagen.addEventListener('error', () => {
            imagen.src = LOGO_CARRITO;
            imagen.alt = 'Producto sin imagen';
            imagen.className = 'sin-foto';
        }, { once: true });
    } else {
        imagen.className = 'sin-foto';
        imagen.src = LOGO_CARRITO;
        imagen.alt = 'Producto sin imagen';
    }
    cabecera.append(imagen);

    const informacion = document.createElement('div');
    informacion.className = 'tarjeta-info';
    const nombre = document.createElement('h2');
    nombre.className = 'carrito-nombre';
    nombre.textContent = producto.nombre;

    const quitar = document.createElement('button');
    quitar.type = 'button';
    quitar.className = 'boton-eliminar-carrito';
    quitar.setAttribute('aria-label', `Quitar ${producto.nombre} del carrito`);
    quitar.title = 'Quitar producto';
    const iconoCarrito = document.createElement('img');
    iconoCarrito.src = '/assets/img/carrito.png';
    iconoCarrito.alt = '';
    quitar.append(iconoCarrito);
    quitar.addEventListener('click', () => actualizarCarrito(() => window.carrito.quitar(producto.id)));
    informacion.append(nombre, quitar);

    const cuerpo = document.createElement('div');
    cuerpo.className = 'tarjeta-cuerpo';
    const subtotal = document.createElement('p');
    subtotal.className = 'subtotal-carrito';
    subtotal.textContent = `Subtotal: ${formatearPrecio(Number(producto.precio) * cantidad)}`;

    const acciones = document.createElement('div');
    acciones.className = 'controles-cantidad';
    const disminuir = document.createElement('button');
    disminuir.type = 'button';
    disminuir.className = 'boton-cantidad';
    disminuir.textContent = '−';
    disminuir.setAttribute('aria-label', `Disminuir cantidad de ${producto.nombre}`);
    disminuir.addEventListener('click', () => actualizarCarrito(
        () => window.carrito.cambiarCantidad(producto.id, -1)
    ));

    const cantidadActual = document.createElement('span');
    cantidadActual.className = 'cantidad-carrito';
    cantidadActual.textContent = String(cantidad);
    cantidadActual.setAttribute('aria-label', `Cantidad: ${cantidad}`);

    const aumentar = document.createElement('button');
    aumentar.type = 'button';
    aumentar.className = 'boton-cantidad';
    aumentar.textContent = '+';
    aumentar.setAttribute('aria-label', `Aumentar cantidad de ${producto.nombre}`);
    aumentar.disabled = cantidad >= Number(producto.stock);
    aumentar.addEventListener('click', () => actualizarCarrito(
        () => window.carrito.cambiarCantidad(producto.id, 1)
    ));

    acciones.append(disminuir, cantidadActual, aumentar);
    cuerpo.append(subtotal, acciones);
    tarjeta.append(cabecera, informacion, cuerpo);
    return tarjeta;
}

function mostrarCarrito() {
    try {
        const items = window.carrito.leer();
        listadoCarrito.replaceChildren();

        if (items.length === 0) {
            estadoCarrito.textContent = 'Tu carrito está vacío.';
            estadoCarrito.className = 'vacio';
            totalCarrito.textContent = '';
            totalCarrito.hidden = true;
            botonConfirmarCompra.hidden = true;
            return;
        }

        estadoCarrito.textContent = '';
        botonConfirmarCompra.hidden = false;
        const grilla = document.createElement('div');
        grilla.className = 'grilla';
        let total = 0;
        for (const item of items) {
            grilla.append(crearTarjetaCarrito(item));
            total += Number(item.producto.precio) * item.cantidad;
        }
        listadoCarrito.append(grilla);
        totalCarrito.textContent = `Total del carrito: ${formatearPrecio(total)}`;
        totalCarrito.hidden = false;
    } catch (error) {
        console.error('Error al cargar el carrito:', error);
        estadoCarrito.textContent = 'No se pudo cargar el carrito. Intenta nuevamente.';
        estadoCarrito.className = 'alerta';
        totalCarrito.textContent = '';
        totalCarrito.hidden = true;
    }
}

function actualizarCarrito(actualizar) {
    try {
        const resultado = actualizar();
        if (resultado === 'limite-stock') {
            estadoCarrito.textContent = 'No hay más unidades disponibles de este producto.';
            estadoCarrito.className = 'alerta';
            return;
        }
        mostrarCarrito();
    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        estadoCarrito.textContent = 'No se pudo actualizar el carrito. Intenta nuevamente.';
        estadoCarrito.className = 'alerta';
    }
}

mostrarCarrito();
