/* =========================================================
   CONFIGURACIÓN DE WHATSAPP
   ---------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para cambiar
   el número o los mensajes precargados.
   main.js lee estas constantes y arma todos los links.
   ========================================================= */

/*
  Número en formato internacional, SIN "+", sin espacios ni guiones.
  Argentina = 54, celular = 9, después código de área sin 0 y número sin 15.
  Ejemplo: 351 123 4567  →  5493511234567
*/
const NUMERO_WHATSAPP = "5493543691050";

/*
  Cómo se muestra el número escrito en la página (footer).
  Es solo texto para leer: no se usa para armar los links.
*/
const NUMERO_VISIBLE = "3543 691050";

/*
  Mensajes que le llegan escritos al vecino en el chat.
  La clave (general, vecino, etc.) es la misma que se usa en el HTML
  con el atributo data-wa="...".
  Todos empiezan con "Hola! Vengo de la web" para poder contar
  cuántas personas llegan desde la landing.
*/
const MENSAJES_WHATSAPP = {
  general: "Hola! Vengo de la web",
  vecino: "Hola! Vengo de la web. Necesito a alguien para un trabajo",
  trabajador: "Hola! Vengo de la web. Quiero ofrecer mis servicios",
  comercio: "Hola! Vengo de la web. Tengo un comercio en la zona",
};
