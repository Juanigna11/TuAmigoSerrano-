/* =========================================================
   MAPA.JS · La zona (esquema de línea)
   Al tocar un pueblo se "abre": se agranda, late despacio y
   muestra su botón de WhatsApp con el pueblo ya escrito.
   Solo puede haber uno abierto a la vez.
   ---------------------------------------------------------
   Usa armarLinkWhatsApp() de main.js y MENSAJES_WHATSAPP de config.js.
   ========================================================= */

const botonesPueblo = document.querySelectorAll(".parada__boton");

function abrirPueblo(botonElegido) {
  botonesPueblo.forEach(function (boton) {
    const esEste = boton === botonElegido;
    const ficha = document.getElementById(boton.getAttribute("aria-controls"));

    boton.setAttribute("aria-expanded", esEste ? "true" : "false");
    ficha.hidden = !esEste;

    if (esEste) {
      // El link se arma acá para usar el número y el mensaje de config.js
      const enlace = ficha.querySelector("[data-pueblo-wa]");
      const pueblo = enlace.dataset.puebloWa;
      enlace.href = armarLinkWhatsApp(MENSAJES_WHATSAPP.vecino + " en " + pueblo);
    }
  });
}

botonesPueblo.forEach(function (boton) {
  boton.addEventListener("click", function () {
    // Si ya estaba abierto, un segundo toque lo cierra
    if (boton.getAttribute("aria-expanded") === "true") {
      abrirPueblo(null);
    } else {
      abrirPueblo(boton);
    }
  });
});
