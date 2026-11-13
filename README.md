# Tu Amigo Serrano · Landing page

Web pública de Tu Amigo Serrano, red de vecinos y trabajadores de las Sierras Chicas (Córdoba).
Su único objetivo: que el visitante toque un botón y abra un chat de WhatsApp.

HTML, CSS y JavaScript puros. Sin frameworks ni paso de compilación: lo que está en la carpeta es lo que se publica.

## Estructura

```
index.html            Toda la página (textos, secciones, links)
css/styles.css        Estilos. Arriba de todo están las variables de color y tipografía
js/config.js          Número de WhatsApp y mensajes precargados  ← lo único que hay que tocar para el número
js/main.js            Arma los links de WhatsApp desde config.js y maneja el botón flotante
img/logo.svg          Logo (la A serrana)
img/favicon.svg       Ícono de la pestaña (logo sobre círculo azul)
img/og.png            Imagen que aparece al compartir el link (1200 × 630)
herramientas/og.html  Fuente de og.png (no es parte de la web)
```

## Cambiar el número de WhatsApp

Abrí `js/config.js` y cambiá dos líneas:

```js
const NUMERO_WHATSAPP = "5493511234567";  // para los links: 54 + 9 + área sin 0 + número sin 15
const NUMERO_VISIBLE  = "351 123 4567";   // como se lee en el footer
```

Todos los botones se actualizan solos.

Opcional, pero recomendado: en `index.html` cada link de WhatsApp también tiene el `href` escrito completo,
como respaldo por si JavaScript no carga. Para actualizarlos, usá "Buscar y reemplazar" en el editor:
`549351XXXXXXX` → el número nuevo, y `351 XXX XXXX` → el número visible.

Para cambiar un mensaje precargado, editá el objeto `MENSAJES_WHATSAPP` en el mismo archivo.
La clave (`vecino`, `trabajador`…) es la que usa el HTML en `data-wa="..."`.

## Editar textos y localidades

- **Textos:** están todos en `index.html`, ordenados por sección con comentarios (`1. HEADER`, `2. HERO`…).
- **Localidades:** en la sección `6. DÓNDE ESTAMOS`, una por línea:
  ```html
  <li>Ascochinga</li>
  <li>Nueva localidad</li>   ← copiar una línea y cambiar el nombre
  ```
  Los puntos "·" entre nombres los pone el CSS solo.
- **Oficios:** igual, en `4. OFICIOS` (`<li class="etiqueta">Nuevo oficio</li>`).
- **Colores:** en `css/styles.css`, bloque `:root` al principio.

## Ver la página en la compu

Abrí `index.html` con doble clic. Para probarla como si estuviera publicada, desde esta carpeta:

```
python -m http.server 5500
```

y entrá a http://localhost:5500

## Publicar

### GitHub Pages (gratis)

1. Entrá a https://github.com/new, poné de nombre `tu-amigo-serrano`, dejalo **Public** y **no** marques "Add a README". Tocá **Create repository**.
2. En la terminal, dentro de esta carpeta (cambiá `TU-USUARIO`):
   ```
   git remote add origin https://github.com/TU-USUARIO/tu-amigo-serrano.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages**. En "Build and deployment", Source: **Deploy from a branch**; Branch: **main** y carpeta **/ (root)**. **Save**.
4. En uno o dos minutos la página queda en `https://TU-USUARIO.github.io/tu-amigo-serrano/`.
5. Copiá esa dirección y en `index.html` reemplazá `https://TU-DOMINIO` (está en las etiquetas `og:url` y `og:image`) por ella, sin la barra final. Así la imagen aparece al compartir el link.

### Netlify (alternativa, arrastrando la carpeta)

1. Entrá a https://app.netlify.com/drop (te pide crear una cuenta gratis).
2. Arrastrá **esta carpeta entera** a la página.
3. Te da una dirección tipo `https://nombre-raro.netlify.app`. En **Site configuration → Change site name** podés cambiarla por algo como `tuamigoserrano.netlify.app`.
4. Igual que en GitHub: reemplazá `https://TU-DOMINIO` en `index.html` por esa dirección y volvé a subir.

## Volver a publicar después de un cambio

- **GitHub Pages:**
  ```
  git add .
  git commit -m "Describí qué cambiaste"
  git push
  ```
  Se actualiza sola en uno o dos minutos.
- **Netlify:** en tu sitio, pestaña **Deploys**, arrastrá la carpeta de nuevo.

> WhatsApp y Facebook guardan en memoria la vista previa del link. Si cambiaste la imagen o el título y no se actualiza,
> pegá la dirección en https://developers.facebook.com/tools/debug/ y tocá "Scrape Again".

## Regenerar la imagen para compartir (og.png)

Editá `herramientas/og.html`, levantá el servidor local (ver arriba) y abrí
`http://localhost:5500/herramientas/og.html` en Chrome o Edge con la ventana en 1200 × 630.
Desde la terminal (PowerShell) también se puede capturar directo:

```
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=8000 --screenshot="img/og.png" http://localhost:5500/herramientas/og.html
```
