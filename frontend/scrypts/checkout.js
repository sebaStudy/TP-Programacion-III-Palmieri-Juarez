(() => {
    const botonConfirmarCompra = document.getElementById('boton-confirmar-compra');
    const modalConfirmacion = document.getElementById('modal-confirmacion');
    const formularioConfirmacion = document.getElementById('form-confirmacion');
    const nombreCliente = document.getElementById('nombre-cliente');
    const totalConfirmacion = document.getElementById('total-confirmacion');
    const errorCompra = document.getElementById('error-compra');
    const botonEnviarCompra = document.getElementById('enviar-compra');

    function formatearTotal(valor) {
        return Number(valor).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    }

    botonConfirmarCompra.addEventListener('click', () => {
        const items = window.carrito.leer();
        const total = items.reduce(
            (suma, item) => suma + Number(item.producto.precio) * item.cantidad,
            0
        );
        nombreCliente.value = sessionStorage.getItem('nombreCliente') || '';
        totalConfirmacion.textContent = `Total estimado: ${formatearTotal(total)}`;
        errorCompra.hidden = true;
        modalConfirmacion.showModal();
        nombreCliente.focus();
    });

    document.getElementById('cancelar-compra').addEventListener('click', () => {
        modalConfirmacion.close();
    });

    formularioConfirmacion.addEventListener('submit', async (event) => {
        event.preventDefault();
        errorCompra.hidden = true;
        errorCompra.textContent = '';
        botonEnviarCompra.disabled = true;
        botonEnviarCompra.textContent = 'Procesando...';

        try {
            const items = window.carrito.leer();
            if (items.length === 0) {
                throw new Error('El carrito está vacío.');
            }

            const respuesta = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombreCliente: nombreCliente.value.trim(),
                    productos: items.map((item) => ({
                        productId: item.producto.id,
                        cantidad: item.cantidad,
                    })),
                }),
            });
            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(resultado.error || 'No se pudo confirmar la compra.');
            }
            sessionStorage.setItem('ticketActual', JSON.stringify(resultado.data));
            sessionStorage.setItem('nombreCliente', resultado.data.nombreCliente);
            window.carrito.limpiar();
            window.location.assign('/ticket');
        } catch (error) {
            console.error('Error al confirmar la compra:', error);
            errorCompra.textContent = error.message || 'No se pudo confirmar la compra. Intenta nuevamente.';
            errorCompra.hidden = false;
        } finally {
            botonEnviarCompra.disabled = false;
            botonEnviarCompra.textContent = 'Confirmar y comprar';
        }
    });
})();
