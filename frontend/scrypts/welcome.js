const button = document.getElementById("boton-tema");
const icon = document.getElementById("icono-tema");

button.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        icon.src = "/assets/img/modo claro.png";
        icon.style.filter = "none";
    } else {
        icon.src = "/assets/img/modo oscuro.png";
        icon.style.filter = "invert(1)";
    }
});