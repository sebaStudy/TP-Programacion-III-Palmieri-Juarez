const datosTicket = JSON.parse(sessionStorage.getItem('ticketActual') || 'null');
const datos = document.getElementById('datos-ticket');
const estado = document.getElementById('estado-ticket');
const formatoPrecio = (valor) => Number(valor).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2,
});

if (datosTicket && Array.isArray(datosTicket.productos)) {
    document.getElementById('empresa-ticket').textContent = datosTicket.empresa;
    document.getElementById('cliente-ticket').textContent = datosTicket.nombreCliente;
    document.getElementById('fecha-ticket').textContent = new Date(datosTicket.fecha).toLocaleString('es-AR');

    const filas = document.getElementById('productos-ticket');
    datosTicket.productos.forEach((producto) => {
        const fila = document.createElement('tr');
        [
            producto.nombre,
            producto.cantidad,
            formatoPrecio(producto.precioUnitario),
            formatoPrecio(producto.subtotal),
        ].forEach((valor) => {
            const celda = document.createElement('td');
            celda.textContent = valor;
            fila.append(celda);
        });
        filas.append(fila);
    });

    document.getElementById('total-ticket').textContent = formatoPrecio(datosTicket.total);
    datos.hidden = false;
    document.getElementById('acciones-ticket').hidden = false;
} else {
    estado.textContent = 'No hay un ticket para mostrar.';
}

document.getElementById('boton-descargar-ticket').addEventListener('click', async (event) => {
    const boton = event.currentTarget;
    try {
        if (!datosTicket) {
            throw new Error('No se pudo generar el PDF del ticket.');
        }

        boton.disabled = true;
        boton.textContent = 'Generando PDF...';
        const respuesta = await fetch('/api/sales/pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosTicket),
        });
        if (!respuesta.ok) {
            const resultado = await respuesta.json();
            throw new Error(resultado.error || 'No se pudo generar el PDF del ticket.');
        }

        const url = URL.createObjectURL(await respuesta.blob());
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `ticket-${datosTicket.id || 'compra'}.pdf`;
        enlace.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
        console.error('Error al descargar el ticket:', error);
        estado.textContent = error.message || 'No se pudo descargar el PDF del ticket.';
    } finally {
        boton.disabled = false;
        boton.textContent = 'Descargar PDF';
    }
});
document.getElementById('boton-salir').addEventListener('click', () => {
    window.carrito.limpiar();
    sessionStorage.removeItem('nombreCliente');
    sessionStorage.removeItem('ticketActual');
    window.location.assign('/');
});
