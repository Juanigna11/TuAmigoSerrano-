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
  Animación de "Cómo funciona"
  ----------------------------
  Los tres pasos aparecen uno detrás del otro, una sola vez, cuando la sección entra en pantalla.
*/
const listaPasos = document.querySelector(".pasos");
if (listaPasos && "IntersectionObserver" in window) {
  listaPasos.classList.add("pasos--animado");
  const vigiaPasos = new IntersectionObserver(function (entradas) {
    if (entradas[0].isIntersecting) {
      listaPasos.classList.add("pasos--en-vista");
      vigiaPasos.disconnect();
    }
  }, { threshold: 0.35 });
  vigiaPasos.observe(listaPasos);
}


/*
  Sierras que se mueven al scrollear (parallax)
  ---------------------------------------------
  Calculamos cuánto del hero ya pasó (de 0 a 1) y lo guardamos en la
  variable CSS --scroll. El CSS decide cuánto se mueve cada capa.
  - requestAnimationFrame: hace el cálculo una vez por cuadro de la
    pantalla, aunque el evento scroll se dispare muchas más veces.
  - { passive: true }: le avisa al navegador que no vamos a frenar el
    scroll, así no se pone pesado en el celular.
  - Si la persona pidió "reducir movimiento", no hacemos nada.
*/
const heroSierras = document.querySelector(".hero");
const pideMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (heroSierras && !pideMenosMovimiento) {
  let cuadroPendiente = false;

  function moverSierras() {
    const alto = heroSierras.offsetHeight;
    const avance = Math.min(Math.max(window.scrollY / alto, 0), 1);
    heroSierras.style.setProperty("--scroll", avance.toFixed(3));
    cuadroPendiente = false;
  }

  window.addEventListener("scroll", function () {
    if (!cuadroPendiente) {
      cuadroPendiente = true;
      requestAnimationFrame(moverSierras);
    }
  }, { passive: true });

  moverSierras();
}
