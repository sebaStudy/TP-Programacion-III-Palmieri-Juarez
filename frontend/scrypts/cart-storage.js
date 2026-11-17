window.carrito = (() => {
    const CLAVE_CARRITO = 'carrito';

    function leer() {
        const contenido = localStorage.getItem(CLAVE_CARRITO);
        if (contenido === null) {
            return [];
        }

        const items = JSON.parse(contenido);
        if (!Array.isArray(items) || items.some((item) => (
            !item
            || !item.producto
            || item.producto.id === undefined
            || !Number.isSafeInteger(item.cantidad)
            || item.cantidad < 1
        ))) {
            throw new Error('El contenido guardado del carrito no es válido.');
        }

        return items;
    }

    function guardar(items) {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
    }

    function agregar(producto) {
        const items = leer();
        const item = items.find((actual) => String(actual.producto.id) === String(producto.id));
        const stock = Number(producto.stock);

        if (!Number.isSafeInteger(stock) || stock < 1 || (item && item.cantidad >= stock)) {
            return 'sin-stock';
        }

        if (item) {
            item.cantidad += 1;
        } else {
            items.push({ producto, cantidad: 1 });
        }

        guardar(items);
        return 'agregado';
    }

    function cambiarCantidad(id, cambio) {
        const items = leer();
        const indice = items.findIndex((item) => String(item.producto.id) === String(id));
        if (indice === -1) {
            return 'no-encontrado';
        }

        const item = items[indice];
        const nuevaCantidad = item.cantidad + cambio;
        const stock = Number(item.producto.stock);
        if (cambio > 0 && (!Number.isSafeInteger(stock) || nuevaCantidad > stock)) {
            return 'limite-stock';
        }

        if (nuevaCantidad < 1) {
            items.splice(indice, 1);
        } else {
            item.cantidad = nuevaCantidad;
        }

        guardar(items);
        return 'actualizado';
    }

    function quitar(id) {
        const items = leer().filter((item) => String(item.producto.id) !== String(id));
        guardar(items);
    }

    function limpiar() {
        localStorage.removeItem(CLAVE_CARRITO);
    }

    return Object.freeze({ leer, agregar, cambiarCantidad, quitar, limpiar });
})();
