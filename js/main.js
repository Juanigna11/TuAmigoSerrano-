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

// Links de Facebook (data-facebook): la dirección sale de config.js
document.querySelectorAll("[data-facebook]").forEach(function (enlace) {
  enlace.href = FACEBOOK_URL;
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
      // Cuando termina la última tarjeta, sacamos las clases de la
      // animación: así ninguna tarjeta queda "en su propia capa" y la
      // pelotita pasa por debajo de los números.
      listaPasos.addEventListener("animationend", function (evento) {
        if (evento.target === listaPasos.querySelector(".paso:last-of-type")) {
          listaPasos.classList.remove("pasos--animado", "pasos--en-vista");
        }
      });
    }
  }, { threshold: 0.35 });
  vigiaPasos.observe(listaPasos);
}


/*
  Cinta de oficios
  ----------------
  1. A cada botón le armamos el link de WhatsApp con su pedido
     ("Hola! Vengo de la web. Necesito un electricista") usando el número
     de config.js, igual que los otros botones.
  2. Copiamos la lista una vez más al final de la pista: así la cinta
     no tiene fin. La copia queda oculta para el lector de pantalla
     (aria-hidden) y fuera del recorrido con Tab (tabindex -1), para
     no repetir los oficios dos veces.
  Con "reducir movimiento" no se copia: la cinta queda quieta.
*/
document.querySelectorAll(".cinta__oficio").forEach(function (enlace) {
  enlace.href = armarLinkWhatsApp("Hola! Vengo de la web. Necesito " + enlace.dataset.pedido);
});

const listaCinta = document.querySelector(".cinta__lista");
if (listaCinta && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const copia = listaCinta.cloneNode(true);
  copia.setAttribute("aria-hidden", "true");
  copia.querySelectorAll("a").forEach(function (enlace) { enlace.tabIndex = -1; });
  listaCinta.parentElement.appendChild(copia);
}


/*
  Sierras que se ondulan al scrollear
  -----------------------------------
  Cada loma es una suma de dos ondas (senos). Al scrollear, cambiamos
  la "fase" de las ondas, o sea, las corremos: la forma se va
  ondulando como si las sierras respiraran.
  - Cada capa tiene ondas y velocidades distintas: así parecen estar a
    distinta distancia (la de atrás se mueve más lento).
  - armarLoma() arma el texto del atributo "d" del <path>: una lista de
    puntos (L x y) que el navegador une con líneas cortas.
  - requestAnimationFrame: redibuja una vez por cuadro de la pantalla,
    aunque el evento scroll se dispare muchas más veces.
  - { passive: true }: el navegador no espera a nuestro código para
    scrollear, así no se pone pesado en el celular.
  - Con "reducir movimiento" las lomas quedan quietas.
  También ponemos --scroll en el hero (de 0 a 1), que el CSS usa para
  esconder el sol detrás de las lomas.
*/
const heroSierras = document.querySelector(".hero");
const pideMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const lomaAtras = document.querySelector(".hero__loma-atras");
const lomaAdelante = document.querySelector(".hero__loma-adelante");

// base: altura media de la loma (el dibujo mide 180 de alto; 0 es arriba)
// ondas: [altura, largo de la onda, velocidad al scrollear]
const FORMA_ATRAS    = { base: 46,  ondas: [[26, 520, 0.010], [10, 230, -0.018]] };
const FORMA_ADELANTE = { base: 102, ondas: [[12, 640, -0.014], [6, 300, 0.022]] };

function armarLoma(forma, desplazo) {
  let d = "M-160 180";
  for (let x = -160; x <= 1620; x += 20) {
    let y = forma.base;
    forma.ondas.forEach(function (onda) {
      const [alto, largo, velocidad] = onda;
      y += alto * Math.sin((x / largo) * 2 * Math.PI + desplazo * velocidad);
    });
    d += " L" + x + " " + y.toFixed(1);
  }
  return d + " L1620 180 Z";
}

if (heroSierras && lomaAtras && lomaAdelante && !pideMenosMovimiento) {
  let cuadroPendiente = false;

  function moverSierras() {
    cuadroPendiente = false;
    const y = window.scrollY;
    if (y > heroSierras.offsetHeight) return;   // el hero ya no se ve: no gastamos
    lomaAtras.setAttribute("d", armarLoma(FORMA_ATRAS, y));
    lomaAdelante.setAttribute("d", armarLoma(FORMA_ADELANTE, y));
    const avance = Math.min(y / heroSierras.offsetHeight, 1);
    heroSierras.style.setProperty("--scroll", avance.toFixed(3));
  }

  window.addEventListener("scroll", function () {
    if (!cuadroPendiente) {
      cuadroPendiente = true;
      requestAnimationFrame(moverSierras);
    }
  }, { passive: true });

  moverSierras();
}


/*
  Sol que salta por "Cómo funciona"
  ------------------------------------
  1. Calculamos "avance": 0 cuando la sección recién asoma por abajo de
     la pantalla y 1 cuando ya la recorriste.
  2. Con ese número ubicamos la pelotita entre el centro del número 1
     y el del 3 (pasando por el 2), saltando en arco de uno al otro.
  3. Cada número que la pelotita ya alcanzó se pinta de verde.
  En celular baja por la columna de los números, con un arco más chico.
*/
const pasosLista = document.querySelector(".pasos");
const numerosPasos = pasosLista ? pasosLista.querySelectorAll(".paso__numero") : [];

if (pasosLista && numerosPasos.length && !pideMenosMovimiento) {
  const pelotita = document.createElement("span");
  pelotita.className = "pasos__pelotita";
  pelotita.setAttribute("aria-hidden", "true");
  pasosLista.appendChild(pelotita);

  let pasosPendiente = false;

  function moverPelotita() {
    pasosPendiente = false;
    const caja = pasosLista.getBoundingClientRect();
    const altoPantalla = window.innerHeight;

    // Empieza cuando la sección está al 85% de la pantalla
    // y termina cuando su final llega a la mitad.
    const recorrido = altoPantalla * 0.35 + caja.height;
    const avance = Math.min(Math.max((altoPantalla * 0.85 - caja.top) / recorrido, 0), 1);

    // Centro de cada número, medido desde la esquina de la lista
    const centros = Array.from(numerosPasos).map(function (numero) {
      const r = numero.getBoundingClientRect();
      return { x: r.left - caja.left + r.width / 2, y: r.top - caja.top + r.height / 2 };
    });

    // ¿Entre qué dos números está y cuánto avanzó en ese tramo?
    const tramos = centros.length - 1;
    const posicion = avance * tramos;                 // de 0 a 2
    const i = Math.min(Math.floor(posicion), tramos - 1);
    const t = posicion - i;
    // Salto: Math.sin(Math.PI * t) vale 0 al salir, 1 en la mitad y 0 al
    // llegar. Multiplicado por la altura del salto, dibuja un arco.
    // - En compu los pasos están en fila: el arco va hacia ARRIBA.
    // - En celular están en columna: el arco va hacia la IZQUIERDA y es
    //   más chico, para no salirse de la tarjeta ni pisar el texto.
    const dx = centros[i + 1].x - centros[i].x;
    const dy = centros[i + 1].y - centros[i].y;
    const enFila = Math.abs(dx) > Math.abs(dy);
    const salto = Math.sin(Math.PI * t) * (enFila ? 46 : 20);
    const x = centros[i].x + dx * t - (enFila ? 0 : salto);
    const y = centros[i].y + dy * t - (enFila ? salto : 0);
    pelotita.style.translate = (x - 8) + "px " + (y - 8) + "px";   // 8 = mitad de la pelotita

    numerosPasos.forEach(function (numero, n) {
      numero.classList.toggle("paso__numero--alcanzado", posicion >= n - 0.05);
    });
  }

  function pedirCuadro() {
    if (!pasosPendiente) {
      pasosPendiente = true;
      requestAnimationFrame(moverPelotita);
    }
  }
  window.addEventListener("scroll", pedirCuadro, { passive: true });
  window.addEventListener("resize", pedirCuadro);
  moverPelotita();
}
