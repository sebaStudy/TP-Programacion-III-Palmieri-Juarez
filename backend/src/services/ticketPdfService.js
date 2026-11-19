const puppeteer = require('puppeteer');

const escaparHtml = (valor) => String(valor).replace(/[&<>"']/g, (caracter) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[caracter]));

const formatoPrecio = (valor) => Number(valor).toLocaleString('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

function crearHtmlTicket(ticket) {
  const filas = ticket.productos.map((producto) => `
    <tr>
      <td>${escaparHtml(producto.nombre)}</td>
      <td>${escaparHtml(producto.cantidad)}</td>
      <td>${formatoPrecio(producto.precioUnitario)}</td>
      <td>${formatoPrecio(producto.subtotal)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { color: #292333; font: 14px Arial, sans-serif; margin: 0; padding: 32px; }
        header { border-bottom: 2px solid #6b3f84; margin-bottom: 24px; padding-bottom: 16px; }
        h1 { color: #6b3f84; font-size: 24px; margin: 0 0 8px; }
        p { margin: 8px 0; }
        table { border-collapse: collapse; margin-top: 24px; width: 100%; }
        th, td { border-bottom: 1px solid #d8d1dd; padding: 10px 8px; text-align: left; }
        thead { background: #f3eff5; }
        tfoot th, tfoot td { font-size: 16px; font-weight: bold; }
        .gracias { margin-top: 28px; text-align: center; }
      </style>
    </head>
    <body>
      <header>
        <h1>${escaparHtml(ticket.empresa)}</h1>
        <strong>Ticket de compra</strong>
      </header>
      <p>Cliente: ${escaparHtml(ticket.nombreCliente)}</p>
      <p>Fecha: ${escaparHtml(new Date(ticket.fecha).toLocaleString('es-AR'))}</p>
      <table>
        <thead>
          <tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>
        </thead>
        <tbody>${filas}</tbody>
        <tfoot>
          <tr><th colspan="3">Total</th><td>${formatoPrecio(ticket.total)}</td></tr>
        </tfoot>
      </table>
      <p class="gracias">¡Gracias por tu compra!</p>
    </body>
    </html>`;
}

async function generarPdfTicket(ticket) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(crearHtmlTicket(ticket), { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

module.exports = { generarPdfTicket };
