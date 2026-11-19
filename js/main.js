/* =========================================================
   MAIN.JS
   1. Arma los links de WhatsApp a partir de config.js
   2. Escribe el número visible en el footer
   3. Muestra el botón flotante cuando el hero sale de pantalla
   ---------------------------------------------------------
   Se carga con "defer": el navegador lo ejecuta recién cuando
   terminó de leer todo el HTML, así los elementos ya existen.
   config.js se carga antes, por eso acá podemos usar
   NUMERO_WHATSAPP, NUMERO_VISIBLE y MENSAJES_WHATSAPP.
   ========================================================= */


/* ---------- 1. Links de WhatsApp ---------- */

/**
 * Devuelve el link completo de WhatsApp para un mensaje.
 * encodeURIComponent convierte el texto a formato URL:
 * los espacios pasan a ser %20, las tildes se codifican, etc.
 * Ejemplo: "Hola! Vengo de la web" → "Hola!%20Vengo%20de%20la%20web"
 */
function armarLinkWhatsApp(mensaje) {
  return "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
}

// Buscamos todos los elementos que tengan el atributo data-wa
// (por ejemplo <a data-wa="vecino">) y les ponemos el href correcto.
document.querySelectorAll("[data-wa]").forEach(function (enlace) {
  const clave = enlace.dataset.wa;            // "vecino", "trabajador", etc.
  const mensaje = MENSAJES_WHATSAPP[clave];

  // Si alguien escribe mal la clave en el HTML, avisamos en la consola
  // y dejamos el href de respaldo que ya estaba escrito.
  if (!mensaje) {
    console.warn('No hay mensaje en config.js para data-wa="' + clave + '"');
    return;
  }

  enlace.href = armarLinkWhatsApp(mensaje);
  // Abrir en pestaña nueva. "noopener" evita que la página nueva
  // pueda controlar esta pestaña (buena práctica de seguridad).
  enlace.target = "_blank";
  enlace.rel = "noopener";
});


/* ---------- 2. Número visible ---------- */

document.querySelectorAll("[data-wa-numero]").forEach(function (elemento) {
  elemento.textContent = NUMERO_VISIBLE;
});


/* ---------- 3. Botón flotante ---------- */
/*
  IntersectionObserver es una herramienta del navegador que "vigila"
  un elemento y nos avisa cada vez que entra o sale de la pantalla.
  Es mejor que escuchar el evento "scroll", porque no se ejecuta
  en cada píxel que se mueve la página: solo cuando cambia el estado.

  Acá vigilamos el hero:
  - Si el hero se ve (isIntersecting = true) → escondemos el botón,
    porque ya está a la vista el botón grande "Pedir un trabajador".
  - Si el hero ya no se ve → mostramos el botón flotante.

  El CSS se encarga de que el botón exista solo en celular
  (en pantallas anchas tiene display: none).
*/
const hero = document.querySelector("#inicio");
const botonFlotante = document.querySelector(".flotante");

if (hero && botonFlotante) {
  if ("IntersectionObserver" in window) {
    const observador = new IntersectionObserver(function (entradas) {
      const heroVisible = entradas[0].isIntersecting;
      botonFlotante.classList.toggle("flotante--visible", !heroVisible);
    });
    observador.observe(hero);
  } else {
    // Navegadores muy viejos: lo mostramos siempre.
    botonFlotante.classList.add("flotante--visible");
  }
}


/*
  Sierras animadas y "reducir movimiento"
  ---------------------------------------
  El CSS frena el corrimiento lateral, pero el cambio de forma de las lomas
  es una animación del SVG (<animate>) y el CSS no la alcanza.
  Si la persona pidió reducir movimiento, la pausamos desde acá.
*/
const sierras = document.querySelector(".hero__sierras");
const pideMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)");

function ajustarSierras() {
  if (!sierras || !sierras.pauseAnimations) return;
  if (pideMenosMovimiento.matches) {
    sierras.pauseAnimations();
  } else {
    sierras.unpauseAnimations();
  }
}
ajustarSierras();
pideMenosMovimiento.addEventListener("change", ajustarSierras);
