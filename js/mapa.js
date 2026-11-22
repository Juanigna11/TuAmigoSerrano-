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
      window.open(armarLinkWhatsApp(MENSAJES_WHATSAPP.vecino + " en " + chip.dataset.pueblo), "_blank", "noopener");
    });
  });
} else {
  const mapa = L.map(contenedorMapa, {
    scrollWheelZoom: false,          // la rueda del mouse sigue bajando la página
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
  capas.mapa.addTo(mapa);

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

    const link = armarLinkWhatsApp(MENSAJES_WHATSAPP.vecino + " en " + pueblo.nombre);
    pin.bindPopup(
      '<div class="globo-pueblo"><strong>' + pueblo.nombre + "</strong>" +
      "<span>Tramo " + pueblo.tramo + "</span><br>" +
      '<a class="boton boton--principal boton--chico" href="' + link + '" target="_blank" rel="noopener">' +
      "Pedir un trabajador en " + pueblo.nombre + "</a></div>"
    );
    pin.on("click", function () { elegir(pueblo.nombre); });
    pines[pueblo.nombre] = pin;
  });

  function elegir(nombre) {
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.pueblo === nombre ? "true" : "false");
    });
    PUEBLOS.forEach(function (pueblo) {
      const esEste = pueblo.nombre === nombre;
      pines[pueblo.nombre].setIcon(iconoPueblo(pueblo.tramo, esEste));
      pines[pueblo.nombre].setZIndexOffset(esEste ? 1000 : 0);   // el elegido queda arriba
    });
    const centro = pines[nombre].getLatLng();
    if (sinAnimacion) {
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

  // Encuadre: solo la franja de las Sierras Chicas.
  // El mapa son imágenes (mosaicos) que ya vienen con los nombres dibujados,
  // así que no podemos borrar un nombre suelto. Lo que sí podemos es no
  // dejar que se vea lo que está al oeste (Valle de Punilla: Cosquín,
  // La Falda) ni más allá de la zona: "maxBounds" pone un límite para
  // arrastrar y "minZoom" no deja alejarse tanto como para verlo.
  const limitesZona = L.latLngBounds([-31.40, -64.40], [-30.90, -64.10]);
  mapa.setMaxBounds(limitesZona);
  mapa.options.maxBoundsViscosity = 1;          // el borde es firme, no elástico
  function ajustarZoomMinimo() {
    // getBoundsZoom(..., true): el zoom con el que la vista entra DENTRO del límite
    mapa.setMinZoom(mapa.getBoundsZoom(limitesZona, true));
  }
  ajustarZoomMinimo();
  mapa.fitBounds(PUEBLOS.map(function (p) { return [p.lat, p.lng]; }), { padding: [30, 30] });
  mapa.on("resize", ajustarZoomMinimo);
}
