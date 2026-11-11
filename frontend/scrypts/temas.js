const buttonTema = document.getElementById("boton-tema");
const iconoTema = document.getElementById("icono-tema");
const elementosMonoColor = document.querySelectorAll(".boton-mono-color");
const TEMA_STORAGE_KEY = "tema";

function actualizarTema() {
    const temaOscuro = document.body.classList.contains("dark");

    if (iconoTema) {
        iconoTema.src = temaOscuro
            ? "/assets/img/modo claro.png"
            : "/assets/img/modo oscuro.png";
    }

    elementosMonoColor.forEach((elemento) => {
        elemento.style.filter = temaOscuro ? "invert(1)" : "none";
    });
}

if (localStorage.getItem(TEMA_STORAGE_KEY) === "dark") {
    document.body.classList.add("dark");
}

actualizarTema();

if (buttonTema) {
    buttonTema.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        localStorage.setItem(
            TEMA_STORAGE_KEY,
            document.body.classList.contains("dark") ? "dark" : "light"
        );
        actualizarTema();
    });
}
