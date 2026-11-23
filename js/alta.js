/* =========================================================
   ALTA.JS · Formulario "Sumate gratis"
   ---------------------------------------------------------
   1. Arma el desplegable y los chips con las listas de config.js
   2. Muestra "Matrícula" solo si el oficio la pide
   3. Valida todo en el navegador y marca cada error al lado del campo
   4. Envía las respuestas al Google Form con fetch()
   5. Muestra "¡Listo!" o, si falla, otras formas de mandar los datos

   CÓMO FUNCIONA EL ENVÍO (la parte de "consumir una API")
   -------------------------------------------------------
   Un Google Form, por dentro, es una dirección que recibe datos:
   .../formResponse. Cuando alguien lo completa en Google, el navegador
   le manda un POST con pares "código = respuesta", por ejemplo
   entry.454062258 = "Juan Pérez". Nosotros hacemos lo mismo desde la
   landing, con nuestro propio diseño:

   - FormData: una "bolsa" de pares nombre/valor, como los campos de un
     formulario. Con append() se puede repetir el mismo nombre: así se
     mandan las casillas múltiples (una vez por cada localidad).

   - fetch(url, { method: "POST", body: datos }): manda la bolsa a Google.

   - mode: "no-cors": Google no autoriza a otras páginas a LEER sus
     respuestas (no manda el permiso llamado CORS). Con "no-cors" el
     navegador igual entrega los datos, pero nos devuelve una respuesta
     "opaca": no podemos saber si Google la aceptó.
     Por eso validamos TODO antes de enviar: si una opción no coincide
     letra por letra o falta algo obligatorio, Google la descarta en
     silencio y nunca nos enteraríamos.

   - fetch solo "tira error" (catch) si no pudo salir el pedido: sin
     conexión, por ejemplo. En ese caso ofrecemos WhatsApp y el Google
     Form común, sin borrar lo que la persona escribió.
   ========================================================= */

const formAlta = document.getElementById("form-alta");

if (formAlta) {
  const campos = formAlta.elements;                 // acceso a cada campo por su "name"
  const selectOficio = document.getElementById("campo-oficio");
  const contOtros = formAlta.querySelector('[data-chips="otros"]');
  const contLocalidades = formAlta.querySelector('[data-chips="localidades"]');
  const bloqueMatricula = document.getElementById("bloque-matricula");
  const botonEnviar = formAlta.querySelector(".formulario__enviar");
  const avisoFallo = document.getElementById("alta-fallo");
  const cartelListo = document.getElementById("alta-listo");

  // El link al Google Form común sale de config.js
  formAlta.querySelectorAll("[data-form-publico]").forEach(function (enlace) {
    enlace.href = FORM_PUBLICO;
  });


  /* ---------- 1. Armar opciones desde config.js ---------- */

  /**
   * Crea un chip: una casilla (checkbox) real, escondida a la vista
   * pero no para el teclado ni el lector de pantalla, y un <span>
   * con el aspecto de etiqueta. Al tocar el <label> se marca la casilla.
   */
  function crearChip(nombre, valor) {
    const label = document.createElement("label");
    label.className = "chip-opcion";
    const casilla = document.createElement("input");
    casilla.type = "checkbox";
    casilla.name = nombre;
    casilla.value = valor;                          // textContent/value: nunca interpreta HTML
    const texto = document.createElement("span");
    texto.textContent = valor;
    label.append(casilla, texto);
    return label;
  }

  FORM_RUBROS.forEach(function (grupo) {
    // Desplegable: un <optgroup> por categoría
    const optgroup = document.createElement("optgroup");
    optgroup.label = grupo.categoria;
    grupo.oficios.forEach(function (oficio) {
      optgroup.append(new Option(oficio, oficio));
    });
    selectOficio.append(optgroup);

    // Chips de "Otros oficios", con el nombre de la categoría arriba
    const bloque = document.createElement("div");
    bloque.className = "chips-grupo";
    const titulo = document.createElement("p");
    titulo.className = "chips-grupo__titulo";
    titulo.textContent = grupo.categoria;
    const lista = document.createElement("div");
    lista.className = "chips";
    grupo.oficios.forEach(function (oficio) {
      lista.append(crearChip("otros", oficio));
    });
    bloque.append(titulo, lista);
    contOtros.append(bloque);
  });

  FORM_TRAMOS.forEach(function (grupo) {
    const bloque = document.createElement("div");
    bloque.className = "chips-grupo " + grupo.clase;   // la clase trae el color del tramo
    const cabeza = document.createElement("div");
    cabeza.className = "chips-grupo__cabeza";
    const titulo = document.createElement("p");
    titulo.className = "chips-grupo__titulo tramo__nombre";
    titulo.textContent = "Tramo " + grupo.tramo;

    // Botón "Todo el tramo": marca todas las localidades del grupo
    // (si ya estaban todas marcadas, las desmarca)
    const botonTodo = document.createElement("button");
    botonTodo.type = "button";
    botonTodo.className = "chips-grupo__todo";
    botonTodo.textContent = "Todo el tramo";
    botonTodo.setAttribute("aria-pressed", "false");
    botonTodo.setAttribute("aria-label", "Todo el tramo " + grupo.tramo);
    cabeza.append(titulo, botonTodo);

    const lista = document.createElement("div");
    lista.className = "chips";
    grupo.localidades.forEach(function (localidad) {
      lista.append(crearChip("localidades", localidad));
    });

    function actualizarBotonTodo() {
      const casillas = lista.querySelectorAll("input");
      const todas = Array.from(casillas).every(function (c) { return c.checked; });
      botonTodo.setAttribute("aria-pressed", todas ? "true" : "false");
    }
    botonTodo.addEventListener("click", function () {
      const marcar = botonTodo.getAttribute("aria-pressed") !== "true";
      lista.querySelectorAll("input").forEach(function (c) { c.checked = marcar; });
      actualizarBotonTodo();
      // Avisamos que cambiaron, para que se borre el error si había
      lista.dispatchEvent(new Event("change", { bubbles: true }));
    });
    lista.addEventListener("change", actualizarBotonTodo);

    bloque.append(cabeza, lista);
    contLocalidades.append(bloque);
  });


  /* ---------- 2. Matrícula y oficio principal ---------- */

  // Devuelve los valores marcados de un grupo de casillas
  function elegidos(nombre) {
    return Array.from(formAlta.querySelectorAll('input[name="' + nombre + '"]:checked'))
      .map(function (casilla) { return casilla.value; });
  }

  function pideMatricula() {
    const oficios = [selectOficio.value].concat(elegidos("otros"));
    return oficios.some(function (oficio) { return FORM_OFICIOS_CON_MATRICULA.includes(oficio); });
  }

  function actualizarOficios() {
    // El oficio principal no aparece en "Otros oficios" (sería repetirlo)
    contOtros.querySelectorAll("input").forEach(function (casilla) {
      const esElPrincipal = casilla.value === selectOficio.value;
      if (esElPrincipal) casilla.checked = false;
      casilla.closest(".chip-opcion").hidden = esElPrincipal;
    });
    bloqueMatricula.hidden = !pideMatricula();
  }
  selectOficio.addEventListener("change", actualizarOficios);
  contOtros.addEventListener("change", actualizarOficios);


  /* ---------- 3. Validación ---------- */

  /**
   * Deja solo los números, saca el 0 del principio y devuelve
   * el número si quedan 10 dígitos; si no, devuelve null.
   * "0 3543 12-3456" → "3543123456"
   */
  function limpiarTelefono(texto) {
    let numeros = texto.replace(/\D/g, "");          // \D = todo lo que NO es un dígito
    if (numeros.startsWith("0")) numeros = numeros.slice(1);
    return numeros.length === 10 ? numeros : null;
  }

  // Muestra (o borra, si mensaje es "") el error de un campo
  function marcarError(idError, campo, mensaje) {
    const parrafo = document.getElementById(idError);
    parrafo.textContent = mensaje;
    parrafo.hidden = !mensaje;
    // aria-invalid: el lector de pantalla anuncia "inválido" en ese campo
    if (campo) campo.setAttribute("aria-invalid", mensaje ? "true" : "false");
  }

  const TEL_ERROR = "Poné un teléfono con característica: 10 números.";

  /*
    Cada regla revisa un campo y devuelve el mensaje de error, o "" si está bien.
    Están en el orden en que aparecen en la pantalla: así el primer error
    que encontramos es el primero que ve la persona.
  */
  const reglas = [
    { error: "error-nombre", campo: campos.nombre, revisar: function () {
      return campos.nombre.value.trim().length >= 3 ? "" : "Poné tu nombre y apellido.";
    } },
    { error: "error-whatsapp", campo: campos.whatsapp, revisar: function () {
      return limpiarTelefono(campos.whatsapp.value) ? "" : "Poné tu WhatsApp con característica: 10 números.";
    } },
    { error: "error-oficio", campo: selectOficio, revisar: function () {
      return selectOficio.value ? "" : "Elegí tu oficio principal.";
    } },
    { error: "error-experiencia", campo: campos.experiencia, revisar: function () {
      const texto = campos.experiencia.value.trim();
      const anios = Number(texto);
      const valido = texto !== "" && Number.isInteger(anios) && anios >= 0 && anios <= 60;
      return valido ? "" : "Poné cuántos años de experiencia tenés, de 0 a 60.";
    } },
    { error: "error-localidades", campo: null, foco: function () {
      return contLocalidades.querySelector("input");
    }, revisar: function () {
      return elegidos("localidades").length ? "" : "Elegí al menos una localidad.";
    } },
    { error: "error-disponibilidad", campo: campos.disponibilidad, revisar: function () {
      return campos.disponibilidad.value.trim() ? "" : "Contanos qué días y horarios podés trabajar.";
    } },
    { error: "error-matricula", campo: campos.matricula, revisar: function () {
      if (!pideMatricula()) return "";
      return campos.matricula.value.trim() ? "" : "Tu oficio pide matrícula: poné el número.";
    } },
    { error: "error-ref1-nombre", campo: campos.ref1Nombre, revisar: function () {
      return campos.ref1Nombre.value.trim() ? "" : "Poné el nombre de un cliente que te recomiende.";
    } },
    { error: "error-ref1-telefono", campo: campos.ref1Telefono, revisar: function () {
      return limpiarTelefono(campos.ref1Telefono.value) ? "" : TEL_ERROR;
    } },
    // La referencia 2 es opcional, pero si empezás a completarla, va entera
    { error: "error-ref2-nombre", campo: campos.ref2Nombre, revisar: function () {
      const conTelefono = campos.ref2Telefono.value.trim() !== "";
      return conTelefono && !campos.ref2Nombre.value.trim() ? "Poné el nombre de esta referencia." : "";
    } },
    { error: "error-ref2-telefono", campo: campos.ref2Telefono, revisar: function () {
      const texto = campos.ref2Telefono.value.trim();
      const conNombre = campos.ref2Nombre.value.trim() !== "";
      if (!texto && !conNombre) return "";
      return limpiarTelefono(texto) ? "" : TEL_ERROR;
    } },
    { error: "error-reglas", campo: campos.reglas, revisar: function () {
      return campos.reglas.checked ? "" : "Para sumarte tenés que aceptar las reglas.";
    } },
  ];

  /**
   * Revisa todas las reglas, muestra los errores y devuelve
   * el elemento donde poner el foco (el primero con error) o null.
   */
  function validar() {
    let primero = null;
    reglas.forEach(function (regla) {
      const mensaje = regla.revisar();
      marcarError(regla.error, regla.campo, mensaje);
      if (mensaje && !primero) primero = regla.foco ? regla.foco() : regla.campo;
    });
    return primero;
  }

  // Después del primer intento, cada cambio vuelve a revisar: así el error
  // se borra apenas la persona lo corrige (y no antes de que intente enviar).
  let yaIntento = false;
  formAlta.addEventListener("input", function () { if (yaIntento) validar(); });
  formAlta.addEventListener("change", function () { if (yaIntento) validar(); });


  /* ---------- 4. Envío ---------- */

  // "Nombre – 3543123456" (o "" si la referencia está vacía)
  function unirReferencia(nombre, telefono) {
    if (!nombre.value.trim()) return "";
    return nombre.value.trim() + " – " + limpiarTelefono(telefono.value);
  }

  function armarDatos() {
    const datos = new FormData();
    datos.append(FORM_CAMPOS.nombre, campos.nombre.value.trim());
    datos.append(FORM_CAMPOS.whatsapp, limpiarTelefono(campos.whatsapp.value));
    datos.append(FORM_CAMPOS.oficio, selectOficio.value);
    // Casillas múltiples: el MISMO código una vez por cada opción elegida
    elegidos("otros").forEach(function (oficio) {
      datos.append(FORM_CAMPOS.otrosOficios, oficio);
    });
    elegidos("localidades").forEach(function (localidad) {
      datos.append(FORM_CAMPOS.localidades, localidad);
    });
    datos.append(FORM_CAMPOS.experiencia, String(Number(campos.experiencia.value)));
    datos.append(FORM_CAMPOS.disponibilidad, campos.disponibilidad.value.trim());
    if (pideMatricula()) {
      datos.append(FORM_CAMPOS.matricula, campos.matricula.value.trim());
    }
    datos.append(FORM_CAMPOS.referencia1, unirReferencia(campos.ref1Nombre, campos.ref1Telefono));
    const referencia2 = unirReferencia(campos.ref2Nombre, campos.ref2Telefono);
    if (referencia2) datos.append(FORM_CAMPOS.referencia2, referencia2);
    datos.append(FORM_CAMPOS.reglas, FORM_ACEPTO_REGLAS);
    return datos;
  }

  // Reemplaza el formulario por el mensaje de "¡Listo!"
  function mostrarListo() {
    const primerNombre = campos.nombre.value.trim().split(/\s+/)[0];
    cartelListo.querySelector("p").textContent =
      "¡Listo, " + primerNombre + "! Te vamos a escribir por WhatsApp para coordinar una charla corta.";
    formAlta.hidden = true;
    cartelListo.hidden = false;
    cartelListo.focus();
  }

  formAlta.addEventListener("submit", async function (evento) {
    // Sin esto, el navegador recargaría la página al enviar
    evento.preventDefault();
    yaIntento = true;
    avisoFallo.hidden = true;

    const primerError = validar();
    if (primerError) {
      primerError.focus();
      return;
    }

    // Campo trampa lleno = robot. No mandamos nada, pero mostramos
    // "¡Listo!" igual para que el robot no se dé cuenta.
    if (campos.sitio.value) {
      mostrarListo();
      return;
    }

    botonEnviar.disabled = true;
    botonEnviar.textContent = "Enviando…";

    try {
      // await: espera a que el pedido salga antes de seguir con la línea de abajo
      await fetch(FORM_ACTION, { method: "POST", mode: "no-cors", body: armarDatos() });
      mostrarListo();
    } catch (error) {
      // No se pudo mandar (sin conexión, por ejemplo). Lo escrito queda como estaba.
      console.error("No se pudo enviar el formulario de alta:", error);
      avisoFallo.hidden = false;
      botonEnviar.disabled = false;
      botonEnviar.textContent = "Quiero sumarme";
    }
  });
}
