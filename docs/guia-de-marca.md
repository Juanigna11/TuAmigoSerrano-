<!-- Copia de la guía de marca (design system "Tu Amigo Serrano": https://claude.ai/artifact/AWrLYXWxBBJukoA2gkXjiL). Si cambia la guía, se actualiza este archivo. -->

# Tu Amigo Serrano — guía de marca

**Tu Amigo Serrano** conecta a los vecinos de las Sierras Chicas (Córdoba, Argentina) con trabajadores y técnicos de confianza de su zona, por WhatsApp. El vecino escribe, cuenta qué trabajo o arreglo necesita, y una persona le pasa 2 o 3 recomendados con su WhatsApp para que hable directo. Gratis y sin comisión, para vecinos y trabajadores.

Esta guía es la referencia para cualquier pieza nueva: la landing, la app de gestión, las cards, los carteles con QR, los posteos de Facebook y los textos del bot. Si una pieza contradice esta guía, gana la guía; si la guía quedó vieja, se actualiza acá primero.

> **Frase de marca:** *Tan fácil como preguntarle a un amigo.*
> **Bajada:** *Oficios y técnicos de Sierras Chicas, recomendados por tus vecinos.*

---

## 1. Esencia

- **Un amigo que conoce a alguien.** No somos una plataforma ni una app: somos el vecino que siempre tiene el número del plomero bueno. Todo tiene que sentirse cercano, simple y de confianza.
- **Una persona, no un sistema.** "Te responde una persona." Nunca "un asesor", "un agente" ni "el sistema".
- **De acá.** Las sierras, el valle, el sol de la tarde, los once pueblos. La marca se reconoce por el paisaje, no por adornos.
- **Recomendado de verdad.** Hablamos con cada trabajador y con un cliente que lo recomienda. La confianza es el producto.
- **Sin vueltas.** Gratis, sin comisión, sin apps ni registros. Lo usás como cualquier chat.

## 2. Voz y textos

- **Castellano rioplatense con voseo:** "contanos", "escribinos", "sumate", "¿qué necesitás?". Nunca "tú" ni "usted".
- **Frases cortas, verbo primero en los botones:** "Pedir un trabajador por WhatsApp", "Soy trabajador", "Quiero sumarme", "Escribinos".
- **Rubros:** se nombran solo los prioritarios (jardineros, albañiles, pintores, plomeros, electricistas, técnicos que arreglan lavarropas, heladeras, aires…) y se cierra con **"¡y mucho más!"** para no limitar. La lista oficial está en el catálogo de rubros del proyecto.
- **Las 11 localidades, en 3 tramos:** Sur (La Calera, Saldán, Villa Allende, Mendiolaza) · Centro (Unquillo, Río Ceballos) · Norte (Salsipuedes, El Manzano, Agua de Oro, La Granja, Ascochinga).
- **No decir:** "grupo" de trabajadores o de WhatsApp (todo es por privado), comercios o "Punto Amigo" en la web (a los comercios se los suma en persona), "asesor", "plataforma", "usuarios".
- **Mensajes de WhatsApp desde la web** empiezan con "Hola! Vengo de la web." y siguen con el pedido ("Necesito un electricista").

| Así sí | Así no |
|---|---|
| Contanos por WhatsApp qué necesitás y te pasamos trabajadores de tu zona. | Ingresá tu solicitud y nuestro sistema te asignará un profesional. |
| Te responde una persona. | Un asesor se comunicará a la brevedad. |
| Gratis y sin comisión. | ¡¡Servicio 100% GRATUITO!! |

## 3. Color

Base azul (el cielo y las sierras de noche), verdes de la sierra y **un solo acento amarillo: el sol**.

- **Azul noche** (`azul-noche`) es el color principal: header, hero, logo. Sobre azul, el texto va en `blanco` y lo secundario en `celeste-niebla`.
- **Botones en verde serrano** (`verde-serrano`, texto `blanco`, hover `verde-serrano-hover`). Sobre fondos azules llevan un borde de 2 px `verde-loma`. Sobre un bloque verde se invierten: fondo `blanco`, texto `verde-serrano`.
- **El amarillo es el sol** (`amarillo-sol`): el sol del logo, el del hero, las estrellas y el sello "Trabajador recomendado". **Nunca** en botones, links ni fondos grandes.
- **Verde WhatsApp** (`verde-whatsapp`) solo en lo que abre o nombra WhatsApp.
- **Colores de tramo:** Sur `azul-lago` · Centro `verde-serrano` · Norte `verde-loma` (`verde-loma-texto` sobre blanco).
- **Secciones:** se alternan blanco, `gris-niebla` y bloques de color (hero azul noche, "¿Qué necesitás?" en verde serrano, footer `azul-profundo`).
- **Rojo de error** (`rojo-error`, agregado 23/11) **solo** para marcar errores en formularios: borde del campo y mensaje al lado. Nunca en botones, títulos ni fondos.
- **Contraste:** `verde-loma` y `amarillo-sol` no van como texto sobre blanco. El contorno de foco es `azul-lago` sobre claro y `amarillo-sol` sobre azul o verde (en el formulario de alta, `verde-serrano`).

## 4. Tipografía

- **Bricolage Grotesque 800** para el nombre y todos los títulos. Es la voz fuerte de la marca: compacta, con carácter, un poco artesanal.
- **Nunito Sans** (400, 600, 700) para todo lo demás: textos, botones, etiquetas. Redondeada y amable.
- Las dos se cargan desde Google Fonts (`display=swap`). Si no cargan, `system-ui`.
- Tamaños (crecen con la pantalla, con `clamp`): título del hero 36→52 px, títulos de sección 30→40 px, títulos de tarjeta 19→22 px, texto 17 px, texto chico 15 px.
- Oraciones en minúscula inicial (sentence case). El único texto en mayúsculas es el antetítulo chico "SIERRAS CHICAS · CÓRDOBA" en verde loma.

## 5. Forma

- **Redondeado y amable:** botones y chips en píldora (`radio-pildora`), tarjetas y campos con `radio-tarjeta` (16 px), fotos y bloques grandes con `radio-bloque` (28 px).
- **Chips de un solo estilo:** blancos con borde de 2 px `gris-niebla` (rubros, pueblos). Sobre verde serrano: blancos con texto verde serrano.
- **Sombras solo para lo que flota** sobre una foto (`sombra-flotante`): la card del trabajador y el pedido del hero. Las tarjetas comunes van planas.
- Todo lo que se toca mide al menos `area-tactil` (44 px).

## 6. Paisaje e imágenes

- **Las sierras** son el motivo de la marca: dos lomas superpuestas, `azul-loma` atrás y `verde-serrano` adelante, con el sol asomando. Aparecen al pie del hero y pueden cerrar otras piezas.
- **Fotos reales de la zona** (valles, arroyos, lago, luz dorada de la tarde), aportadas por Juan. Ver el grupo de assets *Fotos*.
- **Personas reales solo con su permiso.** La card de un trabajador real se muestra en público solo si él está de acuerdo. Los ejemplos inventados (como "Claudia") van sin foto: solo la inicial.
- Sin ilustraciones de personajes, mascotas ni íconos decorativos.

## 7. Movimiento

Minimalista: lo decorativo queda quieto salvo estos momentos, que cuentan algo:

1. **El sol sale** detrás de las lomas al cargar el hero (una vez, 2,4 s).
2. **Las sierras se ondulan** al scrollear: cada loma es una suma de ondas que se corren con el scroll; la de atrás más lenta. El sol se esconde al bajar.
3. **El pedido se conecta con la card:** en el hero aparecen en orden el pedido de Claudia, la línea punteada y la card del trabajador.
4. **La cinta de oficios** pasa despacio arriba de las sierras (45 s por vuelta) y se frena con el mouse o el teclado.
5. **El sol salta por "Cómo funciona":** recorre los pasos 1→2→3 en arco, atado al scroll, y pinta cada número de verde serrano.

Con "reducir movimiento" (`prefers-reduced-motion`) no se anima nada: todo aparece en su lugar.

## 8. Logo

**A serrana, versión noche:** una A en `verde-loma` que es una sierra con un sendero, y el sol `amarillo-sol` arriba a la derecha, sobre `azul-noche`. El sol siempre es amarillo. En la imagen de perfil va solo la A con el sol, sin texto. Variante del nombre: "Tu Amigo Serrano" en Bricolage 800 con la A del logo dentro de "Amigo" y el sol como punto final. Ver el grupo de assets *Logos*.

## 9. Componentes

- **Botón:** principal (verde serrano), secundario (contorno blanco sobre azul), invertido (sobre verde). Ver *Boton*.
- **Etiqueta:** el chip de rubros y pueblos, y su variante "¿No lo ves? Preguntanos". Ver *Etiqueta*.
- **Pedido:** el mensaje de un vecino en el chat de Tu Amigo Serrano. Ver *Pedido*.
- **Sellos:** "Trabajador recomendado" (amarillo) y "Todo por WhatsApp". Ver *Sello*.
- **Formulario** (alta de trabajadores en la landing): campos blancos con `radio-tarjeta` y borde `gris-niebla`, etiqueta visible arriba de cada campo, chips elegibles (elegido: `verde-serrano` con texto `blanco` y ✓), errores en `rojo-error` al lado del campo y botón principal a lo ancho.
- **Card del trabajador** (1080 × 1350): la genera la app de gestión desde la hoja Trabajadores. Encabezado azul noche con el nombre de la marca y el sello amarillo, foto redonda, nombre en Bricolage, oficio en chip celeste, cajas gris niebla con zonas, experiencia, disponibilidad y otros oficios, tres fotos de trabajos y la barra "Escribile por WhatsApp" en azul profundo.

## 10. Dónde se usa

| Pieza | Dónde está |
|---|---|
| Landing | https://tuamigoserrano.vercel.app (repo `Juanigna11/TuAmigoSerrano-`). Las variables CSS de `css/styles.css` usan los mismos nombres que esta guía (`--azul-noche`, `--verde-serrano`, `--radio-tarjeta`…). |
| Prompt para Claude Code | Doc del proyecto `claude/prompt-landing-claude-code.md`: los cambios pendientes de la landing. |
| App de gestión (Apps Script) | `Estilos.html`, botones en verde serrano. |
| Canvas de diseño | Perfil, cards, cartel, portadas y posteos de Facebook. |

**Para quien construya algo nuevo (persona o Claude):** leé esta guía primero, usá los tokens por su nombre y respetá las reglas de color (amarillo = sol) y de voz (voseo, una persona, sin "grupos"). Antes de inventar un color, un tamaño o una animación nueva, preguntale a Juan.

## Anexo: tokens

Valores exactos en `docs/tokens.json` (los mismos nombres que las variables de `css/styles.css`).
