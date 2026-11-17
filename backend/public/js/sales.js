// Modal con el detalle de una venta. Cada venta tiene su propio <dialog>.
document.querySelectorAll('[data-detalle]').forEach((boton) => {
  boton.addEventListener('click', () => {
    document.getElementById(boton.dataset.detalle).showModal();
  });
});

document.querySelectorAll('[data-cerrar]').forEach((boton) => {
  boton.addEventListener('click', () => boton.closest('dialog').close());
});
