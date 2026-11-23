/* =========================================================
   CONFIGURACIÓN
   ---------------------------------------------------------
   Los datos que pueden cambiar están todos acá:
   1. WhatsApp (número y mensajes)
   2. Facebook
   3. Formulario de alta (Google Form)
   main.js, mapa.js y alta.js leen estas constantes.
   ========================================================= */


/* ---------- 1. WhatsApp ---------- */

/*
  Número en formato internacional, SIN "+", sin espacios ni guiones.
  Argentina = 54, celular = 9, después código de área sin 0 y número sin 15.
  Ejemplo: 351 123 4567  →  5493511234567
*/
const NUMERO_WHATSAPP = "5493543691050";

/*
  Cómo se muestra el número escrito en la página (footer y "¿Dudas?").
  Es solo texto para leer: no se usa para armar los links.
*/
const NUMERO_VISIBLE = "3543-691050";

/*
  Mensajes que le llegan escritos al chat.
  La clave (general, vecino, etc.) es la misma que se usa en el HTML
  con el atributo data-wa="...".
  Todos empiezan con "Hola! Vengo de la web" para poder contar
  cuántas personas llegan desde la landing.
*/
const MENSAJES_WHATSAPP = {
  general: "Hola! Vengo de la web",
  vecino: "Hola! Vengo de la web. Necesito un trabajo o un arreglo",
  // mapa.js le agrega el pueblo al final: "...para un trabajo en Unquillo"
  pueblo: "Hola! Vengo de la web. Necesito a alguien para un trabajo en",
  // Respaldo del formulario de alta si no se pudo enviar
  trabajador: "Hola! Vengo de la web. Quiero sumarme como trabajador",
};


/* ---------- 2. Facebook ---------- */

const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61562444867883";


/* ---------- 3. Formulario de alta (Google Form) ----------
   El formulario de la landing manda las respuestas al Google Form que ya
   existe, así caen en la hoja "Respuestas de alta" igual que siempre.
   Ver js/alta.js.

   ¡OJO! Las opciones de abajo tienen que ser IGUALES, letra por letra
   (tildes, mayúsculas y comas), a las del Google Form. Si no coinciden,
   Google descarta la respuesta entera sin avisar. Si cambiás una opción
   en el Google Form, cambiala también acá.
*/

// Dirección a la que se mandan las respuestas (termina en /formResponse)
const FORM_ACTION = "https://docs.google.com/forms/d/e/1FAIpQLScAekNS8ABDVobP8eklaVd2Vm4YQK9P3HWnzALeqefobJh5tw/formResponse";

// El Google Form común, por si falla el envío desde la landing
const FORM_PUBLICO = "https://docs.google.com/forms/d/e/1FAIpQLScAekNS8ABDVobP8eklaVd2Vm4YQK9P3HWnzALeqefobJh5tw/viewform";

/*
  El "código" de cada pregunta del Google Form (entry.NÚMERO).
  Google identifica cada respuesta por este código, no por el texto
  de la pregunta. Se ven abriendo el Google Form y buscando "entry."
  en el código fuente de la página.
*/
const FORM_CAMPOS = {
  nombre:        "entry.454062258",
  whatsapp:      "entry.1690716608",
  oficio:        "entry.1174004062",
  otrosOficios:  "entry.1802719753",   // texto libre: en el Google Form tiene que ser "Respuesta corta"
  localidades:   "entry.164587036",    // se repite una vez por cada localidad
  experiencia:   "entry.551180325",
  disponibilidad:"entry.1866086879",
  matricula:     "entry.1475792471",
  referencia1:   "entry.1854244853",
  referencia2:   "entry.404696132",
  reglas:        "entry.670279010",
};

// Valor exacto que espera Google en la casilla de las reglas
const FORM_ACEPTO_REGLAS = "Acepto las reglas";

/*
  Rubros agrupados por categoría, para el desplegable "Oficio principal".
  (Los otros oficios la persona los escribe a mano, en el campo "Otros".)
*/
const FORM_RUBROS = [
  {
    categoria: "Construcción y mantenimiento de la casa",
    oficios: ["Albañilería", "Pintura", "Plomería", "Electricidad", "Gas",
      "Herrería y soldadura", "Carpintería", "Vidriería", "Cerrajería",
      "Desagote de pozo y cámara séptica", "Termotanques y calefones",
      "Paneles solares", "Piletas"],
  },
  {
    categoria: "Mantenimiento del hogar",
    oficios: ["Jardinería", "Poda y extracción de árboles",
      "Desmalezado y limpieza de terrenos", "Leña"],
  },
  {
    categoria: "Reparación técnica",
    oficios: ["Lavarropas", "Heladeras", "Aire acondicionado",
      "Computadoras y notebooks", "Televisores", "Celulares",
      "Pequeños electrodomésticos", "Cocinas y hornos",
      "Calefactores y estufas", "Internet y wifi", "Cámaras y alarmas",
      "Portones automáticos", "Bicicletas",
      "Motosierras, motoguadañas y cortadoras de pasto"],   // ← es UNA sola opción
  },
  {
    categoria: "Hogar y servicios generales",
    oficios: ["Limpieza de casas", "Fletes y mudanzas", "Armado de muebles",
      "Control de plagas"],
  },
];

// Si el oficio principal es uno de estos, se pide matrícula
const FORM_OFICIOS_CON_MATRICULA = ["Electricidad", "Gas", "Termotanques y calefones",
  "Cocinas y hornos", "Calefactores y estufas", "Control de plagas"];

// Localidades por tramo (de sur a norte)
const FORM_TRAMOS = [
  { tramo: "Sur",    clase: "tramo--sur",    localidades: ["La Calera", "Saldán", "Villa Allende", "Mendiolaza"] },
  { tramo: "Centro", clase: "tramo--centro", localidades: ["Unquillo", "Río Ceballos"] },
  { tramo: "Norte",  clase: "tramo--norte",  localidades: ["Salsipuedes", "El Manzano", "Agua de Oro", "La Granja", "Ascochinga"] },
];
