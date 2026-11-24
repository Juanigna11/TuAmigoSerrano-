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
  // "¿Dónde atendés?" (opción múltiple). TODO: poner el código real cuando
  // la pregunta exista en el Google Form. Mientras diga COMPLETAR, alta.js
  // NO la manda (para no arriesgar el alta entera).
  dondeAtiende:  "entry.COMPLETAR",
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
      "Motosierras, motoguadañas y cortadoras de pasto"],   // ← es UNA sola opción
  },
  {
    categoria: "Vehículos",
    oficios: ["Mecánica de autos", "Mecánica de motos", "Bicicletería"],
  },
  {
    categoria: "Hogar y servicios generales",
    oficios: ["Limpieza de casas", "Fletes y mudanzas", "Armado de muebles",
      "Control de plagas"],
  },
  {
    // Para quien no encuentra su oficio en la lista: lo aclara en "Otros"
    categoria: "Otro",
    oficios: ["Otro"],
  },
];

// Si el oficio principal es uno de estos, se pide matrícula
const FORM_OFICIOS_CON_MATRICULA = ["Electricidad", "Gas", "Termotanques y calefones",
  "Cocinas y hornos", "Calefactores y estufas", "Control de plagas"];

/*
  "¿Dónde atendés?": tres tarjetas, se elige una.
  - valor: lo que se manda a Google (tiene que ser IGUAL a la opción del Google Form)
  - titulo y texto: lo que ve la persona
  - ayudaLocalidades: cómo cambia la ayuda de "Localidades" según lo elegido
*/
const FORM_DONDE_ATIENDE = [
  { valor: "A domicilio",       titulo: "A domicilio",          texto: "Voy a la casa del vecino.",
    ayudaLocalidades: "Marcá dónde trabajás." },
  { valor: "En taller o local", titulo: "En mi taller o local", texto: "El vecino me trae el trabajo o el aparato.",
    ayudaLocalidades: "Marcá la localidad de tu taller y las zonas de donde te pueden traer trabajos." },
  { valor: "Las dos",           titulo: "Las dos",              texto: "Según el trabajo.",
    ayudaLocalidades: "Marcá dónde trabajás." },
];

// Localidades por tramo, de norte a sur: el mismo orden que en "Dónde estamos"
// (como se ven en el mapa, con el norte arriba)
const FORM_TRAMOS = [
  { tramo: "Norte",  clase: "tramo--norte",  localidades: ["Ascochinga", "La Granja", "Agua de Oro", "El Manzano", "Salsipuedes"] },
  { tramo: "Centro", clase: "tramo--centro", localidades: ["Río Ceballos", "Unquillo"] },
  { tramo: "Sur",    clase: "tramo--sur",    localidades: ["Mendiolaza", "Villa Allende", "Saldán", "La Calera"] },
];
