// Nombre del cliente. Se guarda al salir de la bienvenida (llega en la URL: /productos?nombre=...)
// y es obligatorio: sin nombre no se puede ver el catálogo ni el carrito, y se vuelve a la bienvenida.
(() => {
    const nombre = new URLSearchParams(window.location.search).get('nombre');
    if (nombre && nombre.trim()) {
        sessionStorage.setItem('nombreCliente', nombre.trim());
    }

    if (!sessionStorage.getItem('nombreCliente')) {
        window.location.replace('/');
    }
})();
