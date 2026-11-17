// Botón de acceso rápido: completa el correo y la contraseña del administrador de prueba.
const boton = document.getElementById('acceso-rapido');

boton.addEventListener('click', () => {
  document.getElementById('email').value = boton.dataset.email;
  document.getElementById('password').value = boton.dataset.password;
});
