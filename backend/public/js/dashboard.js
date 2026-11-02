// Modal de confirmación para desactivar y activar productos.
const modal = document.getElementById('modal-confirmar');
const formulario = modal.querySelector('form');

const textos = {
  desactivar: {
    titulo: 'Eliminar producto',
    pregunta: (nombre) => `¿Está seguro de que quiere eliminar "${nombre}"? Dejará de verse en la tienda, pero se puede volver a activar.`,
    boton: 'Sí, eliminar',
  },
  activar: {
    titulo: 'Activar producto',
    pregunta: (nombre) => `¿Está seguro de que quiere activar "${nombre}"? Volverá a verse en la tienda.`,
    boton: 'Sí, activar',
  },
};

document.querySelectorAll('[data-accion]').forEach((boton) => {
  boton.addEventListener('click', () => {
    const { accion, id, nombre } = boton.dataset;
    const texto = textos[accion];

    formulario.action = `/admin/products/${id}/${accion}`; // el id decide qué producto cambia
    document.getElementById('modal-titulo').textContent = texto.titulo;
    document.getElementById('modal-texto').textContent = texto.pregunta(nombre); // el nombre solo se muestra
    document.getElementById('modal-boton').textContent = texto.boton;
    modal.showModal();
  });
});

modal.querySelector('[data-cancelar]').addEventListener('click', () => modal.close());
