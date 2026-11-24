/* =========================================================
   MAPA.JS · La zona (mapa real)
   - Dibuja el mapa con Leaflet: el mapa estándar de OpenStreetMap
     (estilo "OpenStreetMap Carto") y una capa de satélite (Esri).
   - Marca cada pueblo con un pin de la marca (A serrana) y su nombre.
   - Resalta las rutas E-53, E-57 y E-55 con su trazado real.
   - Al elegir un pueblo (en el mapa o en la lista) el mapa se
     acerca y muestra un botón de WhatsApp con el pueblo escrito.
   ---------------------------------------------------------
   Usa armarLinkWhatsApp() de main.js y MENSAJES_WHATSAPP de config.js.
   ========================================================= */

/*
  Centro aproximado de cada pueblo [latitud, longitud].
  Son aproximadas: si un pin cae corrido, se corrige acá.
*/
const PUEBLOS = [
  { nombre: "Ascochinga",    tramo: "Norte",  lat: -30.958, lng: -64.275 },
  { nombre: "La Granja",     tramo: "Norte",  lat: -31.008, lng: -64.263 },
  { nombre: "Agua de Oro",   tramo: "Norte",  lat: -31.065, lng: -64.300, etiqueta: "izquierda" },
  { nombre: "El Manzano",    tramo: "Norte",  lat: -31.083, lng: -64.299 },
  { nombre: "Salsipuedes",   tramo: "Norte",  lat: -31.137, lng: -64.296 },
  { nombre: "Río Ceballos",  tramo: "Centro", lat: -31.165, lng: -64.322 },
  { nombre: "Unquillo",      tramo: "Centro", lat: -31.230, lng: -64.316 },
  { nombre: "Mendiolaza",    tramo: "Sur",    lat: -31.265, lng: -64.302 },
  { nombre: "Villa Allende", tramo: "Sur",    lat: -31.295, lng: -64.295 },
  { nombre: "Saldán",        tramo: "Sur",    lat: -31.303, lng: -64.315, etiqueta: "izquierda" },
  { nombre: "La Calera",     tramo: "Sur",    lat: -31.343, lng: -64.336 },
];

const COLOR_TRAMO = { Sur: "#3E6E96", Centro: "#24543F", Norte: "#6E9F55" };

const contenedorMapa = document.getElementById("mapa-zona");
const chips = document.querySelectorAll(".chip-pueblo");

// Si la persona pidió "reducir movimiento", el mapa salta sin animación.
const sinAnimacion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Si Leaflet no cargó (sin conexión, bloqueado), los botones igual
// abren WhatsApp con el pueblo: la sección sigue sirviendo.
if (!contenedorMapa || typeof L === "undefined") {
  if (contenedorMapa) contenedorMapa.closest(".zona__marco").hidden = true;
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      window.open(armarLinkWhatsApp(MENSAJES_WHATSAPP.pueblo + " " + chip.dataset.pueblo), "_blank", "noopener");
    });
  });
} else {
  /*
    El mapa arranca "dormido" para no atrapar el scroll de la página:
    - Sin arrastre ni zoom con dos dedos: si pasás el dedo (o la rueda)
      por encima, la página sigue bajando.
    - Se despierta con doble toque (o doble clic): ahí sí se puede mover
      y hacer zoom.
    - Se vuelve a dormir cuando sale de la pantalla o cuando tocás fuera.
    Los pines, los botones + / − y la capa Satélite funcionan siempre.
    Truco: Leaflet le pone "touch-action: none" al mapa solo mientras el
    arrastre está activo; con el arrastre apagado, el navegador deja
    scrollear la página por encima del mapa.
  */
  const mapa = L.map(contenedorMapa, {
    scrollWheelZoom: false,          // la rueda del mouse sigue bajando la página
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,          // el doble toque lo usamos para despertarlo
    zoomControl: true,
  });

  const capas = {
    // Mapa estándar de OpenStreetMap (su estilo se llama "OpenStreetMap Carto").
    // Es gratis y no pide clave; solo hay que mostrar la mención a OpenStreetMap.
    mapa: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }),
    satelite: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Imágenes &copy; Esri",
      maxZoom: 18,
    }),
  };
  capas.satelite.addTo(mapa);        // arranca en satélite (decisión 22/11)

  // Botones Mapa / Satélite
  document.querySelectorAll(".zona__capas button").forEach(function (boton) {
    boton.addEventListener("click", function () {
      Object.values(capas).forEach(function (capa) { mapa.removeLayer(capa); });
      capas[boton.dataset.capa].addTo(mapa);
      document.querySelectorAll(".zona__capas button").forEach(function (otro) {
        otro.setAttribute("aria-pressed", otro === boton ? "true" : "false");
      });
    });
  });

  /* ---------- Rutas de las Sierras Chicas ----------
     Se pide a OpenStreetMap (servicio Overpass) el trazado real de las
     rutas E-53, E-57 y E-55 y se pintan gruesas en verde serrano.
     El resultado se guarda una semana en el navegador (localStorage)
     para no pedirlo en cada visita. Si el servicio no responde, el mapa
     se ve igual, sin el resaltado. */
  const RUTAS_CLAVE = "tas-rutas-v1";
  const UNA_SEMANA = 7 * 24 * 60 * 60 * 1000;
  const consultaRutas =
    '[out:json][timeout:25];' +
    'way["highway"]["ref"~"^E ?-? ?5[357]$"](-31.45,-64.45,-30.90,-64.15);' +
    'out geom;';

  function dibujarRutas(tramos) {
    tramos.forEach(function (tramo) {
      // Borde blanco ancho y la línea verde encima: se lee sobre cualquier fondo
      L.polyline(tramo.puntos, { color: "#FFFFFF", weight: 9, opacity: 0.9, interactive: false }).addTo(mapa);
      L.polyline(tramo.puntos, { color: "#24543F", weight: 5, opacity: 0.95 })
        .bindTooltip("Ruta " + tramo.ruta, { sticky: true, className: "etiqueta-ruta" })
        .addTo(mapa);
    });
  }

  function cargarRutas() {
    try {
      const guardado = JSON.parse(localStorage.getItem(RUTAS_CLAVE) || "null");
      if (guardado && Date.now() - guardado.fecha < UNA_SEMANA) {
        dibujarRutas(guardado.tramos);
        return;
      }
    } catch (error) { /* si localStorage falla, seguimos y lo pedimos */ }

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(consultaRutas),
    })
      .then(function (respuesta) {
        if (!respuesta.ok) throw new Error("Overpass respondió " + respuesta.status);
        return respuesta.json();
      })
      .then(function (datos) {
        // De cada camino nos quedamos con su número de ruta y sus puntos
        const tramos = datos.elements
          .filter(function (el) { return el.type === "way" && el.geometry; })
          .map(function (el) {
            const numero = (el.tags.ref.match(/5[357]/) || [""])[0];
            return {
              ruta: "E-" + numero,
              puntos: el.geometry.map(function (g) {
                return [Number(g.lat.toFixed(5)), Number(g.lon.toFixed(5))];
              }),
            };
          });
        dibujarRutas(tramos);
        try {
          localStorage.setItem(RUTAS_CLAVE, JSON.stringify({ fecha: Date.now(), tramos: tramos }));
        } catch (error) { /* sin espacio o sin permiso: no pasa nada */ }
      })
      .catch(function () { /* sin rutas resaltadas: el mapa sigue funcionando */ });
  }
  cargarRutas();

  /* ---------- Pines de los pueblos ----------
     Un pin con la forma de una gota, azul noche, con la A serrana adentro.
     El anillo de afuera tiene el color del tramo. Al lado, el nombre. */
  function iconoPueblo(tramo, elegido) {
    const tam = elegido ? 44 : 30;
    return L.divIcon({
      className: "pin-pueblo" + (elegido ? " pin-pueblo--elegido" : ""),
      iconSize: [tam, tam * 1.25],
      iconAnchor: [tam / 2, tam * 1.25],      // la punta de la gota marca el lugar
      popupAnchor: [0, -tam * 1.15],
      tooltipAnchor: [0, -tam * 0.7],
      html:
        '<svg viewBox="0 0 40 50" aria-hidden="true">' +
        '<path d="M20 48 C20 48 3 30 3 19 A17 17 0 0 1 37 19 C37 30 20 48 20 48 Z" ' +
        'fill="#1F3B57" stroke="' + COLOR_TRAMO[tramo] + '" stroke-width="4"/>' +
        '<g transform="translate(8.5 7.5) scale(0.068)">' +
        '<path fill-rule="evenodd" d="M20 390 L150 55 Q170 10 190 55 L320 390 L242 390 L216 325 C190 312 150 338 124 325 L98 390 Z M146 265 L194 265 L170 202 Z" fill="#8DBA6E"/>' +
        '<circle cx="282" cy="90" r="32" fill="#F2B33D"/></g></svg>',
    });
  }

  const pines = {};
  PUEBLOS.forEach(function (pueblo) {
    const pin = L.marker([pueblo.lat, pueblo.lng], {
      icon: iconoPueblo(pueblo.tramo, false),
      title: pueblo.nombre,
      alt: pueblo.nombre,
      riseOnHover: true,
    }).addTo(mapa);

    // Nombre siempre visible al lado del pin
    // Los que tienen etiqueta: "izquierda" la llevan del otro lado para no pisarse con el vecino
    const izquierda = pueblo.etiqueta === "izquierda";
    pin.bindTooltip(pueblo.nombre, {
      permanent: true,
      direction: izquierda ? "left" : "right",
      offset: [izquierda ? -14 : 14, 0],
      className: "etiqueta-pueblo",
    });

    const link = armarLinkWhatsApp(MENSAJES_WHATSAPP.pueblo + " " + pueblo.nombre);
    pin.bindPopup(
      '<div class="globo-pueblo"><strong>' + pueblo.nombre + "</strong>" +
      "<span>Tramo " + pueblo.tramo + "</span><br>" +
      '<a class="boton boton--principal boton--chico" href="' + link + '" target="_blank" rel="noopener">' +
      "Pedir un trabajador en " + pueblo.nombre + "</a></div>"
    );
    pin.on("click", function () { elegir(pueblo.nombre); });
    pines[pueblo.nombre] = pin;
  });

  // animar = false: salta directo, sin el vuelo (lo usamos al cargar la página)
  function elegir(nombre, animar) {
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.pueblo === nombre ? "true" : "false");
    });
    PUEBLOS.forEach(function (pueblo) {
      const esEste = pueblo.nombre === nombre;
      pines[pueblo.nombre].setIcon(iconoPueblo(pueblo.tramo, esEste));
      pines[pueblo.nombre].setZIndexOffset(esEste ? 1000 : 0);   // el elegido queda arriba
    });
    const centro = pines[nombre].getLatLng();
    if (sinAnimacion || animar === false) {
      mapa.setView(centro, 14);
    } else {
      mapa.flyTo(centro, 14, { duration: 0.8 });
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      elegir(chip.dataset.pueblo);
      pines[chip.dataset.pueblo].openPopup();
    });
  });

  // ----- Despertar / dormir el mapa -----
  const marcoMapa = contenedorMapa.parentElement;
  const aviso = document.createElement("p");
  aviso.className = "zona__aviso";
  aviso.setAttribute("aria-hidden", "true");   // es una ayuda visual; con teclado el mapa se maneja con + / −
  marcoMapa.appendChild(aviso);
  let despierto = false;

  function dormir() {
    despierto = false;
    mapa.dragging.disable();
    mapa.touchZoom.disable();
    mapa.scrollWheelZoom.disable();
    marcoMapa.classList.remove("zona__marco--activo");
    aviso.textContent = "Tocá dos veces el mapa para moverlo";
  }
  function despertar() {
    despierto = true;
    mapa.dragging.enable();
    mapa.touchZoom.enable();
    mapa.scrollWheelZoom.enable();
    marcoMapa.classList.add("zona__marco--activo");
    aviso.textContent = "Mapa activo · tocá afuera para seguir bajando";
  }
  dormir();
  mapa.on("dblclick", function () { if (!despierto) despertar(); });
  // Tocar o hacer clic fuera del mapa lo duerme
  document.addEventListener("pointerdown", function (evento) {
    if (despierto && !marcoMapa.contains(evento.target)) dormir();
  });
  // Si el mapa sale de la pantalla, también se duerme
  new IntersectionObserver(function (entradas) {
    if (!entradas[0].isIntersecting && despierto) dormir();
  }).observe(contenedorMapa);

  // Vista inicial (23/11): en vez de mostrar los 11 pueblos de lejos,
  // el mapa arranca ya parado en un pueblo, con su botón marcado y el
  // globo "Pedir un trabajador en ..." abierto, como ejemplo de lo que
  // pasa al tocar uno. Para cambiar el pueblo, cambiá este nombre
  // (tiene que estar escrito igual que en la lista PUEBLOS).
  const PUEBLO_INICIAL = "Salsipuedes";
  elegir(PUEBLO_INICIAL, false);
  pines[PUEBLO_INICIAL].openPopup();

  /*
    Ubicación de la persona (23/11)
    -------------------------------
    navigator.geolocation es una API del navegador: le pide la ubicación
    al dispositivo, PERO solo si la persona da permiso (aparece un cartel
    del navegador). La ubicación queda en el navegador: no la mandamos a
    ningún lado ni la guardamos.

    Por qué un botón y no automático al abrir la página: los navegadores
    desconfían de las páginas que piden la ubicación apenas cargan (Chrome
    llega a silenciar el cartel) y mucha gente dice "no" por reflejo. Con
    el botón, la persona entiende para qué se la pedimos.
    Si ya nos dio permiso en otra visita, la usamos sola al cargar
    (eso lo dice la Permissions API, sin mostrar ningún cartel).
  */
  const cajaUbicacion = document.querySelector(".ubicacion");
  const botonUbicacion = document.querySelector(".ubicacion__boton");
  const estadoUbicacion = document.querySelector(".ubicacion__estado");
  let puntoPersona = null;   // el círculo azul que marca dónde está

  // Distancia en km entre dos puntos del globo (fórmula del haversine)
  function distanciaKm(lat1, lng1, lat2, lng2) {
    const R = 6371;   // radio de la Tierra en km
    const rad = function (g) { return g * Math.PI / 180; };
    const dLat = rad(lat2 - lat1);
    const dLng = rad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function pueblosMasCercano(lat, lng) {
    let mejor = null;
    PUEBLOS.forEach(function (pueblo) {
      const km = distanciaKm(lat, lng, pueblo.lat, pueblo.lng);
      if (!mejor || km < mejor.km) mejor = { pueblo: pueblo, km: km };
    });
    return mejor;
  }

  function ubicar(silencioso) {
    if (!silencioso) {
      botonUbicacion.disabled = true;
      estadoUbicacion.textContent = "Buscando dónde estás…";
    }
    navigator.geolocation.getCurrentPosition(function (posicion) {
      const lat = posicion.coords.latitude;
      const lng = posicion.coords.longitude;
      const cercano = pueblosMasCercano(lat, lng);
      const nombre = cercano.pueblo.nombre;
      const km = Math.round(cercano.km);

      // Marcamos a la persona con un punto azul lago
      if (puntoPersona) puntoPersona.remove();
      puntoPersona = L.circleMarker([lat, lng], {
        radius: 9, color: "#FFFFFF", weight: 3, fillColor: "#3E6E96", fillOpacity: 1
      }).addTo(mapa).bindTooltip("Estás acá", { direction: "top", offset: [0, -8] });

      elegir(nombre, false);
      // Si está cerca, encuadramos a la persona y al pueblo juntos
      if (cercano.km < 15) {
        mapa.fitBounds([[lat, lng], [cercano.pueblo.lat, cercano.pueblo.lng]],
                       { padding: [70, 70], maxZoom: 14, animate: false });   // sin animar: así el globo se abre con el mapa ya quieto
      }
      pines[nombre].openPopup();

      estadoUbicacion.textContent = cercano.km < 15
        ? "Tu pueblo más cercano es " + nombre + "."
        : "Estás a unos " + km + " km de la zona. El pueblo más cercano es " + nombre + ".";
      botonUbicacion.disabled = false;
    }, function () {
      // Dijo que no, o el dispositivo no pudo ubicarse
      if (!silencioso) {
        estadoUbicacion.textContent = "No pudimos saber dónde estás. Elegí tu pueblo de la lista.";
      }
      botonUbicacion.disabled = false;
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  }

  if (cajaUbicacion && "geolocation" in navigator) {
    cajaUbicacion.hidden = false;
    botonUbicacion.addEventListener("click", function () { ubicar(false); });

    // ¿Ya nos dio permiso antes? Entonces la usamos sin preguntar de nuevo.
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then(function (permiso) {
        if (permiso.state === "granted") ubicar(true);
      }).catch(function () { /* navegador sin Permissions API: solo el botón */ });
    }
  }
}
