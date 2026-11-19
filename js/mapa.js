/* =========================================================
   MAPA.JS · Mapa de la zona
   1. Animación de entrada cuando el mapa aparece en pantalla
   2. Elegir un pueblo (en el mapa o en la lista) y mostrar su ficha
      con un botón de WhatsApp que ya dice el pueblo
   ---------------------------------------------------------
   Usa armarLinkWhatsApp() y MENSAJES_WHATSAPP de main.js/config.js.
   ========================================================= */

const mapa = document.querySelector(".mapa");

if (mapa) {
  /* ---------- 1. Entrada ---------- */
  // La clase "mapa--animado" esconde lo que se va a dibujar.
  // La ponemos desde JS: si JS no carga, el mapa se ve completo igual.
  mapa.classList.add("mapa--animado");

  // Vigilamos el dibujo (no toda la sección): en celular la sección es muy
  // alta y nunca llegaría a verse un porcentaje grande de ella.
  const dibujo = mapa.querySelector(".mapa__figura");

  if ("IntersectionObserver" in window && dibujo) {
    const observador = new IntersectionObserver(function (entradas) {
      if (entradas[0].isIntersecting) {
        mapa.classList.add("mapa--en-vista");
        observador.disconnect();          // la entrada pasa una sola vez
      }
    }, { threshold: 0.3 });
    observador.observe(dibujo);
  } else {
    mapa.classList.add("mapa--en-vista");
  }

  /* ---------- 2. Elegir un pueblo ---------- */
  const puntos = mapa.querySelectorAll(".pueblo");          // en el dibujo
  const chips = mapa.querySelectorAll(".chip-pueblo");      // en la lista
  const fichaVacia = mapa.querySelector(".ficha__vacia");
  const fichaLlena = mapa.querySelector(".ficha__llena");
  const fichaNombre = mapa.querySelector(".ficha__nombre");
  const fichaTramo = mapa.querySelector(".ficha__tramo");
  const fichaBoton = mapa.querySelector(".ficha__boton");

  function elegir(nombre) {
    let tramo = "";

    puntos.forEach(function (punto) {
      const esEste = punto.dataset.pueblo === nombre;
      punto.classList.toggle("pueblo--elegido", esEste);
      punto.setAttribute("aria-pressed", esEste ? "true" : "false");
      if (esEste) {
        tramo = punto.dataset.tramo;
        // Lo pasamos al final del grupo para que quede dibujado arriba de los demás
        punto.parentNode.appendChild(punto);
      }
    });

    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.pueblo === nombre ? "true" : "false");
    });

    fichaNombre.textContent = nombre;
    fichaTramo.textContent = "Tramo " + tramo + " de Sierras Chicas";
    fichaBoton.textContent = "Pedir un trabajador en " + nombre;
    fichaBoton.href = armarLinkWhatsApp(MENSAJES_WHATSAPP.vecino + " en " + nombre);
    fichaVacia.hidden = true;
    fichaLlena.hidden = false;
  }

  puntos.forEach(function (punto) {
    punto.addEventListener("click", function () {
      elegir(punto.dataset.pueblo);
    });
    // Como es un <g> con role="button", Enter y Espacio también tienen que elegir
    punto.addEventListener("keydown", function (evento) {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        elegir(punto.dataset.pueblo);
      }
    });
  });

  chips.forEach(function (chip) {
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", function () {
      elegir(chip.dataset.pueblo);
    });
  });
}
