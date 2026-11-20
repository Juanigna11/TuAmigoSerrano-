/* =========================================================
   MAPA.JS · La zona (mapa real)
   - Dibuja el mapa con Leaflet: el mapa estándar de OpenStreetMap
     (estilo "OpenStreetMap Carto") y una capa de satélite (Esri).
   - Marca cada pueblo con un círculo del color de su tramo.
   - Al elegir un pueblo (en el mapa o en la lista) el mapa se
     acerca y muestra un botón de WhatsApp con el pueblo escrito.
   ---------------------------------------------------------
   Usa armarLinkWhatsApp() de main.js y MENSAJES_WHATSAPP de config.js.
   ========================================================= */

/*
  Centro aproximado de cada pueblo [latitud, longitud].
  Se marca con un círculo de ~900 m (no con un pin) porque las
  coordenadas son aproximadas: un círculo disimula un corrimiento chico.
*/
const PUEBLOS = [
  { nombre: "Ascochinga",    tramo: "Norte",  lat: -30.958, lng: -64.275 },
  { nombre: "La Granja",     tramo: "Norte",  lat: -31.008, lng: -64.263 },
  { nombre: "Agua de Oro",   tramo: "Norte",  lat: -31.065, lng: -64.300 },
  { nombre: "El Manzano",    tramo: "Norte",  lat: -31.083, lng: -64.299 },
  { nombre: "Salsipuedes",   tramo: "Norte",  lat: -31.137, lng: -64.296 },
  { nombre: "Río Ceballos",  tramo: "Centro", lat: -31.165, lng: -64.322 },
  { nombre: "Unquillo",      tramo: "Centro", lat: -31.230, lng: -64.316 },
  { nombre: "Mendiolaza",    tramo: "Sur",    lat: -31.265, lng: -64.302 },
  { nombre: "Villa Allende", tramo: "Sur",    lat: -31.295, lng: -64.295 },
  { nombre: "Saldán",        tramo: "Sur",    lat: -31.303, lng: -64.315 },
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

  // Un círculo por pueblo, con su globo y su botón de WhatsApp
  const circulos = {};
  PUEBLOS.forEach(function (pueblo) {
    const color = COLOR_TRAMO[pueblo.tramo];
    const circulo = L.circle([pueblo.lat, pueblo.lng], {
      radius: 900,
      color: color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.2,
    }).addTo(mapa);

    const link = armarLinkWhatsApp(MENSAJES_WHATSAPP.vecino + " en " + pueblo.nombre);
    circulo.bindPopup(
      '<div class="globo-pueblo"><strong>' + pueblo.nombre + "</strong>" +
      "<span>Tramo " + pueblo.tramo + "</span><br>" +
      '<a class="boton boton--principal boton--chico" href="' + link + '" target="_blank" rel="noopener">' +
      "Pedir un trabajador en " + pueblo.nombre + "</a></div>"
    );
    circulo.on("click", function () { elegir(pueblo.nombre); });
    circulos[pueblo.nombre] = circulo;
  });

  function elegir(nombre) {
    chips.forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.dataset.pueblo === nombre ? "true" : "false");
    });
    Object.keys(circulos).forEach(function (clave) {
      circulos[clave].setStyle({
        fillOpacity: clave === nombre ? 0.45 : 0.2,
        weight: clave === nombre ? 3 : 2,
      });
    });
    const centro = circulos[nombre].getLatLng();
    if (sinAnimacion) {
      mapa.setView(centro, 14);
    } else {
      mapa.flyTo(centro, 14, { duration: 0.8 });
    }
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      elegir(chip.dataset.pueblo);
      circulos[chip.dataset.pueblo].openPopup();
    });
  });

  // Encuadre inicial: que entren los 11 pueblos
  mapa.fitBounds(PUEBLOS.map(function (p) { return [p.lat, p.lng]; }), { padding: [30, 30] });
}
