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

document.getElementById('boton-descargar-ticket').addEventListener('click', () => {
    try {
        const { jsPDF } = window.jspdf || {};
        if (!jsPDF || !datosTicket) {
            throw new Error('No se pudo generar el PDF del ticket.');
        }

        const pdf = new jsPDF();
        let posicion = 20;
        const agregarLinea = (texto) => {
            const lineas = pdf.splitTextToSize(String(texto), 180);
            if (posicion + lineas.length * 6 > 280) {
                pdf.addPage();
                posicion = 20;
            }
            pdf.text(lineas, 15, posicion);
            posicion += lineas.length * 6;
        };

        pdf.setFontSize(16);
        agregarLinea(datosTicket.empresa);
        agregarLinea('Ticket de compra');
        pdf.setFontSize(11);
        agregarLinea(`Cliente: ${datosTicket.nombreCliente}`);
        agregarLinea(`Fecha: ${new Date(datosTicket.fecha).toLocaleString('es-AR')}`);
        agregarLinea('');

        datosTicket.productos.forEach((producto) => {
            agregarLinea(`${producto.nombre} - Cantidad: ${producto.cantidad}`);
            agregarLinea(`Precio: ${formatoPrecio(producto.precioUnitario)} - Subtotal: ${formatoPrecio(producto.subtotal)}`);
        });

        agregarLinea('');
        pdf.setFontSize(13);
        agregarLinea(`Total: ${formatoPrecio(datosTicket.total)}`);
        pdf.save(`ticket-${datosTicket.id || 'compra'}.pdf`);
    } catch (error) {
        console.error('Error al descargar el ticket:', error);
        estado.textContent = 'No se pudo descargar el PDF del ticket.';
    }
});
document.getElementById('boton-salir').addEventListener('click', () => {
    window.carrito.limpiar();
    sessionStorage.removeItem('nombreCliente');
    sessionStorage.removeItem('ticketActual');
    window.location.assign('/');
});
